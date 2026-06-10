import { type DescribeScheduleResponse } from '@/__generated__/proto-ts/uber/cadence/api/v1/DescribeScheduleResponse';

export function getMockDescribeScheduleResponse(
  overrides: Partial<DescribeScheduleResponse> = {}
): DescribeScheduleResponse {
  return {
    spec: {
      cronExpression: '0 * * * *',
      startTime: null,
      endTime: null,
      jitter: null,
    },
    action: {
      startWorkflowAction: {
        workflowType: { name: 'mock-workflow-type' },
        taskList: { name: 'mock-task-list', kind: 'TASK_LIST_KIND_NORMAL' },
        input: null,
        workflowIdPrefix: 'mock-prefix',
        executionStartToCloseTimeout: { seconds: '3600', nanos: 0 },
        taskStartToCloseTimeout: { seconds: '10', nanos: 0 },
        retryPolicy: null,
        memo: null,
        searchAttributes: null,
      },
    },
    policies: {
      overlapPolicy: 'SCHEDULE_OVERLAP_POLICY_SKIP',
      catchUpPolicy: 'SCHEDULE_CATCH_UP_POLICY_UNLIMITED',
      catchUpWindow: null,
      pauseOnFailure: false,
      bufferLimit: 0,
      concurrencyLimit: 0,
    },
    state: {
      paused: false,
      pauseInfo: null,
    },
    info: {
      lastRunTime: { seconds: '1700000000', nanos: 0 },
      nextRunTime: { seconds: '1700003600', nanos: 0 },
      totalRuns: '42',
      createTime: { seconds: '1699000000', nanos: 0 },
      lastUpdateTime: { seconds: '1700000000', nanos: 0 },
      ongoingBackfills: [],
    },
    memo: null,
    searchAttributes: null,
    ...overrides,
  };
}

export const mockRunningDescribeScheduleResponse =
  getMockDescribeScheduleResponse();

export const mockPausedDescribeScheduleResponse =
  getMockDescribeScheduleResponse({
    state: {
      paused: true,
      pauseInfo: {
        reason: 'Paused for maintenance',
        pausedAt: { seconds: '1700001000', nanos: 0 },
        pausedBy: 'operator@example.com',
      },
    },
  });

export const mockDescribeScheduleResponseNoNextRun =
  getMockDescribeScheduleResponse({
    info: {
      lastRunTime: { seconds: '1700000000', nanos: 0 },
      nextRunTime: null,
      totalRuns: '10',
      createTime: { seconds: '1699000000', nanos: 0 },
      lastUpdateTime: { seconds: '1700000000', nanos: 0 },
      ongoingBackfills: [],
    },
  });
