import { ScheduleCatchUpPolicy } from '@/__generated__/proto-ts/uber/cadence/api/v1/ScheduleCatchUpPolicy';
import { ScheduleOverlapPolicy } from '@/__generated__/proto-ts/uber/cadence/api/v1/ScheduleOverlapPolicy';
import {
  SCHEDULE_CATCH_UP_POLICIES,
  SCHEDULE_OVERLAP_POLICIES,
} from '@/route-handlers/create-schedule/create-schedule.constants';

export const MAX_CATCH_UP_WINDOW_DAYS = 90;

const overlapPolicyLabels: Record<
  (typeof SCHEDULE_OVERLAP_POLICIES)[number],
  string
> = {
  [ScheduleOverlapPolicy.SCHEDULE_OVERLAP_POLICY_SKIP_NEW]: 'Skip',
  [ScheduleOverlapPolicy.SCHEDULE_OVERLAP_POLICY_BUFFER]: 'Buffer',
  [ScheduleOverlapPolicy.SCHEDULE_OVERLAP_POLICY_CONCURRENT]: 'Concurrent',
  [ScheduleOverlapPolicy.SCHEDULE_OVERLAP_POLICY_CANCEL_PREVIOUS]:
    'Cancel previous',
  [ScheduleOverlapPolicy.SCHEDULE_OVERLAP_POLICY_TERMINATE_PREVIOUS]:
    'Terminate previous',
};

export const OVERLAP_POLICY_OPTIONS = SCHEDULE_OVERLAP_POLICIES.map(
  (policy) => ({
    id: policy,
    label: overlapPolicyLabels[policy],
  })
);

const catchUpPolicyLabels: Record<
  (typeof SCHEDULE_CATCH_UP_POLICIES)[number],
  string
> = {
  [ScheduleCatchUpPolicy.SCHEDULE_CATCH_UP_POLICY_SKIP]: 'Skip',
  [ScheduleCatchUpPolicy.SCHEDULE_CATCH_UP_POLICY_ONE]: 'Catch-up one',
  [ScheduleCatchUpPolicy.SCHEDULE_CATCH_UP_POLICY_ALL]: 'Catch-up all',
};

export const CATCH_UP_POLICY_OPTIONS = SCHEDULE_CATCH_UP_POLICIES.map(
  (policy) => ({
    id: policy,
    label: catchUpPolicyLabels[policy],
  })
);
