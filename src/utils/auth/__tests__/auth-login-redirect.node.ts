import { OIDC_LOGIN_PATH } from '@/utils/auth/auth.constants';
import { resolveAuthStrategy } from '@/utils/auth/strategies/resolve-auth-strategy';

import { getLoginRedirectIfNeeded } from '../auth-login-redirect';

jest.mock('@/utils/auth/strategies/resolve-auth-strategy');

const mockResolveAuthStrategy = resolveAuthStrategy as jest.MockedFunction<
  typeof resolveAuthStrategy
>;

describe(getLoginRedirectIfNeeded.name, () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('delegates to the resolved auth strategy', async () => {
    mockResolveAuthStrategy.mockResolvedValue({
      server: {
        resolveContext: jest.fn(),
        getLoginRedirectIfNeeded: jest
          .fn()
          .mockResolvedValue(
            `${OIDC_LOGIN_PATH}?returnTo=${encodeURIComponent('/domains/foo/bar')}`
          ),
        recoverSession: jest.fn(),
      },
    });

    await expect(
      getLoginRedirectIfNeeded({ get: jest.fn() }, '/domains/foo/bar')
    ).resolves.toBe(
      `${OIDC_LOGIN_PATH}?returnTo=${encodeURIComponent('/domains/foo/bar')}`
    );
  });

  it('sanitizes unsafe return paths before delegating', async () => {
    const getLoginRedirectIfNeededMock = jest.fn().mockResolvedValue(null);
    mockResolveAuthStrategy.mockResolvedValue({
      server: {
        resolveContext: jest.fn(),
        getLoginRedirectIfNeeded: getLoginRedirectIfNeededMock,
        recoverSession: jest.fn(),
      },
    });

    await getLoginRedirectIfNeeded({ get: jest.fn() }, '//evil.test/path');

    expect(getLoginRedirectIfNeededMock).toHaveBeenCalledWith(
      expect.anything(),
      '/'
    );
  });
});
