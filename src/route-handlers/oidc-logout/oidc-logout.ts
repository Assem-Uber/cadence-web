import { type NextRequest, NextResponse } from 'next/server';
import * as client from 'openid-client';

import {
  DEFAULT_AUTH_RETURN_TO,
  NO_STORE_HEADERS,
} from '@/utils/auth/auth.constants';
import { isAuthLogoutNotice } from '@/utils/auth/helpers/is-auth-logout-notice';
import {
  getRequiredOidcAuthConfig,
  oidcNotEnabledResponse,
  OidcAuthNotEnabledError,
} from '@/utils/auth/strategies/oidc/oidc-auth-config-access';
import { getOidcClientConfiguration } from '@/utils/auth/strategies/oidc/oidc-client';
import {
  clearOidcAuthCookies,
  readOidcSessionCookie,
} from '@/utils/auth/strategies/oidc/oidc-cookies';
import { decryptOidcSession } from '@/utils/auth/strategies/oidc/oidc-session';

function buildPostLogoutRedirectUri(redirectUri: string, notice?: string) {
  const postLogoutUrl = new URL('/domains', redirectUri);
  if (notice) {
    postLogoutUrl.searchParams.set('authNotice', notice);
  }
  return postLogoutUrl.toString();
}

function getLogoutNotice(request: NextRequest): string | undefined {
  const notice = request.nextUrl.searchParams.get('notice') ?? undefined;
  if (!isAuthLogoutNotice(notice)) {
    return undefined;
  }
  return notice;
}

/**
 * OIDC RP-Initiated Logout via the end_session_endpoint advertised in the
 * provider's discovery metadata. Returns undefined when the provider does not
 * support it (or discovery fails), in which case we still clear the local
 * session and redirect within the app.
 */
async function buildIdpLogoutUrl(
  oidcConfig: Awaited<ReturnType<typeof getRequiredOidcAuthConfig>>,
  idTokenHint: string,
  notice?: string
): Promise<URL | undefined> {
  try {
    const openidConfig = await getOidcClientConfiguration(oidcConfig);
    if (!openidConfig.serverMetadata().end_session_endpoint) {
      return undefined;
    }
    return client.buildEndSessionUrl(openidConfig, {
      client_id: oidcConfig.clientId,
      id_token_hint: idTokenHint,
      post_logout_redirect_uri: buildPostLogoutRedirectUri(
        oidcConfig.redirectUri,
        notice
      ),
    });
  } catch {
    return undefined;
  }
}

export async function handleOidcLogout(_request: NextRequest) {
  try {
    await getRequiredOidcAuthConfig();
  } catch (error) {
    if (error instanceof OidcAuthNotEnabledError) {
      return oidcNotEnabledResponse();
    }
    throw error;
  }

  const response = NextResponse.json(
    { ok: true },
    { headers: NO_STORE_HEADERS }
  );
  clearOidcAuthCookies(response);
  return response;
}

/** Browser logout: clear app session, end IdP SSO, redirect to /domains (layout sends unauthenticated users to login). */
export async function handleOidcLogoutRedirect(request: NextRequest) {
  let oidcConfig;
  try {
    oidcConfig = await getRequiredOidcAuthConfig();
  } catch (error) {
    if (error instanceof OidcAuthNotEnabledError) {
      return oidcNotEnabledResponse();
    }
    throw error;
  }

  // Logout-CSRF guard: this GET endpoint is state-changing, so refuse
  // navigations initiated by another site (fetch metadata is set by all
  // modern browsers; requests without it, e.g. curl, are allowed).
  if (request.headers.get('sec-fetch-site') === 'cross-site') {
    return NextResponse.redirect(
      new URL(DEFAULT_AUTH_RETURN_TO, oidcConfig.redirectUri),
      { headers: NO_STORE_HEADERS }
    );
  }

  const notice = getLogoutNotice(request);
  const sessionToken = readOidcSessionCookie(request.cookies);
  let idTokenHint: string | undefined;
  if (sessionToken) {
    const session = await decryptOidcSession(
      sessionToken,
      oidcConfig.sessionSecret
    );
    idTokenHint = session?.idToken;
  }

  const idpLogoutUrl = idTokenHint
    ? await buildIdpLogoutUrl(oidcConfig, idTokenHint, notice)
    : undefined;
  const redirectTarget =
    idpLogoutUrl ??
    new URL(
      notice ? `/domains?authNotice=${notice}` : DEFAULT_AUTH_RETURN_TO,
      oidcConfig.redirectUri
    );

  const response = NextResponse.redirect(redirectTarget, {
    headers: NO_STORE_HEADERS,
  });
  clearOidcAuthCookies(response);
  return response;
}
