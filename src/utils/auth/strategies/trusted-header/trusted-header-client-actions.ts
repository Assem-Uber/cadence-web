import { type AuthClientPolicy } from '@/utils/auth/auth.types';

// Login/logout happen upstream at the trusted perimeter; the browser has
// nothing to do, same as the disabled strategy.
const trustedHeaderClientPolicy: AuthClientPolicy = {
  supportsSessionRecovery: false,
  login() {
    return null;
  },
  logout() {
    return false;
  },
  async onUnauthorized() {
    return { kind: 'noop' };
  },
};

export default trustedHeaderClientPolicy;
