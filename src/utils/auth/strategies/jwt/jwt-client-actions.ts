import {
  type AuthLogoutNotice,
  type AuthClientPolicy,
  type AuthLoginResult,
} from '@/utils/auth/auth.types';
import { callAuthRecoverApi } from '@/utils/auth/helpers/call-auth-recover-api';

import { buildJwtLoginPath } from './build-jwt-login-path';

export function startJwtLogin(returnTo?: string | null): AuthLoginResult {
  window.location.assign(buildJwtLoginPath(returnTo));
  return 'redirect';
}

export function startJwtLogoutRedirect(
  notice?: AuthLogoutNotice,
  returnTo?: string | null
): void {
  window.location.assign(buildJwtLoginPath(returnTo, notice));
}

const jwtClientPolicy: AuthClientPolicy = {
  // JWT recovery always redirects to the login page; nothing silent to try.
  supportsSessionRecovery: false,
  login(returnTo) {
    return startJwtLogin(returnTo);
  },
  logout(notice, returnTo) {
    startJwtLogoutRedirect(notice, returnTo);
    return true;
  },
  onUnauthorized: callAuthRecoverApi,
};

export default jwtClientPolicy;
