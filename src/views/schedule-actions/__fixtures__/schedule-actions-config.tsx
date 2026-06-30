import { MdDeleteOutline, MdPauseCircleOutline, MdPlayCircleOutline } from 'react-icons/md';

import { type DeleteScheduleResponse } from '@/route-handlers/delete-schedule/delete-schedule.types';
import { type PauseScheduleResponse } from '@/route-handlers/pause-schedule/pause-schedule.types';
import { type UnpauseScheduleResponse } from '@/route-handlers/unpause-schedule/unpause-schedule.types';

import {
  type ScheduleAction,
  type ScheduleActionInputParams,
} from '../schedule-actions.types';

const mockActionApiRoute =
  (action: string) => (params: ScheduleActionInputParams) =>
    `/api/domains/${params.domain}/${params.cluster}/schedules/${params.scheduleId}/${action}`;

export const mockPauseActionConfig: ScheduleAction<
  PauseScheduleResponse,
  undefined,
  { reason: string }
> = {
  id: 'pause',
  label: 'Mock pause',
  subtitle: 'Mock pause a schedule',
  modal: {
    text: 'Mock modal text to pause a schedule',
    docsLink: {
      text: 'Mock docs link',
      href: 'https://mock.docs.link',
    },
    withForm: false,
  },
  icon: MdPauseCircleOutline,
  getRunnableStatus: (schedule) =>
    schedule.state?.paused
      ? 'NOT_RUNNABLE_SCHEDULE_ALREADY_PAUSED'
      : 'RUNNABLE',
  apiRoute: mockActionApiRoute('pause'),
  getConfirmSubmissionData: () => ({ reason: 'Mock pause reason' }),
  renderSuccessMessage: () => 'Mock pause notification',
};

export const mockResumeActionConfig: ScheduleAction<UnpauseScheduleResponse> = {
  id: 'resume',
  label: 'Mock resume',
  subtitle: 'Mock resume a schedule',
  modal: {
    text: 'Mock modal text to resume a schedule',
    docsLink: {
      text: 'Mock docs link',
      href: 'https://mock.docs.link',
    },
    withForm: false,
  },
  icon: MdPlayCircleOutline,
  getRunnableStatus: (schedule) =>
    schedule.state?.paused ? 'RUNNABLE' : 'NOT_RUNNABLE_SCHEDULE_NOT_PAUSED',
  apiRoute: mockActionApiRoute('unpause'),
  renderSuccessMessage: () => 'Mock resume notification',
};

export const mockDeleteActionConfig: ScheduleAction<DeleteScheduleResponse> = {
  id: 'delete',
  label: 'Mock delete',
  subtitle: 'Mock delete a schedule',
  modal: {
    text: 'Deletes the schedule permanently. In-progress workflow runs are not affected.',
    docsLink: {
      text: 'Mock docs link',
      href: 'https://mock.docs.link',
    },
    withForm: false,
  },
  icon: MdDeleteOutline,
  getRunnableStatus: () => 'RUNNABLE',
  apiRoute: mockActionApiRoute('delete'),
  renderSuccessMessage: () => 'Schedule deleted.',
  onSuccess: ({ router, params }) => {
    router.push(
      `/domains/${params.domain}/${params.cluster}/schedules`
    );
  },
};

export const mockScheduleActionsConfig = [
  mockPauseActionConfig,
  mockResumeActionConfig,
  mockDeleteActionConfig,
] as const;
