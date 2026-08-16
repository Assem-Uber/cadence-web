'use client';
import { useCallback } from 'react';

import { useQuery, useQueryClient } from '@tanstack/react-query';

import { type UserInfoResponse } from '@/route-handlers/user-info/user-info.types';
import { type AuthLogoutNotice } from '@/utils/auth/auth.types';
import {
  handleApiUnauthorized,
  resolveClientLoginAction,
  resolveClientLogoutRedirect,
  supportsSessionRecovery,
} from '@/utils/auth/client-auth-actions';
import request from '@/utils/request';
import { type RequestError } from '@/utils/request/request-error';
import useUserInfo from '@/views/shared/hooks/use-user-info/use-user-info';

import { type AuthLifecycle } from './use-auth-lifecycle.types';

export default function useAuthLifecycle(): AuthLifecycle {
  const queryClient = useQueryClient();
  const { data: authInfo, isLoading: isAuthLoading, refetch } = useUserInfo();

  const isAuthEnabled = authInfo?.authEnabled === true;
  const isJwtAuth = authInfo?.authStrategy === 'jwt';
  const isOidcAuth = authInfo?.authStrategy === 'oidc';
  const isValidToken = authInfo?.auth?.isValidToken === true;

  const { data: userInfo } = useQuery<UserInfoResponse, RequestError>({
    queryKey: ['auth-user'],
    queryFn: () =>
      request('/api/auth/user', { skipAuthRecovery: true }).then((res) =>
        res.json()
      ),
    enabled: isValidToken,
  });

  const userName = userInfo?.userName;
  const pictureUrl = userInfo?.pictureUrl;
  const expiresAtMs =
    typeof authInfo?.auth?.expiresAtMs === 'number'
      ? authInfo.auth.expiresAtMs
      : undefined;
  const canRefreshSession = authInfo?.auth?.canRefresh === true;

  const login = useCallback(
    (returnTo?: string) =>
      resolveClientLoginAction(authInfo?.authStrategy, returnTo),
    [authInfo?.authStrategy]
  );

  const logoutWithRedirect = useCallback(
    (notice?: AuthLogoutNotice, returnTo?: string) =>
      resolveClientLogoutRedirect(authInfo?.authStrategy, notice, returnTo),
    [authInfo?.authStrategy]
  );

  const saveToken = useCallback(
    async (token: string) => {
      await request('/api/auth/token', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const { data } = await refetch();
      await queryClient.invalidateQueries({ queryKey: ['auth-user'] });
      return data?.auth?.isValidToken === true;
    },
    [refetch, queryClient]
  );

  const authStrategy = authInfo?.authStrategy;

  const recoverSession = useCallback(
    async (returnTo?: string) => {
      if (!supportsSessionRecovery(authStrategy)) {
        return { kind: 'noop' as const };
      }
      const recovery = await handleApiUnauthorized({
        returnTo:
          returnTo ?? `${window.location.pathname}${window.location.search}`,
        notice: 'session-expired',
      });
      if (recovery.kind === 'recovered') {
        await refetch();
      }
      return recovery;
    },
    [authStrategy, refetch]
  );

  const logout = useCallback(async () => {
    if (isOidcAuth) {
      return;
    }
    try {
      await request('/api/auth/token', { method: 'DELETE' });
    } finally {
      await refetch();
      await queryClient.invalidateQueries({ queryKey: ['auth-user'] });
    }
  }, [isOidcAuth, refetch, queryClient]);

  return {
    isAuthEnabled,
    isJwtAuth,
    isOidcAuth,
    isValidToken,
    isAuthLoading,
    userName,
    pictureUrl,
    expiresAtMs,
    canRefreshSession,
    login,
    saveToken,
    recoverSession,
    logout,
    logoutWithRedirect,
  };
}
