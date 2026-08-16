import { type NextRequest } from 'next/server';

import {
  AUTH_COOKIE_OPTIONS,
  CADENCE_OIDC_PENDING_COOKIE_NAME,
  CADENCE_OIDC_SESSION_COOKIE_NAME,
  OIDC_SESSION_COOKIE_MAX_AGE_SECONDS,
} from '@/utils/auth/auth.constants';
import { type CookieReader } from '@/utils/auth/auth.types';
import getCookieSecureAttribute from '@/utils/auth/helpers/get-cookie-secure-attribute';

type CookieWriter = {
  cookies: {
    set: (
      name: string,
      value: string,
      options: {
        httpOnly: boolean;
        sameSite: 'lax';
        path: string;
        maxAge: number;
        secure?: boolean;
      }
    ) => void;
  };
};

/**
 * Browsers silently drop cookies over ~4096 bytes (name + value +
 * attributes), and the encrypted session (access + refresh + ID token) can
 * exceed that with real-world IdP tokens. The session is therefore split
 * across `cadence-oidc-session.0..n` chunk cookies, each safely under the
 * limit.
 */
const OIDC_SESSION_COOKIE_CHUNK_SIZE = 3000;

// ponytail: fixed chunk ceiling (~24KB total) instead of unbounded cookie
// enumeration; raise it if an IdP's token set ever exceeds this.
const OIDC_SESSION_COOKIE_MAX_CHUNKS = 8;

function getSessionChunkName(index: number) {
  return `${CADENCE_OIDC_SESSION_COOKIE_NAME}.${index}`;
}

export function getOidcCookieOptions(request: NextRequest, maxAge: number) {
  return {
    ...AUTH_COOKIE_OPTIONS,
    secure: getCookieSecureAttribute(request),
    maxAge,
  };
}

/** Reassembles the session token from its chunk cookies. */
export function readOidcSessionCookie(
  cookieStore: CookieReader
): string | undefined {
  const chunks: string[] = [];
  for (let i = 0; i < OIDC_SESSION_COOKIE_MAX_CHUNKS; i++) {
    const chunk = cookieStore.get(getSessionChunkName(i))?.value;
    if (!chunk) {
      break;
    }
    chunks.push(chunk);
  }
  return chunks.length > 0 ? chunks.join('') : undefined;
}

/**
 * Writes the session token across chunk cookies and expires any stale
 * higher-index chunks left over from a previously larger session.
 */
export function setOidcSessionCookie(
  request: NextRequest,
  response: CookieWriter,
  sessionToken: string
) {
  const options = getOidcCookieOptions(
    request,
    OIDC_SESSION_COOKIE_MAX_AGE_SECONDS
  );
  const expiredOptions = getOidcCookieOptions(request, 0);
  const chunkCount = Math.max(
    1,
    Math.ceil(sessionToken.length / OIDC_SESSION_COOKIE_CHUNK_SIZE)
  );
  for (let i = 0; i < OIDC_SESSION_COOKIE_MAX_CHUNKS; i++) {
    if (i < chunkCount) {
      response.cookies.set(
        getSessionChunkName(i),
        sessionToken.slice(
          i * OIDC_SESSION_COOKIE_CHUNK_SIZE,
          (i + 1) * OIDC_SESSION_COOKIE_CHUNK_SIZE
        ),
        options
      );
    } else {
      response.cookies.set(getSessionChunkName(i), '', expiredOptions);
    }
  }
}

export function clearOidcAuthCookies(response: CookieWriter) {
  const expiredOptions = {
    ...AUTH_COOKIE_OPTIONS,
    maxAge: 0,
  };
  for (let i = 0; i < OIDC_SESSION_COOKIE_MAX_CHUNKS; i++) {
    response.cookies.set(getSessionChunkName(i), '', expiredOptions);
  }
  // Drop the legacy unchunked cookie so it cannot linger in old browsers.
  response.cookies.set(CADENCE_OIDC_SESSION_COOKIE_NAME, '', expiredOptions);
  response.cookies.set(CADENCE_OIDC_PENDING_COOKIE_NAME, '', expiredOptions);
}
