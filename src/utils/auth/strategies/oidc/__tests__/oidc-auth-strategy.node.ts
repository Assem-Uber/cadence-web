import { OIDC_LOGIN_PATH } from '@/utils/auth/auth.constants';

import { buildOidcLoginPath } from '../build-oidc-login-path';
import oidcAuthStrategy from '../oidc-auth-strategy';
import { resolveOidcAuthContext } from '../resolve-oidc-auth-context';

jest.mock('../resolve-oidc-auth-context');

const mockResolveOidcAuthContext =
  resolveOidcAuthContext as jest.MockedFunction<typeof resolveOidcAuthContext>;

describe(buildOidcLoginPath.name, () => {
  it('includes a sanitized returnTo query param', () => {
    expect(buildOidcLoginPath('/domains/foo/bar')).toBe(
      `${OIDC_LOGIN_PATH}?returnTo=${encodeURIComponent('/domains/foo/bar')}`
    );
  });
});

describe('oidcAuthStrategy.server.getLoginRedirectIfNeeded', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null when oidc session is valid', async () => {
    mockResolveOidcAuthContext.mockResolvedValue({
      authEnabled: true,
      auth: { isValidToken: true, token: 'access-token' },
      groups: [],
      isAdmin: false,
    });

    await expect(
      oidcAuthStrategy.server.getLoginRedirectIfNeeded(
        { get: jest.fn() },
        '/domains/foo'
      )
    ).resolves.toBe(null);
  });

  it('returns login path with returnTo when oidc session is missing', async () => {
    mockResolveOidcAuthContext.mockResolvedValue({
      authEnabled: true,
      auth: { isValidToken: false },
      groups: [],
      isAdmin: false,
    });

    await expect(
      oidcAuthStrategy.server.getLoginRedirectIfNeeded(
        { get: jest.fn() },
        '/domains/foo/bar'
      )
    ).resolves.toBe(
      `${OIDC_LOGIN_PATH}?returnTo=${encodeURIComponent('/domains/foo/bar')}`
    );
  });
});
