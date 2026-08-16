import { JWT_LOGIN_PATH } from '@/utils/auth/auth.constants';

import {
  resolveClientLoginAction,
  resolveClientLogoutRedirect,
  startOidcLogin,
} from '../client-auth-actions';

describe(resolveClientLoginAction.name, () => {
  it('returns redirect for jwt strategy', () => {
    const assign = jest.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { assign },
    });

    expect(resolveClientLoginAction('jwt', '/domains/foo')).toBe('redirect');
    expect(assign).toHaveBeenCalledWith(
      `${JWT_LOGIN_PATH}?returnTo=${encodeURIComponent('/domains/foo')}`
    );
  });

  it('returns null for disabled strategy', () => {
    expect(resolveClientLoginAction('disabled')).toBeNull();
  });

  it('redirects for oidc strategy', () => {
    const assign = jest.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { assign },
    });

    expect(resolveClientLoginAction('oidc', '/domains/foo')).toBe('redirect');
    expect(assign).toHaveBeenCalledWith(
      '/api/auth/oidc/login?returnTo=%2Fdomains%2Ffoo'
    );
  });
});

describe(resolveClientLogoutRedirect.name, () => {
  it('returns false for jwt strategy without redirect when disabled', () => {
    expect(resolveClientLogoutRedirect('disabled')).toBe(false);
  });

  it('redirects jwt logout to the login page', () => {
    const assign = jest.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { assign },
    });

    expect(
      resolveClientLogoutRedirect('jwt', 'session-expired', '/domains/foo')
    ).toBe(true);
    expect(assign).toHaveBeenCalledWith(
      `${JWT_LOGIN_PATH}?returnTo=${encodeURIComponent('/domains/foo')}&notice=session-expired`
    );
  });

  it('redirects for oidc strategy', () => {
    const assign = jest.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { assign },
    });

    expect(resolveClientLogoutRedirect('oidc', 'signed-out')).toBe(true);
    expect(assign).toHaveBeenCalledWith(
      '/api/auth/oidc/logout?notice=signed-out'
    );
  });
});

describe(startOidcLogin.name, () => {
  it('includes returnTo in login url', () => {
    const assign = jest.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { assign },
    });

    startOidcLogin('/domains/sample/cluster/workflows');

    expect(assign).toHaveBeenCalledWith(
      '/api/auth/oidc/login?returnTo=%2Fdomains%2Fsample%2Fcluster%2Fworkflows'
    );
  });
});
