import 'server-only';

import { type AuthServerStrategy } from '@/utils/auth/auth.types';

import { buildOidcLoginPath } from './build-oidc-login-path';
import { recoverOidcSession } from './recover-oidc-session';
import { resolveOidcAuthContext } from './resolve-oidc-auth-context';

const oidcAuthStrategy: AuthServerStrategy = {
  server: {
    resolveContext: resolveOidcAuthContext,
    async getLoginRedirectIfNeeded(cookieStore, returnTo) {
      const authContext = await resolveOidcAuthContext(cookieStore);
      if (authContext.auth.isValidToken) {
        return null;
      }

      return buildOidcLoginPath(returnTo);
    },
    recoverSession: recoverOidcSession,
  },
};

export default oidcAuthStrategy;
