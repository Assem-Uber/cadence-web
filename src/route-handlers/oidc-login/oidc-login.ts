import { type NextRequest, NextResponse } from 'next/server';
import * as client from 'openid-client';

import {
  CADENCE_OIDC_PENDING_COOKIE_NAME,
  NO_STORE_HEADERS,
  OIDC_PENDING_COOKIE_MAX_AGE_SECONDS,
} from '@/utils/auth/auth.constants';
import { sanitizeReturnTo } from '@/utils/auth/helpers/sanitize-return-to';
import {
  getRequiredOidcAuthConfig,
  oidcNotEnabledResponse,
  OidcAuthNotEnabledError,
} from '@/utils/auth/strategies/oidc/oidc-auth-config-access';
import { getOidcClientConfiguration } from '@/utils/auth/strategies/oidc/oidc-client';
import { getOidcCookieOptions } from '@/utils/auth/strategies/oidc/oidc-cookies';
import { encryptOidcPending } from '@/utils/auth/strategies/oidc/oidc-session';
import logger from '@/utils/logger';

export async function handleOidcLogin(request: NextRequest) {
  let oidcConfig;
  try {
    oidcConfig = await getRequiredOidcAuthConfig();
  } catch (error) {
    if (error instanceof OidcAuthNotEnabledError) {
      return oidcNotEnabledResponse();
    }
    throw error;
  }

  let openidConfig;
  try {
    openidConfig = await getOidcClientConfiguration(oidcConfig);
  } catch (error) {
    // Log the detail server-side only; provider error text can leak internal
    // URLs or configuration to the browser.
    logger.error({ error }, 'OIDC discovery failed during login');
    return NextResponse.json(
      { message: 'OIDC discovery failed' },
      { status: 502, headers: NO_STORE_HEADERS }
    );
  }

  const codeVerifier = client.randomPKCECodeVerifier();
  const codeChallenge = await client.calculatePKCECodeChallenge(codeVerifier);
  const state = client.randomState();
  const nonce = client.randomNonce();
  const returnTo = sanitizeReturnTo(
    request.nextUrl.searchParams.get('returnTo')
  );

  const redirectTo = client.buildAuthorizationUrl(openidConfig, {
    redirect_uri: oidcConfig.redirectUri,
    scope: oidcConfig.scopes,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    state,
    nonce,
  });

  const pendingPayload = await encryptOidcPending(
    { codeVerifier, state, nonce, returnTo },
    oidcConfig.sessionSecret,
    OIDC_PENDING_COOKIE_MAX_AGE_SECONDS
  );

  const response = NextResponse.redirect(redirectTo, {
    headers: NO_STORE_HEADERS,
  });
  response.cookies.set(
    CADENCE_OIDC_PENDING_COOKIE_NAME,
    pendingPayload,
    getOidcCookieOptions(request, OIDC_PENDING_COOKIE_MAX_AGE_SECONDS)
  );

  return response;
}
