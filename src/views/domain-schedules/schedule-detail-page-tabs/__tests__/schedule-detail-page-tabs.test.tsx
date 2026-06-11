import React from 'react';

import { act, fireEvent, render, screen } from '@/test-utils/rtl';

import ScheduleDetailPageTabs from '../schedule-detail-page-tabs';

const mockPushFn = jest.fn();

jest.mock('next/navigation', () => ({
  ...jest.requireActual('next/navigation'),
  useRouter: () => ({
    push: mockPushFn,
    back: jest.fn(),
    replace: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
    refresh: jest.fn(),
  }),
  useParams: () => ({
    domain: 'test-domain',
    cluster: 'test-cluster',
    scheduleId: 'my-schedule',
    scheduleTab: 'overview',
  }),
}));

describe(ScheduleDetailPageTabs.name, () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders all four tab titles', () => {
    setup();

    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Backfills')).toBeInTheDocument();
    expect(screen.getByText('Input')).toBeInTheDocument();
    expect(screen.getByText('Runs')).toBeInTheDocument();
  });

  it('navigates with router.push when a tab is clicked', () => {
    setup();

    act(() => {
      fireEvent.click(screen.getByText('Backfills'));
    });

    expect(mockPushFn).toHaveBeenCalledWith('backfills');
  });

  it('navigates to runs tab when clicked', () => {
    setup();

    act(() => {
      fireEvent.click(screen.getByText('Runs'));
    });

    expect(mockPushFn).toHaveBeenCalledWith('runs');
  });
});

function setup() {
  render(<ScheduleDetailPageTabs />);
}
