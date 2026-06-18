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
  it('shows loading first then renders placeholder for details tab after describe succeeds', async () => {
    const describeResolver = jest.fn(async () => {
      await delay(100);
      return HttpResponse.json(getMockRunningDescribeScheduleResponse());
    });

    setup({ scheduleTab: 'details', describeResolver });

    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    expect(screen.getByText('Details — coming soon')).toBeInTheDocument();
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
