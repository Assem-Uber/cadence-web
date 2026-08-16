import { type NextRequest } from 'next/server';

import { CADENCE_OIDC_SESSION_COOKIE_NAME } from '@/utils/auth/auth.constants';

import {
  clearOidcAuthCookies,
  readOidcSessionCookie,
  setOidcSessionCookie,
} from '../oidc-cookies';

const MOCK_REQUEST = {
  nextUrl: new URL('http://localhost:8088/api/auth/oidc/callback'),
  headers: new Headers(),
} as NextRequest;

describe('oidc session cookie chunking', () => {
  it('round-trips a token larger than one cookie through chunk cookies', () => {
    const token = 'x'.repeat(4500); // over the ~4096-byte cookie limit
    const { response, jar } = mockResponse();

    setOidcSessionCookie(MOCK_REQUEST, response, token);

    const liveChunks = Array.from(jar.entries()).filter(
      ([, cookie]) => cookie.maxAge > 0
    );
    expect(liveChunks.length).toBeGreaterThan(1);
    for (const [name, cookie] of liveChunks) {
      expect(name.length + cookie.value.length).toBeLessThan(4000);
    }
    expect(readOidcSessionCookie(cookieReader(jar))).toBe(token);
  });

  it('expires stale chunks when a smaller token is written', () => {
    const { response, jar } = mockResponse();
    setOidcSessionCookie(MOCK_REQUEST, response, 'x'.repeat(4500));
    setOidcSessionCookie(MOCK_REQUEST, response, 'short-token');

    expect(readOidcSessionCookie(cookieReader(jar))).toBe('short-token');
    expect(jar.get(`${CADENCE_OIDC_SESSION_COOKIE_NAME}.1`)?.maxAge).toBe(0);
  });

  it('clearOidcAuthCookies expires all chunk cookies', () => {
    const { response, jar } = mockResponse();
    setOidcSessionCookie(MOCK_REQUEST, response, 'x'.repeat(4500));
    clearOidcAuthCookies(response);

    expect(readOidcSessionCookie(cookieReader(jar))).toBeUndefined();
  });
});

type StoredCookie = { value: string; maxAge: number };

function mockResponse() {
  const jar = new Map<string, StoredCookie>();
  const response = {
    cookies: {
      set: (name: string, value: string, options: { maxAge: number }) => {
        jar.set(name, { value, maxAge: options.maxAge });
      },
    },
  };
  return { response, jar };
}

/** Reads like a browser: expired cookies are gone. */
function cookieReader(jar: Map<string, StoredCookie>) {
  return {
    get: (name: string) => {
      const cookie = jar.get(name);
      return cookie && cookie.maxAge > 0 ? { value: cookie.value } : undefined;
    },
  };
}
