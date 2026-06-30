export const PAUSE_SCHEDULE_MODAL_BANNER_MESSAGE =
  'Pausing stops new executions but does not stop workflows already in progress.';

export const RESUME_SCHEDULE_FORM_FIELD_DESCRIPTIONS = {
  reason: 'Optional note explaining why the schedule is being resumed.',
  catchUpPolicy:
    'Catch-up policy determines how to handle missed runs when unpausing a schedule.',
} as const;
