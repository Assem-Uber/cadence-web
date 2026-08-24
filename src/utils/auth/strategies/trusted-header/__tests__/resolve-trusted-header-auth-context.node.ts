import { type AuthRequest } from '@/utils/auth/auth.types';
import getConfigValue from '@/utils/config/get-config-value';

import { resolveTrustedHeaderAuthContext } from '../resolve-trusted-header-auth-context';

jest.mock('@/utils/config/get-config-value');

const mockGetConfigValue = getConfigValue as jest.MockedFunction<
  typeof getConfigValue
>;

function requestWithHeaders(values: Record<string, string>): AuthRequest {
  return {
    cookies: { get: () => undefined },
    headers: { get: (name: string) => values[name] ?? null },
  };
}

describe(resolveTrustedHeaderAuthContext.name, () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns unauthenticated when the strategy has no resolved config', async () => {
    mockGetConfigValue.mockResolvedValue(null);

    const context = await resolveTrustedHeaderAuthContext(
      requestWithHeaders({})
    );

    expect(context).toEqual({
      authEnabled: true,
      auth: { isValidToken: false },
      groups: [],
      isAdmin: false,
    });
  });

  it('returns unauthenticated when the user id header is missing', async () => {
    mockGetConfigValue.mockResolvedValue({
      userIdHeader: 'x-test-user-id',
      grpcMetadataMap: [],
    });

    const context = await resolveTrustedHeaderAuthContext(
      requestWithHeaders({})
    );

    expect(context.auth.isValidToken).toBe(false);
  });

  it('reads identity, groups and admin from configured headers', async () => {
    mockGetConfigValue.mockResolvedValue({
      userIdHeader: 'x-test-user-id',
      nameHeader: 'x-test-name',
      groupsHeader: 'x-test-groups',
      adminHeader: 'x-test-admin',
      grpcMetadataMap: [],
    });

    const context = await resolveTrustedHeaderAuthContext(
      requestWithHeaders({
        'x-test-user-id': 'alice',
        'x-test-name': 'Alice Example',
        'x-test-groups': 'reader, writer',
        'x-test-admin': 'true',
      })
    );

    expect(context).toEqual({
      authEnabled: true,
      auth: { isValidToken: true },
      groups: ['reader', 'writer'],
      isAdmin: true,
      id: 'alice',
      userName: 'Alice Example',
    });
  });

  it('falls back to the user id as the display name', async () => {
    mockGetConfigValue.mockResolvedValue({
      userIdHeader: 'x-test-user-id',
      grpcMetadataMap: [],
    });

    const context = await resolveTrustedHeaderAuthContext(
      requestWithHeaders({ 'x-test-user-id': 'alice' })
    );

    expect(context.userName).toBe('alice');
    expect(context.groups).toEqual([]);
    expect(context.isAdmin).toBe(false);
  });

  it('rejects requests missing a valid shared secret', async () => {
    mockGetConfigValue.mockResolvedValue({
      userIdHeader: 'x-test-user-id',
      sharedSecretHeader: 'x-test-shared-secret',
      sharedSecret: 'super-secret',
      grpcMetadataMap: [],
    });

    const context = await resolveTrustedHeaderAuthContext(
      requestWithHeaders({
        'x-test-user-id': 'alice',
        'x-test-shared-secret': 'wrong-secret',
      })
    );

    expect(context.auth.isValidToken).toBe(false);
  });

  it('accepts requests with a valid shared secret', async () => {
    mockGetConfigValue.mockResolvedValue({
      userIdHeader: 'x-test-user-id',
      sharedSecretHeader: 'x-test-shared-secret',
      sharedSecret: 'super-secret',
      grpcMetadataMap: [],
    });

    const context = await resolveTrustedHeaderAuthContext(
      requestWithHeaders({
        'x-test-user-id': 'alice',
        'x-test-shared-secret': 'super-secret',
      })
    );

    expect(context.auth.isValidToken).toBe(true);
    expect(context.id).toBe('alice');
  });
});
