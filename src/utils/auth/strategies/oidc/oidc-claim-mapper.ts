import {
  type MappedOidcClaims,
  type OidcClaimMappingConfig,
} from '@/utils/auth/auth.types';
import { splitGroupList } from '@/utils/auth/authorization/split-group-list';
import { decodeJwtPayload } from '@/utils/auth/helpers/decode-jwt-payload';

function decodeTokenPayload(
  token: string
): Record<string, unknown> | undefined {
  const parsed = decodeJwtPayload(token);
  if (parsed === undefined || typeof parsed !== 'object' || parsed === null) {
    return undefined;
  }
  return parsed as Record<string, unknown>;
}

function getClaimAtPath(
  payload: Record<string, unknown>,
  path: string
): unknown {
  return path.split('.').reduce<unknown>((value, key) => {
    if (typeof value !== 'object' || value === null) {
      return undefined;
    }
    return (value as Record<string, unknown>)[key];
  }, payload);
}

function toGroupList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter(
      (entry): entry is string => typeof entry === 'string' && entry.length > 0
    );
  }
  // Some providers emit groups as a single delimited string.
  if (typeof value === 'string') {
    return splitGroupList(value);
  }
  return [];
}

function getStringClaim(
  payload: Record<string, unknown>,
  key: string
): string | undefined {
  const value = payload[key];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

/**
 * Maps a single JWT's claims. Returns undefined when the token is not a JWT
 * (e.g. opaque access tokens) so callers can fall back to another source.
 */
export function mapTokenClaims(
  token: string,
  config: OidcClaimMappingConfig
): MappedOidcClaims | undefined {
  const payload = decodeTokenPayload(token);
  if (!payload) {
    return undefined;
  }

  const groups = Array.from(
    new Set(
      config.groupsClaims.flatMap((path) =>
        toGroupList(getClaimAtPath(payload, path))
      )
    )
  );

  const sub = getStringClaim(payload, 'sub');
  const preferredUsername = getStringClaim(payload, 'preferred_username');

  return {
    groups,
    isAdmin: groups.some((group) => config.adminRoles.includes(group)),
    id: sub ?? preferredUsername,
    userName: getStringClaim(payload, 'name') ?? preferredUsername ?? sub,
    pictureUrl: getStringClaim(payload, 'picture'),
  };
}

/**
 * Merges claims across the session's tokens. The ID token is preferred for
 * identity (it is spec-guaranteed to be a JWT and is signature-verified by
 * openid-client at exchange time); group claims are unioned because providers
 * differ on which token carries them. Always returns a result so sessions
 * with opaque access tokens remain valid — the Cadence backend is the
 * authorization enforcement point.
 */
export function mapSessionClaims(
  tokens: { accessToken: string; idToken?: string },
  config: OidcClaimMappingConfig
): MappedOidcClaims {
  const idClaims = tokens.idToken
    ? mapTokenClaims(tokens.idToken, config)
    : undefined;
  const accessClaims = mapTokenClaims(tokens.accessToken, config);

  const groups = Array.from(
    new Set([...(idClaims?.groups ?? []), ...(accessClaims?.groups ?? [])])
  );

  return {
    groups,
    isAdmin: groups.some((group) => config.adminRoles.includes(group)),
    id: idClaims?.id ?? accessClaims?.id,
    userName: idClaims?.userName ?? accessClaims?.userName,
    pictureUrl: idClaims?.pictureUrl ?? accessClaims?.pictureUrl,
  };
}

/** Fallback expiry source for JWT access tokens; opaque tokens return undefined. */
export function getJwtExpiresAtMs(token: string): number | undefined {
  const payload = decodeTokenPayload(token);
  if (typeof payload?.exp !== 'number') {
    return undefined;
  }
  return payload.exp * 1000;
}

/**
 * Session expiry from a token endpoint response. Prefers the standard
 * expires_in field (works with opaque access tokens); falls back to the
 * access token's exp claim when the provider omits expires_in.
 */
export function getTokenResponseExpiresAtMs(tokens: {
  access_token?: string;
  expiresIn: () => number | undefined;
}): number | undefined {
  const expiresInSeconds = tokens.expiresIn();
  if (expiresInSeconds !== undefined) {
    return Date.now() + expiresInSeconds * 1000;
  }
  return tokens.access_token
    ? getJwtExpiresAtMs(tokens.access_token)
    : undefined;
}
