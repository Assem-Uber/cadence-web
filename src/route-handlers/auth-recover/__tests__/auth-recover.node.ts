import { handleAuthRecover } from '@/route-handlers/auth-recover/auth-recover';
import {
  CADENCE_AUTH_COOKIE_NAME,
  JWT_LOGIN_PATH,
} from '@/utils/auth/auth.constants';
import { recoverJwtSession } from '@/utils/auth/strategies/jwt/recover-jwt-session';
jest.mock('@/utils/auth/strategies/resolve-auth-strategy', () => ({
  resolveAuthStrategy: jest.fn().mockResolvedValue({
    server: {
      recoverSession: (_cookies: unknown, ctx: unknown) =>
        recoverJwtSession(ctx as Parameters<typeof recoverJwtSession>[0]),
    },
  }),
}));

describe(handleAuthRecover.name, () => {
  it('returns redirect payload and clears jwt session cookie', async () => {
    const request = {
      json: async () => ({
        returnTo: '/domains/foo',
        notice: 'session-expired',
      }),
      cookies: { get: jest.fn() },
      headers: new Headers(),
      nextUrl: new URL('http://localhost:8088/domains/foo'),
    };

    const response = await handleAuthRecover(request as never);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      kind: 'redirect',
      url: `${JWT_LOGIN_PATH}?returnTo=${encodeURIComponent('/domains/foo')}&notice=session-expired`,
    });

    const clearedCookie = response.cookies.get(CADENCE_AUTH_COOKIE_NAME);
    expect(clearedCookie?.value).toBe('');
  });
});
