'use client';
import { useQuery } from '@tanstack/react-query';

import { setCachedAuthStrategyConfig } from '@/utils/auth/helpers/auth-strategy-config-cache';
import { type PublicAuthContext } from '@/utils/auth/auth.types';
import request from '@/utils/request';
import { type RequestError } from '@/utils/request/request-error';

export default function useUserInfo() {
  return useQuery<PublicAuthContext, RequestError>({
    queryKey: ['auth-me'],
    queryFn: async () => {
      const res = await request('/api/auth/me', {
        method: 'GET',
        skipAuthRecovery: true,
      });
      const data = (await res.json()) as PublicAuthContext;
      setCachedAuthStrategyConfig(data.authStrategy);
      return data;
    },
  });
}
