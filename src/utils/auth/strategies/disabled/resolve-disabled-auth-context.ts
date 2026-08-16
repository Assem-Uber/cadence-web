import 'server-only';

import {
  type CookieReader,
  type PrivateAuthContext,
} from '@/utils/auth/auth.types';

export async function resolveDisabledAuthContext(
  _cookies: CookieReader
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
