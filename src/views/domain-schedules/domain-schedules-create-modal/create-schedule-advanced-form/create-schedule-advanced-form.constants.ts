import { ScheduleCatchUpPolicy } from '@/__generated__/proto-ts/uber/cadence/api/v1/ScheduleCatchUpPolicy';
import { ScheduleOverlapPolicy } from '@/__generated__/proto-ts/uber/cadence/api/v1/ScheduleOverlapPolicy';
import {
  SCHEDULE_CATCH_UP_POLICIES,
  SCHEDULE_OVERLAP_POLICIES,
} from '@/route-handlers/create-schedule/create-schedule.constants';

export const DEFAULT_OVERLAP_POLICY =
  ScheduleOverlapPolicy.SCHEDULE_OVERLAP_POLICY_SKIP_NEW;

export const DEFAULT_CATCH_UP_POLICY =
  ScheduleCatchUpPolicy.SCHEDULE_CATCH_UP_POLICY_SKIP;

export const DEFAULT_CATCH_UP_WINDOW_DAYS = 14;

export const MAX_CATCH_UP_WINDOW_DAYS = 90;

export const DEFAULT_BUFFER_LIMIT = 0;

const OVERLAP_POLICY_LABELS: Record<
  (typeof SCHEDULE_OVERLAP_POLICIES)[number],
  string
> = {
  [ScheduleOverlapPolicy.SCHEDULE_OVERLAP_POLICY_SKIP_NEW]: 'Skip',
  [ScheduleOverlapPolicy.SCHEDULE_OVERLAP_POLICY_BUFFER]: 'Buffer limit',
  [ScheduleOverlapPolicy.SCHEDULE_OVERLAP_POLICY_CONCURRENT]:
    'Concurrency limit',
  [ScheduleOverlapPolicy.SCHEDULE_OVERLAP_POLICY_CANCEL_PREVIOUS]:
    'Cancel previous',
  [ScheduleOverlapPolicy.SCHEDULE_OVERLAP_POLICY_TERMINATE_PREVIOUS]:
    'Terminate previous',
};

const CATCH_UP_POLICY_LABELS: Record<
  (typeof SCHEDULE_CATCH_UP_POLICIES)[number],
  string
> = {
  [ScheduleCatchUpPolicy.SCHEDULE_CATCH_UP_POLICY_SKIP]: 'Skip',
  [ScheduleCatchUpPolicy.SCHEDULE_CATCH_UP_POLICY_ONE]: 'Catch-up one',
  [ScheduleCatchUpPolicy.SCHEDULE_CATCH_UP_POLICY_ALL]: 'Catch-up all',
};

export const OVERLAP_POLICY_OPTIONS = SCHEDULE_OVERLAP_POLICIES.map((id) => ({
  id,
  label: OVERLAP_POLICY_LABELS[id],
}));

export const CATCH_UP_POLICY_OPTIONS = SCHEDULE_CATCH_UP_POLICIES.map((id) => ({
  id,
  label: CATCH_UP_POLICY_LABELS[id],
}));

export const CREATE_SCHEDULE_ADVANCED_FORM_DEFAULTS = {
  overlapPolicy: DEFAULT_OVERLAP_POLICY,
  catchUpPolicy: DEFAULT_CATCH_UP_POLICY,
  catchUpWindowDays: DEFAULT_CATCH_UP_WINDOW_DAYS,
  bufferLimit: DEFAULT_BUFFER_LIMIT,
  searchAttributes: [] as Array<{
    key: string;
    value: string | number | boolean;
  }>,
  memo: '',
  enableRetryPolicy: false,
  limitRetries: 'ATTEMPTS' as const,
};
