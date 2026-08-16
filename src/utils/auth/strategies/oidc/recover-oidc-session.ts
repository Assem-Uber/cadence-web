import 'server-only';

import * as client from 'openid-client';

import { OIDC_SESSION_COOKIE_MAX_AGE_SECONDS } from '@/utils/auth/auth.constants';
import {
  type AuthFailureContext,
  type AuthRecoveryOutcome,
  type CookieReader,
} from '@/utils/auth/auth.types';
import getConfigValue from '@/utils/config/get-config-value';

import { buildOidcLoginPath } from './build-oidc-login-path';
import { getTokenResponseExpiresAtMs } from './oidc-claim-mapper';
import { getOidcClientConfiguration } from './oidc-client';
import { readOidcSessionCookie } from './oidc-cookies';
import { decryptOidcSession, encryptOidcSession } from './oidc-session';

function redirectOutcome(
  ctx: AuthFailureContext,
  clearSession: boolean
): AuthRecoveryOutcome {
  return {
    result: {
      kind: 'redirect',
      url: buildOidcLoginPath(ctx.returnTo, ctx.notice),
    },
    clearSession,
  };
}

export async function recoverOidcSession(
  cookieStore: CookieReader,
  ctx: AuthFailureContext
): Promise<AuthRecoveryOutcome> {
  const authStrategy = await getConfigValue('CADENCE_WEB_AUTH_STRATEGY');
  const oidcConfig = await getConfigValue('OIDC_AUTH_CONFIG');
  if (authStrategy !== 'oidc' || !oidcConfig) {
    return { result: { kind: 'noop' } };
  }

  const sessionToken = readOidcSessionCookie(cookieStore)?.trim();
  if (!sessionToken) {
    return redirectOutcome(ctx, false);
  }

  const session = await decryptOidcSession(
    sessionToken,
    oidcConfig.sessionSecret
  );
  if (!session?.refreshToken) {
    return redirectOutcome(ctx, true);
  }

  // Absolute session ceiling: refresh never extends a session past login
  // time + max age; the user must re-authenticate with the IdP.
  const sessionCeilingMs =
    session.authenticatedAtMs + OIDC_SESSION_COOKIE_MAX_AGE_SECONDS * 1000;
  if (Date.now() >= sessionCeilingMs) {
    return redirectOutcome(ctx, true);
  }

  try {
    const openidConfig = await getOidcClientConfiguration(oidcConfig);
    const tokens = await client.refreshTokenGrant(
      openidConfig,
      session.refreshToken
    );

    const accessToken = tokens.access_token;
    if (!accessToken) {
      return redirectOutcome(ctx, true);
    }

    const tokenExpiresAtMs = getTokenResponseExpiresAtMs(tokens);
    if (tokenExpiresAtMs === undefined) {
      return redirectOutcome(ctx, true);
    }

    const oidcSessionToken = await encryptOidcSession(
      {
        accessToken,
        refreshToken: tokens.refresh_token ?? session.refreshToken,
        expiresAtMs: Math.min(tokenExpiresAtMs, sessionCeilingMs),
        idToken: tokens.id_token ?? session.idToken,
        authenticatedAtMs: session.authenticatedAtMs,
      },
      oidcConfig.sessionSecret,
      OIDC_SESSION_COOKIE_MAX_AGE_SECONDS
    );

    return {
      result: { kind: 'recovered' },
      oidcSessionToken,
    };
  } catch {
    return redirectOutcome(ctx, true);
  }
}
