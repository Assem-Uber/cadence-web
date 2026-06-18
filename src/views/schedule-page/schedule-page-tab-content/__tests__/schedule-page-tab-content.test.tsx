import React from 'react';

import { HttpResponse, delay, type HttpResponseResolver } from 'msw';

import { render, screen, waitForElementToBeRemoved } from '@/test-utils/rtl';

import { getMockRunningDescribeScheduleResponse } from '@/route-handlers/describe-schedule/__fixtures__/mock-describe-schedule-response';

import { type SchedulePageTabsParams } from '../../schedule-page-tabs/schedule-page-tabs.types';
import SchedulePageTabContent from '../schedule-page-tab-content';

jest.mock('next/navigation', () => ({
  ...jest.requireActual('next/navigation'),
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
  notFound: jest.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

describe(SchedulePageTabContent.name, () => {
  it('shows loading first then renders detail sections with representative values', async () => {
    const describeResolver = jest.fn(async () => {
      await delay(100);
      return HttpResponse.json(
        getMockRunningDescribeScheduleResponse({
          spec: {
            cronExpression: '0 * * * *',
            startTime: { seconds: '1735689600', nanos: 0 },
            endTime: null,
            jitter: { seconds: '300', nanos: 0 },
          },
          policies: {
            overlapPolicy: 'SCHEDULE_OVERLAP_POLICY_BUFFER',
            catchUpPolicy: 'SCHEDULE_CATCH_UP_POLICY_ONE',
            catchUpWindow: { seconds: '3600', nanos: 0 },
            pauseOnFailure: true,
            bufferLimit: 10,
            concurrencyLimit: 2,
          },
          action: {
            startWorkflow: {
              workflowType: { name: 'ScheduleWorker' },
              taskList: {
                name: 'schedule-task-list',
                kind: 'TASK_LIST_KIND_NORMAL',
                baseName: 'schedule-task-list',
              },
              input: null,
              workflowIdPrefix: 'schedule-prefix',
              executionStartToCloseTimeout: { seconds: '1800', nanos: 0 },
              taskStartToCloseTimeout: null,
              retryPolicy: null,
              memo: null,
              searchAttributes: null,
            },
          },
        })
      );
    });

    setup({ scheduleTab: 'details', describeResolver });

    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    expect(screen.getByRole('heading', { name: 'Specifications' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Policies' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Action' })).toBeInTheDocument();

    expect(screen.getByRole('rowheader', { name: 'Cron expression' })).toBeInTheDocument();
    expect(screen.getByText('0 * * * *')).toBeInTheDocument();
    expect(screen.getByText('5m')).toBeInTheDocument();
    expect(screen.getByText('Buffer')).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument();
    expect(screen.getByText('ScheduleWorker')).toBeInTheDocument();

    expect(screen.queryByRole('rowheader', { name: 'End time' })).not.toBeInTheDocument();
    expect(describeResolver).toHaveBeenCalledTimes(1);
  });

  it('shows loading first then renders placeholder for runs tab after describe succeeds', async () => {
    const describeResolver = jest.fn(async () => {
      await delay(100);
      return HttpResponse.json(getMockRunningDescribeScheduleResponse());
    });

    setup({ scheduleTab: 'runs', describeResolver });

    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    expect(screen.getByText('Runs — coming soon')).toBeInTheDocument();
    expect(describeResolver).toHaveBeenCalledTimes(1);
  });

  it('hides optional detail rows when schedule fields are missing', async () => {
    setup({
      scheduleTab: 'details',
      describeResolver: () =>
        HttpResponse.json(
          getMockRunningDescribeScheduleResponse({
            spec: {
              cronExpression: '*/10 * * * *',
              startTime: null,
              endTime: null,
              jitter: null,
            },
            policies: {
              overlapPolicy: 'SCHEDULE_OVERLAP_POLICY_INVALID',
              catchUpPolicy: 'SCHEDULE_CATCH_UP_POLICY_INVALID',
              catchUpWindow: null,
              pauseOnFailure: false,
              bufferLimit: 0,
              concurrencyLimit: 0,
            },
            action: { startWorkflow: null },
          })
        ),
    });

    expect(await screen.findByRole('heading', { name: 'Specifications' })).toBeInTheDocument();
    expect(screen.queryByRole('rowheader', { name: 'Start time' })).not.toBeInTheDocument();
    expect(screen.queryByRole('rowheader', { name: 'Jitter' })).not.toBeInTheDocument();
    expect(screen.queryByRole('rowheader', { name: 'Overlap policy' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Action' })).not.toBeInTheDocument();
  });

  it('renders retryable error state when describe fails with non-404 status', async () => {
    setup({
      describeResolver: () =>
        HttpResponse.json(
          { message: 'Failed to describe schedule' },
          { status: 500 }
        ),
    });

    expect(
      await screen.findByText('Failed to load schedule')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });

  it('renders schedule not-found state when describe returns 404', async () => {
    setup({
      describeResolver: () =>
        HttpResponse.json({ message: 'Schedule not found' }, { status: 404 }),
    });

    expect(
      await screen.findByText('Schedule "my-schedule" was not found')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Go to schedules' })
    ).toBeInTheDocument();
  });

  it('calls notFound for unknown tab slug', () => {
    const { notFound } = jest.requireMock('next/navigation');
    expect(() =>
      setup({
        scheduleTab: 'unknown-tab' as SchedulePageTabsParams['scheduleTab'],
      })
    ).toThrow('NEXT_NOT_FOUND');
    expect(notFound).toHaveBeenCalled();
  });
});

function setup({
  scheduleTab = 'details',
  describeResolver = () =>
    HttpResponse.json(getMockRunningDescribeScheduleResponse()),
}: {
  scheduleTab?: SchedulePageTabsParams['scheduleTab'];
  describeResolver?: HttpResponseResolver;
} = {}) {
  render(
    <SchedulePageTabContent
      params={{
        domain: 'test-domain',
        cluster: 'test-cluster',
        scheduleId: 'my-schedule',
        scheduleTab,
      }}
    />,
    {
      endpointsMocks: [
        {
          path: '/api/domains/:domain/:cluster/schedules/:scheduleId',
          httpMethod: 'GET',
          mockOnce: false,
          httpResolver: describeResolver,
        },
      ],
    }
  );
}
