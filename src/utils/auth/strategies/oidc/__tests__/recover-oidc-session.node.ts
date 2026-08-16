import {
  CADENCE_OIDC_SESSION_COOKIE_NAME,
  OIDC_SESSION_COOKIE_MAX_AGE_SECONDS,
} from '@/utils/auth/auth.constants';
import { type OidcSessionPayload } from '@/utils/auth/auth.types';
import getConfigValue from '@/utils/config/get-config-value';

import { encryptOidcSession } from '../oidc-session';
import { recoverOidcSession } from '../recover-oidc-session';

jest.mock('@/utils/config/get-config-value');
jest.mock('openid-client', () => ({
  refreshTokenGrant: jest.fn(),
}));
jest.mock('../oidc-client', () => ({
  getOidcClientConfiguration: jest.fn().mockResolvedValue({}),
}));

const mockGetConfigValue = getConfigValue as jest.MockedFunction<
  typeof getConfigValue
>;

const SESSION_SECRET = 'test-oidc-session-secret-32bytes!!';
const CTX = { returnTo: '/domains', notice: 'session-expired' as const };

function sessionCookieStore(sessionToken: string) {
  return {
    get: (name: string) =>
      name === `${CADENCE_OIDC_SESSION_COOKIE_NAME}.0`
        ? { value: sessionToken }
        : undefined,
  };
}

describe(recoverOidcSession.name, () => {
  beforeEach(() => {
    mockGetConfigValue.mockImplementation((async (key: string) => {
      if (key === 'CADENCE_WEB_AUTH_STRATEGY') return 'oidc';
      if (key === 'OIDC_AUTH_CONFIG') return { sessionSecret: SESSION_SECRET };
      return undefined;
    }) as unknown as typeof getConfigValue);
  });

  it('refuses refresh past the absolute session ceiling', async () => {
    const ceilingMs = OIDC_SESSION_COOKIE_MAX_AGE_SECONDS * 1000;
    const sessionToken = await buildSessionToken({
      authenticatedAtMs: Date.now() - ceilingMs - 1000,
    });

    const outcome = await recoverOidcSession(
      sessionCookieStore(sessionToken),
      CTX
    );

    expect(outcome.result.kind).toBe('redirect');
    expect(outcome.clearSession).toBe(true);
    expect(outcome.oidcSessionToken).toBeUndefined();
  });

  it('redirects without refresh when the session has no refresh token', async () => {
    const sessionToken = await buildSessionToken({ refreshToken: undefined });

    const outcome = await recoverOidcSession(
      sessionCookieStore(sessionToken),
      CTX
    );

    expect(outcome.result.kind).toBe('redirect');
    expect(outcome.clearSession).toBe(true);
  });
});

async function buildSessionToken(
  overrides: Partial<OidcSessionPayload> = {}
): Promise<string> {
  const payload: OidcSessionPayload = {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    expiresAtMs: Date.now() + 60_000,
    authenticatedAtMs: Date.now(),
    ...overrides,
  };
  return encryptOidcSession(payload, SESSION_SECRET, 3600);
}
