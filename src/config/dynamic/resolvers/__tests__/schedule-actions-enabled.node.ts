import { type DomainAccessResponse } from '@/route-handlers/domain-access/domain-access.types';
import { FULL_ACCESS, NO_ACCESS } from '@/utils/auth/auth.constants';
import request from '@/utils/request';

import scheduleActionsEnabled from '../schedule-actions-enabled';

jest.mock('@/utils/request', () => jest.fn());
const mockRequest = jest.mocked(request);

const mockDomainAccess = {
  mockResolvedValue: (access: DomainAccessResponse) =>
    mockRequest.mockResolvedValue({
      json: async () => access,
    } as Response),
  mockRejectedValue: (error: Error) => mockRequest.mockRejectedValue(error),
};

describe(scheduleActionsEnabled.name, () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns enabled actions when user has write access', async () => {
    mockDomainAccess.mockResolvedValue({ ...FULL_ACCESS, isAdmin: false });

    const result = await scheduleActionsEnabled({
      cluster: 'test-cluster',
      domain: 'test-domain',
    });

    expect(mockRequest).toHaveBeenCalledWith(
      '/api/domains/test-domain/test-cluster/access'
    );
    expect(result).toEqual({
      pause: 'ENABLED',
      resume: 'ENABLED',
      delete: 'ENABLED',
      backfill: 'ENABLED',
      start: 'ENABLED',
    });
  });

  it('returns unauthorized actions when write access is denied', async () => {
    mockDomainAccess.mockResolvedValue({ ...NO_ACCESS, isAdmin: false });

    const result = await scheduleActionsEnabled({
      cluster: 'test-cluster',
      domain: 'test-domain',
    });

    expect(result).toEqual({
      pause: 'DISABLED_UNAUTHORIZED',
      resume: 'DISABLED_UNAUTHORIZED',
      delete: 'DISABLED_UNAUTHORIZED',
      backfill: 'DISABLED_UNAUTHORIZED',
      start: 'DISABLED_UNAUTHORIZED',
    });
  });

  it('returns default-disabled actions when domain access resolution fails', async () => {
    mockDomainAccess.mockRejectedValue(new Error('boom'));

    const result = await scheduleActionsEnabled({
      cluster: 'test-cluster',
      domain: 'test-domain',
    });

    expect(result).toEqual({
      pause: 'DISABLED_DEFAULT',
      resume: 'DISABLED_DEFAULT',
      delete: 'DISABLED_DEFAULT',
      backfill: 'DISABLED_DEFAULT',
      start: 'DISABLED_DEFAULT',
    });
  });
});
