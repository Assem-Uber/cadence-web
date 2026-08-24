import { type AuthRequest } from '@/utils/auth/auth.types';
import getConfigValue from '@/utils/config/get-config-value';

import trustedHeaderAuthStrategy from '../trusted-header-auth-strategy';

jest.mock('@/utils/config/get-config-value');

const mockGetConfigValue = getConfigValue as jest.MockedFunction<
  typeof getConfigValue
>;

const noopRequest: AuthRequest = {
  cookies: { get: () => undefined },
  headers: { get: () => null },
};

describe('trustedHeaderAuthStrategy', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('never redirects to a login page', async () => {
    await expect(
      trustedHeaderAuthStrategy.server.getLoginRedirectIfNeeded(
        noopRequest,
        '/domains'
      )
    ).resolves.toBeNull();
  });

  it('treats session recovery as a noop', async () => {
    await expect(
      trustedHeaderAuthStrategy.server.recoverSession(noopRequest, {
        returnTo: '/domains',
        notice: 'session-expired',
      })
    ).resolves.toEqual({ result: { kind: 'noop' } });
  });

  it('delegates gRPC metadata to the configured header copy map', async () => {
    mockGetConfigValue.mockResolvedValue({
      userIdHeader: 'x-test-user-id',
      grpcMetadataMap: [
        { inboundHeader: 'x-test-user-id', outboundKey: 'caller-id' },
      ],
    });

    await expect(
      trustedHeaderAuthStrategy.server.getGrpcMetadata?.(
        {
          authEnabled: true,
          auth: { isValidToken: true },
          groups: [],
          isAdmin: false,
        },
        {
          cookies: { get: () => undefined },
          headers: { get: () => 'alice' },
        }
      )
    ).resolves.toEqual({ 'caller-id': 'alice' });
  });
});
