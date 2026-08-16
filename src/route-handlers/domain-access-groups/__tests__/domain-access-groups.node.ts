import { NextRequest } from 'next/server';

import { type Domain } from '@/__generated__/proto-ts/uber/cadence/api/v1/Domain';
import { type PrivateAuthContext } from '@/utils/auth/auth.types';

import { getDomainAccessGroups } from '../domain-access-groups';
import { type Context } from '../domain-access-groups.types';

const REQUEST = new NextRequest(
  'http://localhost/api/domains/test-domain/test-cluster/access-groups'
);
const REQUEST_PARAMS = {
  params: { domain: 'test-domain', cluster: 'test-cluster' },
};

describe('getDomainAccessGroups', () => {
  it('returns the domain read/write groups', async () => {
    const { response } = await setup({
      domainData: {
        READ_GROUPS: 'readers, auditors',
        WRITE_GROUPS: 'writers',
      },
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      readGroups: ['readers', 'auditors'],
      writeGroups: ['writers'],
    });
  });

  it('returns empty lists when the domain has no group metadata', async () => {
    const { response } = await setup({});

    expect(await response.json()).toEqual({
      readGroups: [],
      writeGroups: [],
    });
  });

  it('denies access to users without read access to the domain', async () => {
    const { response } = await setup({
      domainData: { READ_GROUPS: 'readers', WRITE_GROUPS: 'writers' },
      authInfo: makeAuthContext({ isAdmin: false, groups: ['unrelated'] }),
    });

    expect(response.status).toBe(403);
  });

  it('returns 404 when the domain does not exist', async () => {
    const { response } = await setup({ domainMissing: true });

    expect(response.status).toBe(404);
  });

  it('returns an error response when describeDomain fails', async () => {
    const { response } = await setup({ describeError: new Error('boom') });

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
    isAdmin: true,
    ...overrides,
  };
}

async function setup({
  domainData = {},
  authInfo = makeAuthContext(),
  domainMissing,
  describeError,
}: {
  domainData?: Record<string, string>;
  authInfo?: PrivateAuthContext;
  domainMissing?: boolean;
  describeError?: Error;
}) {
  const mockDescribeDomain = jest.fn(async () => {
    if (describeError) throw describeError;
    if (domainMissing) return { domain: undefined };
    return { domain: { data: domainData } as unknown as Domain };
  });

  const ctx = {
    authInfo,
    grpcClusterMethods: { describeDomain: mockDescribeDomain },
  } as unknown as Context;

  const response = await getDomainAccessGroups(REQUEST, REQUEST_PARAMS, ctx);
  return { response, mockDescribeDomain };
}
