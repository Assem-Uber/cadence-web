import React from 'react';

import { render, screen, userEvent } from '@/test-utils/rtl';

import { mockDomainPageQueryParamsValues } from '@/views/domain-page/__fixtures__/domain-page-query-params';

import DomainSchedulesHeader from '../domain-schedules-header';
import { type Props } from '../domain-schedules-header.types';

const mockSetQueryParams = jest.fn();
jest.mock('@/hooks/use-page-query-params/use-page-query-params', () =>
  jest.fn(() => [mockDomainPageQueryParamsValues, mockSetQueryParams])
);

describe(DomainSchedulesHeader.name, () => {
  it('renders the title without count when count is undefined', () => {
    render(<DomainSchedulesHeader count={undefined} onCreateSchedule={jest.fn()} />);

    expect(
      screen.getByRole('heading', { name: 'Schedules' })
    ).toBeInTheDocument();
  });

  it('renders the title with count when count is provided', () => {
    render(<DomainSchedulesHeader count={5} onCreateSchedule={jest.fn()} />);

    expect(
      screen.getByRole('heading', { name: 'Schedules (5)' })
    ).toBeInTheDocument();
  });

  it('renders zero count', () => {
    render(<DomainSchedulesHeader count={0} onCreateSchedule={jest.fn()} />);

    expect(
      screen.getByRole('heading', { name: 'Schedules (0)' })
    ).toBeInTheDocument();
  });

  it('renders the page filters search input', () => {
    render(<DomainSchedulesHeader count={0} onCreateSchedule={jest.fn()} />);

    expect(
      screen.getByPlaceholderText('Find schedule by ID or workflow type')
    ).toBeInTheDocument();
  });

  it('renders a Create button and calls onCreateSchedule when clicked', async () => {
    const onCreateSchedule = jest.fn();
    const { user } = setup({ onCreateSchedule });

    const createButton = screen.getByRole('button', { name: /create/i });
    expect(createButton).toBeInTheDocument();

    await user.click(createButton);
    expect(onCreateSchedule).toHaveBeenCalledTimes(1);
  });
});

function setup(props: Partial<Props> = {}) {
  const user = userEvent.setup();
  render(
    <DomainSchedulesHeader
      count={0}
      onCreateSchedule={jest.fn()}
      {...props}
    />
  );
  return { user };
}
