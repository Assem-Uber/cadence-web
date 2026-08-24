import 'server-only';

import { type AuthServerStrategy } from '@/utils/auth/auth.types';

import { getTrustedHeaderGrpcMetadata } from './get-trusted-header-grpc-metadata';
import { resolveTrustedHeaderAuthContext } from './resolve-trusted-header-auth-context';

const trustedHeaderAuthStrategy: AuthServerStrategy = {
  server: {
    resolveContext: resolveTrustedHeaderAuthContext,
    async getLoginRedirectIfNeeded() {
      // Identity is established upstream at the trusted perimeter (e.g. an
      // auth proxy in front of Cadence Web); there is no login page here.
      return null;
    },
    async recoverSession() {
      return { result: { kind: 'noop' } };
    },
    getGrpcMetadata(_authContext, request) {
      return getTrustedHeaderGrpcMetadata(request);
    },
  },
};

export default trustedHeaderAuthStrategy;
