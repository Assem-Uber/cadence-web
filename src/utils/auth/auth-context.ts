import 'server-only';

import {
  cookies as getRequestCookies,
  headers as getRequestHeaders,
} from 'next/headers';

import { type GRPCMetadata } from '@/utils/grpc/grpc-service';

import {
  type AuthRequest,
  type PrivateAuthContext,
  type PublicSessionContext,
} from './auth.types';
import { getGrpcMetadataFromAuth } from './helpers/grpc-auth-metadata';
import { resolveAuthStrategy } from './strategies/resolve-auth-strategy';

function getCurrentRequestAuthRequest(): AuthRequest {
  return { cookies: getRequestCookies(), headers: getRequestHeaders() };
}

export async function resolveAuthContext(
  request?: AuthRequest
): Promise<PrivateAuthContext> {
  const strategy = await resolveAuthStrategy();
  return strategy.server.resolveContext(
    request ?? getCurrentRequestAuthRequest()
  );
}

/**
 * Outbound Cadence gRPC metadata for a resolved context. Delegates to the
 * active strategy's `getGrpcMetadata` when it defines one (e.g.
 * trusted-header mapping configured headers), otherwise falls back to the
 * default cadence-authorization-from-token behavior.
 */
export async function resolveGrpcMetadataForAuth(
  authContext: PrivateAuthContext | null | undefined,
  request?: AuthRequest
): Promise<GRPCMetadata | undefined> {
  if (!authContext) {
    return undefined;
  }

  const strategy = await resolveAuthStrategy();
  if (strategy.server.getGrpcMetadata) {
    return strategy.server.getGrpcMetadata(
      authContext,
      request ?? getCurrentRequestAuthRequest()
    );
  }
  return getGrpcMetadataFromAuth(authContext);
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
