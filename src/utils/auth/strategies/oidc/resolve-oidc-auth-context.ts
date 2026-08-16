import 'server-only';

// TODO(cadence-backend): temporary web-side claim decode for UI hints.
// ponytail: claim mapping mirrors Cadence JMESPath config today; a backend
// introspection RPC should replace web-side decode when available server-side.
import {
  DEFAULT_OIDC_CLAIM_MAPPING,
  OIDC_SESSION_COOKIE_MAX_AGE_SECONDS,
} from '@/utils/auth/auth.constants';
import {
  type CookieReader,
  type PrivateAuthContext,
} from '@/utils/auth/auth.types';
import getConfigValue from '@/utils/config/get-config-value';

import { getJwtExpiresAtMs, mapSessionClaims } from './oidc-claim-mapper';
import { readOidcSessionCookie } from './oidc-cookies';
import { decryptOidcSession } from './oidc-session';

export async function resolveOidcAuthContext(
  cookieStore: CookieReader
): Promise<PrivateAuthContext> {
  const oidcConfig = await getConfigValue('OIDC_AUTH_CONFIG');
  if (!oidcConfig) {
    return emptyOidcAuthContext(true);
  }

  const sessionToken = readOidcSessionCookie(cookieStore)?.trim();

  if (!sessionToken) {
    return emptyOidcAuthContext(true);
  }

  const session = await decryptOidcSession(
    sessionToken,
    oidcConfig.sessionSecret
  );
  if (!session) {
    return emptyOidcAuthContext(true);
  }

  const expiresAtMs =
    session.expiresAtMs || getJwtExpiresAtMs(session.accessToken);
  if (expiresAtMs !== undefined && Date.now() >= expiresAtMs) {
    return emptyOidcAuthContext(true);
  }

  // Claims are best-effort UI hints; an unmappable (e.g. opaque) access token
  // does not invalidate the session — the Cadence backend enforces access.
  const mappedClaims = mapSessionClaims(session, DEFAULT_OIDC_CLAIM_MAPPING);

  // Refresh only helps while the absolute session ceiling (login time + max
  // age, mirrored in recover-oidc-session) leaves room to extend the expiry.
  const sessionCeilingMs =
    session.authenticatedAtMs + OIDC_SESSION_COOKIE_MAX_AGE_SECONDS * 1000;
  const canRefresh =
    Boolean(session.refreshToken) &&
    (expiresAtMs === undefined || expiresAtMs < sessionCeilingMs);

  return {
    authEnabled: true,
    auth: {
      isValidToken: true,
      token: session.accessToken,
      expiresAtMs,
      canRefresh,
    },
    groups: mappedClaims.groups,
    isAdmin: mappedClaims.isAdmin,
    userName: mappedClaims.userName,
    id: mappedClaims.id,
    pictureUrl: mappedClaims.pictureUrl,
  };
}

function emptyOidcAuthContext(authEnabled: boolean): PrivateAuthContext {
  return {
    authEnabled,
    auth: {
      isValidToken: false,
    },
    groups: [],
    isAdmin: false,
  };
}
