import 'server-only';

import { type AuthServerStrategy } from '@/utils/auth/auth.types';

import { recoverDisabledSession } from './recover-disabled-session';
import { resolveDisabledAuthContext } from './resolve-disabled-auth-context';

const disabledAuthStrategy: AuthServerStrategy = {
  server: {
    resolveContext: resolveDisabledAuthContext,
    async getLoginRedirectIfNeeded() {
      return null;
    },
    recoverSession() {
      return recoverDisabledSession();
    },
  },
};

export default disabledAuthStrategy;
