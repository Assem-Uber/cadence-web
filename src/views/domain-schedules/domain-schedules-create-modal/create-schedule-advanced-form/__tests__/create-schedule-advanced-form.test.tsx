import React from 'react';

import { useForm } from 'react-hook-form';

import { render, screen, userEvent } from '@/test-utils/rtl';

import { type DomainSchedulesCreateFormData } from '../../domain-schedules-create-modal.types';
import CreateScheduleAdvancedForm from '../create-schedule-advanced-form';

describe(CreateScheduleAdvancedForm.name, () => {
  it('renders the accordion toggle and is collapsed by default', () => {
    setup();

    expect(
      screen.getByRole('button', { name: /show advanced settings/i })
    ).toBeInTheDocument();
    expect(screen.queryByLabelText('Schedule ID')).not.toBeInTheDocument();
  });

  it('expands advanced fields when the toggle is clicked', async () => {
    const { user } = setup();

    await user.click(
      screen.getByRole('button', { name: /show advanced settings/i })
    );

    expect(
      screen.getByRole('button', { name: /hide advanced settings/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Schedule ID')).toBeInTheDocument();
    expect(screen.getByLabelText('Overlap Policy')).toBeInTheDocument();
    expect(screen.getByLabelText('Catch-up Policy')).toBeInTheDocument();
    expect(screen.getByLabelText('Memo')).toBeInTheDocument();
    expect(screen.getByLabelText('Search Attributes')).toBeInTheDocument();
  });

  it('collapses advanced fields when the toggle is clicked again', async () => {
    const { user } = setup();

    await user.click(
      screen.getByRole('button', { name: /show advanced settings/i })
    );
    expect(screen.getByLabelText('Schedule ID')).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: /hide advanced settings/i })
    );
    // After collapsing, toggle label reverts to "show"
    expect(
      screen.getByRole('button', { name: /show advanced settings/i })
    ).toBeInTheDocument();
  });
});

function setup() {
  const user = userEvent.setup();

  function Wrapper() {
    const { control } = useForm<DomainSchedulesCreateFormData>();
    return <CreateScheduleAdvancedForm control={control} />;
  }

  render(<Wrapper />);
  return { user };
}
