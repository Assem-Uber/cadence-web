import {
  SCHEDULE_CATCH_UP_POLICIES,
  SCHEDULE_OVERLAP_POLICIES,
} from '@/route-handlers/create-schedule/create-schedule.constants';

export const OVERLAP_POLICY_OPTIONS = SCHEDULE_OVERLAP_POLICIES.map((id) => ({
  id,
  label: id
    .replace('SCHEDULE_OVERLAP_POLICY_', '')
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase()),
}));

export const CATCH_UP_POLICY_OPTIONS = SCHEDULE_CATCH_UP_POLICIES.map((id) => ({
  id,
  label: id
    .replace('SCHEDULE_CATCH_UP_POLICY_', '')
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase()),
}));
