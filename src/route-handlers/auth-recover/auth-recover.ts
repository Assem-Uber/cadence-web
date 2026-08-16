import { type NextRequest, NextResponse } from 'next/server';

import {
  AUTH_COOKIE_OPTIONS,
  CADENCE_AUTH_COOKIE_NAME,
  NO_STORE_HEADERS,
} from '@/utils/auth/auth.constants';
import {
  type AuthFailureContext,
  type AuthRecoveryResult,
} from '@/utils/auth/auth.types';
import getCookieSecureAttribute from '@/utils/auth/helpers/get-cookie-secure-attribute';
import { isAuthLogoutNotice } from '@/utils/auth/helpers/is-auth-logout-notice';
import { sanitizeReturnTo } from '@/utils/auth/helpers/sanitize-return-to';
import {
  clearOidcAuthCookies,
  setOidcSessionCookie,
} from '@/utils/auth/strategies/oidc/oidc-cookies';
import { resolveAuthStrategy } from '@/utils/auth/strategies/resolve-auth-strategy';

async function parseAuthFailureContext(
  request: NextRequest
): Promise<AuthFailureContext> {
  try {
    const body = (await request.json()) as {
      returnTo?: string | null;
      notice?: string | null;
    };
    return {
      returnTo: sanitizeReturnTo(body.returnTo),
      notice: isAuthLogoutNotice(body.notice) ? body.notice : 'session-expired',
    };
  } catch {
    return {
      returnTo: sanitizeReturnTo(null),
      notice: 'session-expired',
    };
  }
}

function clearJwtSessionCookie(request: NextRequest, response: NextResponse) {
  response.cookies.set(CADENCE_AUTH_COOKIE_NAME, '', {
    ...AUTH_COOKIE_OPTIONS,
    secure: getCookieSecureAttribute(request),
    expires: new Date(0),
    maxAge: 0,
  });
}

export async function handleAuthRecover(request: NextRequest) {
  const ctx = await parseAuthFailureContext(request);
  const strategy = await resolveAuthStrategy();
  const outcome = await strategy.server.recoverSession(request.cookies, ctx);

  const response = NextResponse.json(
    outcome.result satisfies AuthRecoveryResult,
    { headers: NO_STORE_HEADERS }
  );

  if (outcome.clearSession) {
    clearJwtSessionCookie(request, response);
    clearOidcAuthCookies(response);
  }

  if (outcome.oidcSessionToken) {
    setOidcSessionCookie(request, response, outcome.oidcSessionToken);
  }

  return response;
}
