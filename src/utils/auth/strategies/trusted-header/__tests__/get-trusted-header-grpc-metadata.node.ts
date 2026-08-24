import { type AuthRequest } from '@/utils/auth/auth.types';
import getConfigValue from '@/utils/config/get-config-value';

import { getTrustedHeaderGrpcMetadata } from '../get-trusted-header-grpc-metadata';

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

describe(getTrustedHeaderGrpcMetadata.name, () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns undefined when there is no config', async () => {
    mockGetConfigValue.mockResolvedValue(null);

    await expect(
      getTrustedHeaderGrpcMetadata(requestWithHeaders({}))
    ).resolves.toBeUndefined();
  });

  it('returns undefined when the metadata map is empty', async () => {
    mockGetConfigValue.mockResolvedValue({
      userIdHeader: 'x-test-user-id',
      grpcMetadataMap: [],
    });

    await expect(
      getTrustedHeaderGrpcMetadata(requestWithHeaders({}))
    ).resolves.toBeUndefined();
  });

  it('copies configured headers into gRPC metadata keys', async () => {
    mockGetConfigValue.mockResolvedValue({
      userIdHeader: 'x-test-user-id',
      grpcMetadataMap: [
        { inboundHeader: 'x-test-user-id', outboundKey: 'caller-id' },
        { inboundHeader: 'x-test-groups', outboundKey: 'caller-groups' },
      ],
    });

    await expect(
      getTrustedHeaderGrpcMetadata(
        requestWithHeaders({ 'x-test-user-id': 'alice' })
      )
    ).resolves.toEqual({ 'caller-id': 'alice' });
  });
});
