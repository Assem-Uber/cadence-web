import { JWT_LOGIN_PATH } from '@/utils/auth/auth.constants';

import { buildJwtLoginPath } from '../build-jwt-login-path';
import jwtAuthStrategy from '../jwt-auth-strategy';
import { resolveJwtAuthContext } from '../resolve-jwt-auth-context';

jest.mock('../resolve-jwt-auth-context');

const mockResolveJwtAuthContext = resolveJwtAuthContext as jest.MockedFunction<
  typeof resolveJwtAuthContext
>;

describe(buildJwtLoginPath.name, () => {
  it('includes a sanitized returnTo query param', () => {
    expect(buildJwtLoginPath('/domains/foo/bar')).toBe(
      `${JWT_LOGIN_PATH}?returnTo=${encodeURIComponent('/domains/foo/bar')}`
    );
  });

  it('includes notice when provided', () => {
    expect(buildJwtLoginPath('/domains', 'session-expired')).toBe(
      `${JWT_LOGIN_PATH}?returnTo=${encodeURIComponent('/domains')}&notice=session-expired`
    );
  });
});

describe('jwtAuthStrategy.server.getLoginRedirectIfNeeded', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null when jwt session is valid', async () => {
    mockResolveJwtAuthContext.mockResolvedValue({
      authEnabled: true,
      auth: { isValidToken: true, token: 'access-token' },
      groups: [],
      isAdmin: false,
    });

    await expect(
      jwtAuthStrategy.server.getLoginRedirectIfNeeded(
        { get: jest.fn() },
        '/domains/foo'
      )
    ).resolves.toBe(null);
  });

  it('returns login path with returnTo when jwt session is missing', async () => {
    mockResolveJwtAuthContext.mockResolvedValue({
      authEnabled: true,
      auth: { isValidToken: false },
      groups: [],
      isAdmin: false,
    });

    await expect(
      jwtAuthStrategy.server.getLoginRedirectIfNeeded(
        { get: jest.fn() },
        '/domains/foo/bar'
      )
    ).resolves.toBe(
      `${JWT_LOGIN_PATH}?returnTo=${encodeURIComponent('/domains/foo/bar')}`
    );
  });

  it('returns null when already on the login page', async () => {
    mockResolveJwtAuthContext.mockResolvedValue({
      authEnabled: true,
      auth: { isValidToken: false },
      groups: [],
      isAdmin: false,
    });

    await expect(
      jwtAuthStrategy.server.getLoginRedirectIfNeeded(
        { get: jest.fn() },
        `${JWT_LOGIN_PATH}?returnTo=%2Fdomains`
      )
    ).resolves.toBe(null);
  });
});

describe('jwtAuthStrategy.server.recoverSession', () => {
  it('redirects to login and clears session', async () => {
    await expect(
      jwtAuthStrategy.server.recoverSession(
        { get: jest.fn() },
        { returnTo: '/domains/foo', notice: 'session-expired' }
      )
    ).resolves.toEqual({
      result: {
        kind: 'redirect',
        url: buildJwtLoginPath('/domains/foo', 'session-expired'),
      },
      clearSession: true,
    });
  });
});
