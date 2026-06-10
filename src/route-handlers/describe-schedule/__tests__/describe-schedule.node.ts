import { status } from '@grpc/grpc-js';
import { NextRequest } from 'next/server';

import { GRPCError } from '@/utils/grpc/grpc-error';
import logger from '@/utils/logger';
import { mockGrpcClusterMethods } from '@/utils/route-handlers-middleware/middlewares/__mocks__/grpc-cluster-methods';

import {
  mockRunningDescribeScheduleResponse,
  mockPausedDescribeScheduleResponse,
} from '../__fixtures__/mock-describe-schedule-response';
import { describeSchedule } from '../describe-schedule';
import { type Context, type RequestParams } from '../describe-schedule.types';

jest.mock('@/utils/logger');

describe(describeSchedule.name, () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('calls describeSchedule and returns the response for a running schedule', async () => {
    const { res, mockDescribeSchedule } = await setup({
      response: mockRunningDescribeScheduleResponse,
    });

    expect(mockDescribeSchedule).toHaveBeenCalledWith({
      domain: 'mock-domain',
      scheduleId: 'mock-schedule-id',
    });

    expect(res.status).toEqual(200);
    const responseJson = await res.json();
    expect(responseJson.state.paused).toBe(false);
    expect(responseJson.info.nextRunTime).toBeTruthy();
  });

  it('returns describe response for a paused schedule', async () => {
    const { res } = await setup({
      response: mockPausedDescribeScheduleResponse,
    });

    expect(res.status).toEqual(200);
    const responseJson = await res.json();
    expect(responseJson.state.paused).toBe(true);
    expect(responseJson.state.pauseInfo.reason).toBe('Paused for maintenance');
    expect(responseJson.state.pauseInfo.pausedBy).toBe(
      'operator@example.com'
    );
  });

  it('returns 404 when describeSchedule throws a NOT_FOUND GRPCError', async () => {
    const { res } = await setup({
      error: new GRPCError('schedule not found', {
        grpcStatusCode: status.NOT_FOUND,
      }),
    });

    expect(res.status).toEqual(404);
    const responseJson = await res.json();
    expect(responseJson).toEqual(
      expect.objectContaining({ message: 'schedule not found' })
    );

    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        requestParams: {
          domain: 'mock-domain',
          cluster: 'mock-cluster',
          scheduleId: 'mock-schedule-id',
        },
        error: expect.any(GRPCError),
      }),
      'Error describing schedule: schedule not found'
    );
  });

  it('returns 500 when describeSchedule throws a generic error', async () => {
    const { res } = await setup({
      error: new Error('connection reset'),
    });

    expect(res.status).toEqual(500);
    const responseJson = await res.json();
    expect(responseJson).toEqual(
      expect.objectContaining({ message: 'Error describing schedule' })
    );

    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        requestParams: {
          domain: 'mock-domain',
          cluster: 'mock-cluster',
          scheduleId: 'mock-schedule-id',
        },
        error: expect.any(Error),
      }),
      'Error describing schedule'
    );
  });
});

async function setup({
  response,
  error,
}: {
  response?: Awaited<
    ReturnType<typeof mockGrpcClusterMethods.describeSchedule>
  >;
  error?: Error;
} = {}) {
  const mockDescribeSchedule = jest
    .spyOn(mockGrpcClusterMethods, 'describeSchedule')
    .mockImplementationOnce(async () => {
      if (error) {
        throw error;
      }
      return response ?? mockRunningDescribeScheduleResponse;
    });

  const res = await describeSchedule(
    new NextRequest('http://localhost'),
    {
      params: {
        domain: 'mock-domain',
        cluster: 'mock-cluster',
        scheduleId: 'mock-schedule-id',
      },
    } as RequestParams,
    {
      grpcClusterMethods: mockGrpcClusterMethods,
    } as Context
  );

  return { res, mockDescribeSchedule };
}
