import 'server-only';

import { JWT_LOGIN_PATH } from '@/utils/auth/auth.constants';
import { type AuthServerStrategy } from '@/utils/auth/auth.types';

import { buildJwtLoginPath } from './build-jwt-login-path';
import { recoverJwtSession } from './recover-jwt-session';
import { resolveJwtAuthContext } from './resolve-jwt-auth-context';

function isJwtLoginReturnTo(returnTo: string): boolean {
  return (
    returnTo === JWT_LOGIN_PATH || returnTo.startsWith(`${JWT_LOGIN_PATH}?`)
  );
}

const jwtAuthStrategy: AuthServerStrategy = {
  server: {
    resolveContext(cookies) {
      return resolveJwtAuthContext(cookies);
    },
    async getLoginRedirectIfNeeded(cookieStore, returnTo) {
      const authContext = await resolveJwtAuthContext(cookieStore);
      if (authContext.auth.isValidToken || isJwtLoginReturnTo(returnTo)) {
        return null;
      }

      return buildJwtLoginPath(returnTo);
    },
    recoverSession(_cookies, ctx) {
      return recoverJwtSession(ctx);
    },
  },
};

export default jwtAuthStrategy;
