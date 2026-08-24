import { type NextRequest } from 'next/server';

import { resolveGrpcMetadataForAuth } from '@/utils/auth/auth-context';

import grpcMetadataMiddleware from '../grpc-metadata';

jest.mock('@/utils/auth/auth-context', () => ({
  resolveGrpcMetadataForAuth: jest.fn(),
}));
const mockResolveGrpcMetadataForAuth = jest.mocked(resolveGrpcMetadataForAuth);
const mockRequest = {
  cookies: {
    get: jest.fn(),
  },
  headers: {
    get: jest.fn(),
  },
} as unknown as NextRequest;
const mockOptions = { params: {} };

describe('grpc-metadata middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns grpc metadata derived from auth info', async () => {
    mockResolveGrpcMetadataForAuth.mockResolvedValue({
      'cadence-authorization': 'abc',
    });

    const ctx: Record<string, unknown> = {
      authInfo: {
        authEnabled: true,
        auth: { isValidToken: true, token: 'abc' },
        isAdmin: false,
        groups: [],
      },
    };

    const result = await grpcMetadataMiddleware(mockRequest, mockOptions, ctx);

    expect(result).toEqual([
      'grpcMetadata',
      { 'cadence-authorization': 'abc' },
    ]);
    expect(mockResolveGrpcMetadataForAuth).toHaveBeenCalledWith(ctx.authInfo, {
      cookies: mockRequest.cookies,
      headers: mockRequest.headers,
    });
  });

  it('returns undefined metadata when auth provides none', async () => {
    mockResolveGrpcMetadataForAuth.mockResolvedValue(undefined);

    const result = await grpcMetadataMiddleware(mockRequest, mockOptions, {});

    expect(result).toEqual(['grpcMetadata', undefined]);
  });
});
