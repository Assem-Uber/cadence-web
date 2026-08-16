import { CADENCE_AUTH_COOKIE_NAME } from '@/utils/auth/auth.constants';
import {
  type CookieReader,
  type PrivateAuthContext,
} from '@/utils/auth/auth.types';
import { splitGroupList } from '@/utils/auth/authorization/split-group-list';
import { decodeCadenceJwtClaims } from '@/utils/auth/helpers/decode-cadence-jwt-claims';

export async function resolveJwtAuthContext(
  cookies: CookieReader
): Promise<PrivateAuthContext> {
  const tokenFromCookie = cookies.get(CADENCE_AUTH_COOKIE_NAME)?.value?.trim();
  const token = tokenFromCookie || undefined;

  const claims = token ? decodeCadenceJwtClaims(token) : undefined;
  const isInvalidToken = token !== undefined && claims === undefined;
  const expiresAtMsRaw =
    typeof claims?.exp === 'number' ? claims.exp * 1000 : undefined;
  const isExpired =
    expiresAtMsRaw !== undefined && Date.now() >= expiresAtMsRaw;
  const shouldDropToken = isInvalidToken || isExpired;
  const effectiveClaims = shouldDropToken ? undefined : claims;
  const expiresAtMs = shouldDropToken ? undefined : expiresAtMsRaw;
  const effectiveToken = shouldDropToken ? undefined : token;

  const groups = effectiveClaims?.groups
    ? splitGroupList(effectiveClaims.groups)
    : [];
  const id = effectiveClaims?.sub || effectiveClaims?.name || undefined;
  const userName = effectiveClaims?.name || effectiveClaims?.sub || undefined;
  const isAdmin = effectiveClaims?.admin === true;

  return {
    authEnabled: true,
    auth: {
      isValidToken: Boolean(effectiveToken),
      token: effectiveToken,
      expiresAtMs,
    },
    groups,
    isAdmin,
    userName,
    id,
  };
}
