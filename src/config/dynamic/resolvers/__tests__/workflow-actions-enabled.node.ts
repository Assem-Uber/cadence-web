import { type DomainAccessResponse } from '@/route-handlers/domain-access/domain-access.types';
import { FULL_ACCESS, NO_ACCESS } from '@/utils/auth/auth.constants';
import request from '@/utils/request';

import workflowActionsEnabled from '../workflow-actions-enabled';

jest.mock('@/utils/request', () => jest.fn());
const mockRequest = jest.mocked(request);

const mockDomainAccess = {
  mockResolvedValue: (access: DomainAccessResponse) =>
    mockRequest.mockResolvedValue({
      json: async () => access,
    } as Response),
  mockRejectedValue: (error: Error) => mockRequest.mockRejectedValue(error),
};

describe(workflowActionsEnabled.name, () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns enabled actions when user has write access', async () => {
    mockDomainAccess.mockResolvedValue({ ...FULL_ACCESS, isAdmin: false });

    const result = await workflowActionsEnabled({
      cluster: 'test-cluster',
      domain: 'test-domain',
    });

    expect(mockRequest).toHaveBeenCalledWith(
      '/api/domains/test-domain/test-cluster/access'
    );
    expect(result).toEqual({
      terminate: 'ENABLED',
      cancel: 'ENABLED',
      restart: 'ENABLED',
      reset: 'ENABLED',
      signal: 'ENABLED',
      start: 'ENABLED',
    });
  });

  it('returns unauthorized actions when write access is denied', async () => {
    mockDomainAccess.mockResolvedValue({ ...NO_ACCESS, isAdmin: false });

    const result = await workflowActionsEnabled({
      cluster: 'test-cluster',
      domain: 'test-domain',
    });

    expect(result).toEqual({
      terminate: 'DISABLED_UNAUTHORIZED',
      cancel: 'DISABLED_UNAUTHORIZED',
      restart: 'DISABLED_UNAUTHORIZED',
      reset: 'DISABLED_UNAUTHORIZED',
      signal: 'DISABLED_UNAUTHORIZED',
      start: 'DISABLED_UNAUTHORIZED',
    });
  });

  it('returns default-disabled actions when domain access resolution fails', async () => {
    mockDomainAccess.mockRejectedValue(new Error('boom'));

    const result = await workflowActionsEnabled({
      cluster: 'test-cluster',
      domain: 'test-domain',
    });

    expect(result).toEqual({
      terminate: 'DISABLED_DEFAULT',
      cancel: 'DISABLED_DEFAULT',
      restart: 'DISABLED_DEFAULT',
      reset: 'DISABLED_DEFAULT',
      signal: 'DISABLED_DEFAULT',
      start: 'DISABLED_DEFAULT',
    });
  });
});
