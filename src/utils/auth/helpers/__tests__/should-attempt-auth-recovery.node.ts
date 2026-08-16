import { shouldAttemptAuthRecovery } from '../should-attempt-auth-recovery';

describe(shouldAttemptAuthRecovery.name, () => {
  it('returns false on the server', () => {
    expect(shouldAttemptAuthRecovery('/api/domains/foo')).toBe(false);
  });

  describe('in the browser', () => {
    const originalWindow = global.window;

    beforeAll(() => {
      global.window = {} as Window & typeof globalThis;
    });

    afterAll(() => {
      global.window = originalWindow;
    });

    it('returns true for cadence api routes', () => {
      expect(shouldAttemptAuthRecovery('/api/domains/foo')).toBe(true);
    });

    it('returns false for auth internal routes', () => {
      expect(shouldAttemptAuthRecovery('/api/auth/me')).toBe(false);
      expect(shouldAttemptAuthRecovery('/api/auth/recover')).toBe(false);
      expect(shouldAttemptAuthRecovery('/api/auth/oidc/login')).toBe(false);
      expect(shouldAttemptAuthRecovery('/api/auth/user')).toBe(false);
    });

    it('returns false when skipAuthRecovery is set', () => {
      expect(
        shouldAttemptAuthRecovery('/api/domains/foo', {
          skipAuthRecovery: true,
        })
      ).toBe(false);
    });

    it('returns false when the request was already retried', () => {
      expect(
        shouldAttemptAuthRecovery('/api/domains/foo', {
          _authRetried: true,
        })
      ).toBe(false);
    });
  });
});
