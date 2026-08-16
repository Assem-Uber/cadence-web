import { JWT_LOGIN_PATH } from '@/utils/auth/auth.constants';
import { handleApiUnauthorized } from '@/utils/auth/client-auth-actions';
import { setCachedAuthStrategyConfig } from '@/utils/auth/helpers/auth-strategy-config-cache';

describe(handleApiUnauthorized.name, () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setCachedAuthStrategyConfig(undefined);
    global.fetch = jest.fn();
  });

  it('fetches auth strategy when cache is empty', async () => {
    jest
      .mocked(global.fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ authStrategy: 'jwt' }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          kind: 'redirect',
          url: `${JWT_LOGIN_PATH}?returnTo=%2Fdomains%2Ffoo&notice=session-expired`,
        }),
      } as Response);

    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { assign: jest.fn() },
    });

    await expect(
      handleApiUnauthorized({
        returnTo: '/domains/foo',
        notice: 'session-expired',
      })
    ).resolves.toEqual({
      kind: 'redirect',
      url: `${JWT_LOGIN_PATH}?returnTo=%2Fdomains%2Ffoo&notice=session-expired`,
    });

    expect(global.fetch).toHaveBeenNthCalledWith(1, '/api/auth/me', {
      cache: 'no-store',
    });
  });

  it('delegates to the jwt client policy when strategy is cached', async () => {
    setCachedAuthStrategyConfig('jwt');
    jest.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        kind: 'redirect',
        url: `${JWT_LOGIN_PATH}?returnTo=%2Fdomains%2Ffoo&notice=session-expired`,
      }),
    } as Response);

    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { assign: jest.fn() },
    });

    await expect(
      handleApiUnauthorized({
        returnTo: '/domains/foo',
        notice: 'session-expired',
      })
    ).resolves.toEqual({
      kind: 'redirect',
      url: `${JWT_LOGIN_PATH}?returnTo=%2Fdomains%2Ffoo&notice=session-expired`,
    });
  });
});
