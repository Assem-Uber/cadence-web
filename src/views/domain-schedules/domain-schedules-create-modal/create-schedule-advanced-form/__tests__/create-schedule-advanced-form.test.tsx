import React from 'react';

import { useForm } from 'react-hook-form';

import { render, screen, userEvent } from '@/test-utils/rtl';

import { type DomainSchedulesCreateFormData } from '../../domain-schedules-create-modal.types';
import { CREATE_SCHEDULE_ADVANCED_FORM_DEFAULTS } from '../create-schedule-advanced-form.constants';
import CreateScheduleAdvancedForm from '../create-schedule-advanced-form';

jest.mock(
  '@/views/shared/hooks/use-search-attributes/use-search-attributes',
  () =>
    jest.fn(() => ({
      data: { keys: { CustomKeyword: 'KEYWORD', CustomInt: 'INT' } },
      isLoading: false,
    }))
);

describe(CreateScheduleAdvancedForm.name, () => {
  it('renders the accordion toggle and is collapsed by default', () => {
    setup();

    expect(
      screen.getByRole('button', { name: /show advanced configurations/i })
    ).toBeInTheDocument();
    expect(screen.queryByLabelText('Schedule Id')).not.toBeInTheDocument();
  });

  it('expands advanced fields when the toggle is clicked', async () => {
    const { user } = setup();

    await user.click(
      screen.getByRole('button', { name: /show advanced configurations/i })
    );

    expect(
      screen.getByRole('button', { name: /hide advanced configurations/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Schedule Id')).toBeInTheDocument();
    expect(
      screen.getByRole('combobox', { name: /Overlap policy options/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Catch-up policy')).toBeInTheDocument();
    expect(screen.queryByLabelText('Catch-up window')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Workflow Id Prefix')).toBeInTheDocument();
    expect(screen.getByLabelText('Memo')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Add search attribute' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', { name: 'Enable retry policy' })
    ).toBeInTheDocument();
    expect(
      screen.queryByLabelText('Initial interval')
    ).not.toBeInTheDocument();
  });

  it('shows retry policy fields when retry policy is enabled', async () => {
    const { user } = setup();

    await user.click(
      screen.getByRole('button', { name: /show advanced configurations/i })
    );

    expect(
      screen.queryByLabelText('Initial interval')
    ).not.toBeInTheDocument();

    await user.click(
      screen.getByRole('checkbox', { name: 'Enable retry policy' })
    );

    expect(screen.getByLabelText('Initial interval')).toBeInTheDocument();
    expect(screen.getByLabelText('Backoff coefficient')).toBeInTheDocument();
    expect(screen.getByLabelText('Maximum attempts')).toBeInTheDocument();
  });

  it('shows catch-up window when catch-up policy is not skip', async () => {
    const { user } = setup();

    await user.click(
      screen.getByRole('button', { name: /show advanced configurations/i })
    );

    expect(screen.queryByLabelText('Catch-up window')).not.toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: 'Catch-up one' }));

    expect(screen.getByLabelText('Catch-up window')).toBeInTheDocument();
  });

  it('shows buffer limit only when overlap policy is buffer limit', async () => {
    const { user } = setup();

    await user.click(
      screen.getByRole('button', { name: /show advanced configurations/i })
    );

    expect(screen.queryByLabelText('Buffer limit')).not.toBeInTheDocument();

    const overlapSelect = screen.getByRole('combobox', {
      name: /Overlap policy options/i,
    });
    await user.click(overlapSelect);
    await user.click(screen.getByRole('option', { name: 'Buffer limit' }));

    expect(screen.getByLabelText('Buffer limit')).toBeInTheDocument();
    expect(screen.queryByLabelText('Concurrency limit')).not.toBeInTheDocument();
  });

  it('collapses advanced fields when the toggle is clicked again', async () => {
    const { user } = setup();

    await user.click(
      screen.getByRole('button', { name: /show advanced configurations/i })
    );
    expect(screen.getByLabelText('Schedule Id')).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: /hide advanced configurations/i })
    );
    expect(
      screen.getByRole('button', { name: /show advanced configurations/i })
    ).toBeInTheDocument();
  });
});

function setup() {
  const user = userEvent.setup();

  function Wrapper() {
    const {
      control,
      clearErrors,
      formState: { errors: fieldErrors },
    } = useForm<DomainSchedulesCreateFormData>({
      defaultValues: CREATE_SCHEDULE_ADVANCED_FORM_DEFAULTS,
    });
    return (
      <CreateScheduleAdvancedForm
        control={control}
        clearErrors={clearErrors}
        fieldErrors={fieldErrors}
        cluster="test-cluster"
      />
    );
  }

  render(<Wrapper />);
  return { user };
}
