import { NextRequest } from 'next/server';

import { type Domain } from '@/__generated__/proto-ts/uber/cadence/api/v1/Domain';
import { type PrivateAuthContext } from '@/utils/auth/auth.types';
import { GRPCError } from '@/utils/grpc/grpc-error';

import { getDomainAccess } from '../domain-access';
import { type Context } from '../domain-access.types';

const REQUEST = new NextRequest(
  'http://localhost/api/domains/test-domain/test-cluster/access'
);
const REQUEST_PARAMS = {
  params: { domain: 'test-domain', cluster: 'test-cluster' },
};

describe('getDomainAccess', () => {
  it('returns full access with isAdmin=false when auth is disabled', async () => {
    const { response } = await setup({
      authInfo: makeAuthContext({ authEnabled: false }),
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      canRead: true,
      canWrite: true,
      isAdmin: false,
    });
  });

  it('returns full access with isAdmin=true for admins without describing the domain', async () => {
    const { response, mockDescribeDomain } = await setup({
      authInfo: makeAuthContext({ isAdmin: true }),
    });

    expect(await response.json()).toEqual({
      canRead: true,
      canWrite: true,
      isAdmin: true,
    });
    expect(mockDescribeDomain).not.toHaveBeenCalled();
  });

  it('returns no access for an invalid token', async () => {
    const { response, mockDescribeDomain } = await setup({
      authInfo: makeAuthContext({ auth: { isValidToken: false } }),
    });

    expect(await response.json()).toEqual({
      canRead: false,
      canWrite: false,
      isAdmin: false,
    });
    expect(mockDescribeDomain).not.toHaveBeenCalled();
  });

  it('resolves access from domain group metadata for regular users', async () => {
    const { response } = await setup({
      authInfo: makeAuthContext({ groups: ['readers'] }),
      domainData: { READ_GROUPS: 'readers', WRITE_GROUPS: 'writers' },
    });

    expect(await response.json()).toEqual({
      canRead: true,
      canWrite: false,
      isAdmin: false,
    });
  });

  it('returns no access when describeDomain is denied', async () => {
    const { response } = await setup({
      authInfo: makeAuthContext(),
      describeError: new GRPCError('denied', { grpcStatusCode: 7 }),
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      canRead: false,
      canWrite: false,
      isAdmin: false,
    });
  });

  it('returns an error response for unexpected failures', async () => {
    const { response } = await setup({
      authInfo: makeAuthContext(),
      describeError: new Error('boom'),
    });

    expect(response.status).toBe(500);
  });
});

function makeAuthContext(
  overrides: Partial<PrivateAuthContext> = {}
): PrivateAuthContext {
  return {
    authEnabled: true,
    auth: { isValidToken: true },
    groups: [],
    isAdmin: false,
    ...overrides,
  };
}

async function setup({
  authInfo,
  domainData = {},
  describeError,
}: {
  authInfo: PrivateAuthContext;
  domainData?: Record<string, string>;
  describeError?: Error;
}) {
  const mockDescribeDomain = jest.fn(async () => {
    if (describeError) throw describeError;
    return { domain: { data: domainData } as unknown as Domain };
  });

  const ctx = {
    authInfo,
    grpcClusterMethods: { describeDomain: mockDescribeDomain },
  } as unknown as Context;

  const response = await getDomainAccess(REQUEST, REQUEST_PARAMS, ctx);
  return { response, mockDescribeDomain };
}
