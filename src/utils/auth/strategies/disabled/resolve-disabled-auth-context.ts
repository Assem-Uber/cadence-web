import 'server-only';

import {
  type AuthRequest,
  type PrivateAuthContext,
} from '@/utils/auth/auth.types';

export async function resolveDisabledAuthContext(
  _request: AuthRequest
): Promise<PrivateAuthContext> {
  return {
    authEnabled: false,
    auth: {
      isValidToken: false,
      token: undefined,
    },
    groups: [],
    isAdmin: false,
  };
}
