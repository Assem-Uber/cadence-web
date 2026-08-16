import { HttpResponse } from 'msw';

import { act, renderHook, waitFor } from '@/test-utils/rtl';

import useAuthLifecycle from '../use-auth-lifecycle';

type AuthResponse = {
  authEnabled: boolean;
  authStrategy: 'disabled' | 'jwt' | 'oidc';
  auth: {
    isValidToken: boolean;
    expiresAtMs?: number;
  };
};

const AUTH_ENABLED: AuthResponse = {
  authEnabled: true,
  authStrategy: 'jwt',
  auth: { isValidToken: true },
};

const AUTH_DISABLED: AuthResponse = {
  authEnabled: false,
  authStrategy: 'disabled',
  auth: { isValidToken: false },
};

const AUTH_UNAUTHENTICATED: AuthResponse = {
  authEnabled: true,
  authStrategy: 'jwt',
  auth: { isValidToken: false },
};

describe(useAuthLifecycle.name, () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('derived state', () => {
    it('returns disabled auth state when auth is disabled', async () => {
      const { result } = setup({ authResponse: AUTH_DISABLED });

      await waitFor(() => {
        expect(result.current.isAuthEnabled).toBe(false);
        expect(result.current.isAuthLoading).toBe(false);
      });

      expect(result.current.isJwtAuth).toBe(false);
      expect(result.current.isOidcAuth).toBe(false);
      expect(result.current.userName).toBeUndefined();
    });

    it('returns unauthenticated state when token is invalid', async () => {
      const { result } = setup({ authResponse: AUTH_UNAUTHENTICATED });

      await waitFor(() => {
        expect(result.current.isAuthEnabled).toBe(true);
      });

      expect(result.current.isJwtAuth).toBe(true);
      expect(result.current.isOidcAuth).toBe(false);
      expect(result.current.isValidToken).toBe(false);
      expect(result.current.userName).toBeUndefined();
    });

    it('returns authenticated state with user info fetched from the user endpoint', async () => {
      const { result } = setup({ authResponse: AUTH_ENABLED });

      await waitFor(() => {
        expect(result.current.isValidToken).toBe(true);
        expect(result.current.userName).toBe('alice');
      });
    });

    it('preserves missing username for consumers to handle', async () => {
      const { result } = setup({
        authResponse: AUTH_ENABLED,
        userInfoResponse: {},
      });

      await waitFor(() => {
        expect(result.current.isValidToken).toBe(true);
      });

      expect(result.current.userName).toBeUndefined();
    });

    it('returns expiresAtMs from auth info', async () => {
      const expiresAtMs = Date.now() + 60_000;
      const { result } = setup({
        authResponse: {
          ...AUTH_ENABLED,
          auth: { isValidToken: true, expiresAtMs },
        },
      });

      await waitFor(() => {
        expect(result.current.expiresAtMs).toBe(expiresAtMs);
      });
    });

    it('returns undefined expiresAtMs when absent', async () => {
      const { result } = setup({ authResponse: AUTH_ENABLED });

      await waitFor(() => {
        expect(result.current.isValidToken).toBe(true);
      });

      expect(result.current.expiresAtMs).toBeUndefined();
    });
  });

  describe('saveToken', () => {
    it('calls POST /api/auth/token and returns true for valid token', async () => {
      let currentAuth: AuthResponse = AUTH_UNAUTHENTICATED;
      const { result, postTokenHandler } = setup({
        authResponse: currentAuth,
        dynamicAuthResolver: () => currentAuth,
      });

      await waitFor(() => {
        expect(result.current.isAuthEnabled).toBe(true);
      });

      currentAuth = AUTH_ENABLED;
      let isValid: boolean | undefined;
      await act(async () => {
        isValid = await result.current.saveToken('header.payload.signature');
      });

      expect(postTokenHandler).toHaveBeenCalled();
      expect(isValid).toBe(true);
    });

    it('returns false when token is invalid after save', async () => {
      const { result } = setup({
        authResponse: AUTH_UNAUTHENTICATED,
      });

      await waitFor(() => {
        expect(result.current.isAuthEnabled).toBe(true);
      });

      let isValid: boolean | undefined;
      await act(async () => {
        isValid = await result.current.saveToken('header.payload.signature');
      });

      expect(isValid).toBe(false);
    });

    it('throws when POST fails', async () => {
      const { result } = setup({
        authResponse: AUTH_UNAUTHENTICATED,
        tokenError: true,
      });

      await waitFor(() => {
        expect(result.current.isAuthEnabled).toBe(true);
      });

      let thrown: unknown;
      await act(async () => {
        try {
          await result.current.saveToken('header.payload.signature');
        } catch (e) {
          thrown = e;
        }
      });

      expect(thrown).toBeDefined();
    });
  });

  describe('recoverSession', () => {
    it('recovers the session and refetches auth state', async () => {
      let currentAuth: AuthResponse = {
        authEnabled: true,
        authStrategy: 'oidc',
        auth: { isValidToken: true, expiresAtMs: 1000 },
      };
      const recoverHandler = jest.fn(() =>
        HttpResponse.json({ kind: 'recovered' })
      );
      const { result } = setup({
        authResponse: currentAuth,
        dynamicAuthResolver: () => currentAuth,
        recoverHandler,
      });

      await waitFor(() => {
        expect(result.current.isOidcAuth).toBe(true);
      });

      currentAuth = {
        ...currentAuth,
        auth: { isValidToken: true, expiresAtMs: 2000 },
      };
      let recovery;
      await act(async () => {
        recovery = await result.current.recoverSession('/domains');
      });

      expect(recoverHandler).toHaveBeenCalled();
      expect(recovery).toEqual({ kind: 'recovered' });
      await waitFor(() => {
        expect(result.current.expiresAtMs).toBe(2000);
      });
    });

    it('returns noop without calling the recover API for strategies without recovery support', async () => {
      const recoverHandler = jest.fn(() =>
        HttpResponse.json({ kind: 'recovered' })
      );
      const { result } = setup({
        authResponse: AUTH_ENABLED,
        recoverHandler,
      });

      await waitFor(() => {
        expect(result.current.isJwtAuth).toBe(true);
      });

      let recovery;
      await act(async () => {
        recovery = await result.current.recoverSession('/domains');
      });

      expect(recovery).toEqual({ kind: 'noop' });
      expect(recoverHandler).not.toHaveBeenCalled();
    });

    it('returns noop and keeps auth state when recovery fails', async () => {
      const recoverHandler = jest.fn(() =>
        HttpResponse.json({ message: 'recovery failed' }, { status: 500 })
      );
      const { result } = setup({
        authResponse: {
          authEnabled: true,
          authStrategy: 'oidc',
          auth: { isValidToken: true, expiresAtMs: 1000 },
        },
        recoverHandler,
      });

      await waitFor(() => {
        expect(result.current.isOidcAuth).toBe(true);
      });

      let recovery;
      await act(async () => {
        recovery = await result.current.recoverSession('/domains');
      });

      expect(recovery).toEqual({ kind: 'noop' });
      expect(result.current.expiresAtMs).toBe(1000);
    });
  });

  describe('logout', () => {
    it('calls DELETE /api/auth/token and refetches', async () => {
      const { result, postTokenHandler, deleteTokenHandler } = setup({
        authResponse: AUTH_ENABLED,
      });

      await waitFor(() => {
        expect(result.current.isValidToken).toBe(true);
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(deleteTokenHandler).toHaveBeenCalled();
      expect(postTokenHandler).not.toHaveBeenCalled();
    });

    it('is a no-op for oidc strategy', async () => {
      const deleteOidcLogoutHandler = jest.fn(() =>
        HttpResponse.json({ ok: true })
      );
      const { result } = setup({
        authResponse: {
          ...AUTH_ENABLED,
          authStrategy: 'oidc',
        },
        deleteOidcLogoutHandler,
      });

      await waitFor(() => {
        expect(result.current.isOidcAuth).toBe(true);
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(deleteOidcLogoutHandler).not.toHaveBeenCalled();
    });

    it('still refetches when DELETE fails', async () => {
      let currentAuth: AuthResponse = AUTH_ENABLED;
      const { result } = setup({
        authResponse: AUTH_ENABLED,
        dynamicAuthResolver: () => currentAuth,
        tokenError: true,
      });

      await waitFor(() => {
        expect(result.current.isValidToken).toBe(true);
      });

      currentAuth = AUTH_UNAUTHENTICATED;
      let thrown: unknown;
      await act(async () => {
        try {
          await result.current.logout();
        } catch (e) {
          thrown = e;
        }
      });

      expect(thrown).toBeDefined();
      await waitFor(() => {
        expect(result.current.isValidToken).toBe(false);
      });
    });
  });
});

function setup({
  authResponse,
  dynamicAuthResolver,
  userInfoResponse = { userName: 'alice' },
  tokenError = false,
  postTokenHandler: customPostHandler,
  deleteTokenHandler: customDeleteHandler,
  deleteOidcLogoutHandler: customDeleteOidcHandler,
  recoverHandler: customRecoverHandler,
}: {
  authResponse: AuthResponse;
  dynamicAuthResolver?: () => AuthResponse;
  userInfoResponse?: { userName?: string; id?: string; pictureUrl?: string };
  tokenError?: boolean;
  postTokenHandler?: jest.Mock;
  deleteTokenHandler?: jest.Mock;
  deleteOidcLogoutHandler?: jest.Mock;
  recoverHandler?: jest.Mock;
}) {
  const defaultHandler = () => {
    if (tokenError) {
      return HttpResponse.json(
        { message: 'Token operation failed' },
        { status: 500 }
      );
    }
    return HttpResponse.json({ ok: true });
  };

  const postTokenHandler = customPostHandler ?? jest.fn(defaultHandler);
  const deleteTokenHandler = customDeleteHandler ?? jest.fn(defaultHandler);
  const deleteOidcLogoutHandler =
    customDeleteOidcHandler ?? jest.fn(defaultHandler);
  const recoverHandler =
    customRecoverHandler ?? jest.fn(() => HttpResponse.json({ kind: 'noop' }));

  const { result } = renderHook(() => useAuthLifecycle(), {
    endpointsMocks: [
      {
        path: '/api/auth/me',
        httpMethod: 'GET' as const,
        mockOnce: false,
        httpResolver: () => {
          const response = dynamicAuthResolver
            ? dynamicAuthResolver()
            : authResponse;
          return HttpResponse.json(response);
        },
      },
      {
        path: '/api/auth/user',
        httpMethod: 'GET' as const,
        mockOnce: false,
        httpResolver: () => HttpResponse.json(userInfoResponse),
      },
      {
        path: '/api/auth/token',
        httpMethod: 'POST' as const,
        mockOnce: false,
        httpResolver: postTokenHandler,
      },
      {
        path: '/api/auth/token',
        httpMethod: 'DELETE' as const,
        mockOnce: false,
        httpResolver: deleteTokenHandler,
      },
      {
        path: '/api/auth/oidc/logout',
        httpMethod: 'DELETE' as const,
        mockOnce: false,
        httpResolver: deleteOidcLogoutHandler,
      },
      {
        path: '/api/auth/recover',
        httpMethod: 'POST' as const,
        mockOnce: false,
        httpResolver: recoverHandler,
      },
    ],
  });

  return {
    result,
    postTokenHandler,
    deleteTokenHandler,
    deleteOidcLogoutHandler,
  };
}
