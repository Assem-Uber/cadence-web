import 'server-only';

import { cookies as getRequestCookies } from 'next/headers';

import {
  type CookieReader,
  type PrivateAuthContext,
  type PublicSessionContext,
} from './auth.types';
import { resolveAuthStrategy } from './strategies/resolve-auth-strategy';

export async function resolveAuthContext(
  cookieStore?: CookieReader
): Promise<PrivateAuthContext> {
  const strategy = await resolveAuthStrategy();
  return strategy.server.resolveContext(cookieStore ?? getRequestCookies());
}

// Explicit allowlist so newly added private fields never leak to the browser.
export const getPublicAuthContext = (
  authContext: PrivateAuthContext
): PublicSessionContext => ({
  authEnabled: authContext.authEnabled,
  auth: {
    isValidToken: authContext.auth.isValidToken,
    expiresAtMs: authContext.auth.expiresAtMs,
    canRefresh: authContext.auth.canRefresh,
  },
});

export { getGrpcMetadataFromAuth } from './helpers/grpc-auth-metadata';
export { decodeCadenceJwtClaims } from './helpers/decode-cadence-jwt-claims';
export { CADENCE_AUTH_COOKIE_NAME } from './auth.constants';
