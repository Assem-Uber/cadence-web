import { type AuthClientPolicy } from '@/utils/auth/auth.types';

const disabledClientPolicy: AuthClientPolicy = {
  supportsSessionRecovery: false,
  login() {
    return null;
  },
  logout(_notice, _returnTo) {
    return false;
  },
  async onUnauthorized() {
    return { kind: 'noop' };
  },
};

export default disabledClientPolicy;
