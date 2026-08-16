import { OIDC_LOGOUT_PATH } from '@/utils/auth/auth.constants';
import {
  type AuthLogoutNotice,
  type AuthClientPolicy,
  type AuthLoginResult,
} from '@/utils/auth/auth.types';
import { callAuthRecoverApi } from '@/utils/auth/helpers/call-auth-recover-api';

import { buildOidcLoginPath } from './build-oidc-login-path';

export function startOidcLogin(returnTo?: string | null): AuthLoginResult {
  window.location.assign(buildOidcLoginPath(returnTo));
  return 'redirect';
}

export function startOidcLogoutRedirect(notice?: AuthLogoutNotice): void {
  const logoutUrl = notice
    ? `${OIDC_LOGOUT_PATH}?notice=${notice}`
    : OIDC_LOGOUT_PATH;
  window.location.assign(logoutUrl);
}

const oidcClientPolicy: AuthClientPolicy = {
  supportsSessionRecovery: true,
  login(returnTo) {
    return startOidcLogin(returnTo);
  },
  logout(notice, _returnTo) {
    startOidcLogoutRedirect(notice);
    return true;
  },
  onUnauthorized: callAuthRecoverApi,
};

export default oidcClientPolicy;
