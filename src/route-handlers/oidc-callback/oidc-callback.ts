import { type NextRequest, NextResponse } from 'next/server';
import * as client from 'openid-client';

import {
  CADENCE_OIDC_PENDING_COOKIE_NAME,
  NO_STORE_HEADERS,
  OIDC_POST_LOGIN_REDIRECT_PATH,
  OIDC_SESSION_COOKIE_MAX_AGE_SECONDS,
} from '@/utils/auth/auth.constants';
import { sanitizeReturnTo } from '@/utils/auth/helpers/sanitize-return-to';
import {
  getRequiredOidcAuthConfig,
  oidcNotEnabledResponse,
  OidcAuthNotEnabledError,
} from '@/utils/auth/strategies/oidc/oidc-auth-config-access';
import { getTokenResponseExpiresAtMs } from '@/utils/auth/strategies/oidc/oidc-claim-mapper';
import { getOidcClientConfiguration } from '@/utils/auth/strategies/oidc/oidc-client';
import {
  getOidcCookieOptions,
  setOidcSessionCookie,
} from '@/utils/auth/strategies/oidc/oidc-cookies';
import {
  decryptOidcPending,
  encryptOidcSession,
} from '@/utils/auth/strategies/oidc/oidc-session';
import logger from '@/utils/logger';

function getDevSessionExpiresAtMs(tokenExpiresAtMs: number) {
  const devTtlSeconds = Number.parseInt(
    process.env.CADENCE_WEB_OIDC_DEV_SESSION_TTL_SECONDS ?? '',
    10
  );
  if (!Number.isFinite(devTtlSeconds) || devTtlSeconds <= 0) {
    return tokenExpiresAtMs;
  }
  return Math.min(tokenExpiresAtMs, Date.now() + devTtlSeconds * 1000);
}

/** Error response that also drops the one-time pending cookie. */
function callbackErrorResponse(
  request: NextRequest,
  message: string,
  status: number
) {
  const response = NextResponse.json(
    { message },
    { status, headers: NO_STORE_HEADERS }
  );
  response.cookies.set(
    CADENCE_OIDC_PENDING_COOKIE_NAME,
    '',
    getOidcCookieOptions(request, 0)
  );
  return response;
}

export async function handleOidcCallback(request: NextRequest) {
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
    logger.error({ error }, 'OIDC discovery failed during callback');
    return NextResponse.json(
      { message: 'OIDC discovery failed' },
      { status: 502, headers: NO_STORE_HEADERS }
    );
  }

  const pendingToken = request.cookies.get(
    CADENCE_OIDC_PENDING_COOKIE_NAME
  )?.value;
  if (!pendingToken) {
    return NextResponse.json(
      { message: 'Missing OIDC pending session' },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }

  const pending = await decryptOidcPending(
    pendingToken,
    oidcConfig.sessionSecret
  );
  if (!pending) {
    return callbackErrorResponse(
      request,
      'Invalid or expired OIDC pending session',
      400
    );
  }

  let tokens: client.TokenEndpointResponse &
    client.TokenEndpointResponseHelpers;
  try {
    const callbackUrl = new URL(oidcConfig.redirectUri);
    request.nextUrl.searchParams.forEach((value, key) => {
      callbackUrl.searchParams.set(key, value);
    });

    tokens = await client.authorizationCodeGrant(openidConfig, callbackUrl, {
      pkceCodeVerifier: pending.codeVerifier,
      expectedState: pending.state,
      expectedNonce: pending.nonce,
    });
  } catch (error) {
    // Log the detail server-side only; openid-client error text can echo
    // provider internals and callback parameters back to the browser.
    logger.error({ error }, 'OIDC token exchange failed');
    return callbackErrorResponse(request, 'OIDC token exchange failed', 401);
  }

  const accessToken = tokens.access_token;
  if (!accessToken) {
    return callbackErrorResponse(
      request,
      'OIDC response did not include an access token',
      401
    );
  }

  const tokenExpiresAtMs = getTokenResponseExpiresAtMs(tokens);
  if (tokenExpiresAtMs === undefined) {
    return callbackErrorResponse(
      request,
      'OIDC response did not include token expiry (expires_in or a JWT exp claim)',
      401
    );
  }

  const authenticatedAtMs = Date.now();
  const sessionCeilingMs =
    authenticatedAtMs + OIDC_SESSION_COOKIE_MAX_AGE_SECONDS * 1000;
  const expiresAtMs = Math.min(
    getDevSessionExpiresAtMs(tokenExpiresAtMs),
    sessionCeilingMs
  );

  const sessionPayload = await encryptOidcSession(
    {
      accessToken,
      refreshToken: tokens.refresh_token,
      expiresAtMs,
      idToken: tokens.id_token,
      authenticatedAtMs,
    },
    oidcConfig.sessionSecret,
    OIDC_SESSION_COOKIE_MAX_AGE_SECONDS
  );

  const response = NextResponse.redirect(
    new URL(
      sanitizeReturnTo(pending.returnTo ?? OIDC_POST_LOGIN_REDIRECT_PATH),
      oidcConfig.redirectUri
    ),
    { headers: NO_STORE_HEADERS }
  );
  setOidcSessionCookie(request, response, sessionPayload);
  response.cookies.set(
    CADENCE_OIDC_PENDING_COOKIE_NAME,
    '',
    getOidcCookieOptions(request, 0)
  );

  return response;
}
