import { MdPauseCircleOutline, MdPlayCircleOutline } from 'react-icons/md';

import { type PauseScheduleResponse } from '@/route-handlers/pause-schedule/pause-schedule.types';
import { type UnpauseScheduleResponse } from '@/route-handlers/unpause-schedule/unpause-schedule.types';

import ScheduleActionPauseForm from '../schedule-action-pause-form/schedule-action-pause-form';
import { type PauseScheduleFormData } from '../schedule-action-pause-form/schedule-action-pause-form.types';
import { pauseScheduleFormSchema } from '../schedule-action-pause-form/schemas/pause-schedule-form-schema';
import transformResumeScheduleFormToSubmission from '../schedule-action-resume-form/helpers/transform-resume-schedule-form-to-submission';
import ScheduleActionResumeForm from '../schedule-action-resume-form/schedule-action-resume-form';
import { USE_SCHEDULE_CATCH_UP_POLICY } from '../schedule-action-resume-form/schedule-action-resume-form.constants';
import {
  type ResumeScheduleFormData,
  type ResumeScheduleSubmissionData,
} from '../schedule-action-resume-form/schedule-action-resume-form.types';
import { resumeScheduleFormSchema } from '../schedule-action-resume-form/schemas/resume-schedule-form-schema';
import { type ScheduleAction } from '../schedule-actions.types';

import { pauseScheduleBannerIcon } from './schedule-actions-banner-icons';
import { PAUSE_SCHEDULE_MODAL_BANNER_MESSAGE } from './schedule-actions.constants';

export type PauseScheduleSubmissionData = PauseScheduleFormData;

const pauseScheduleActionConfig: ScheduleAction<
  PauseScheduleResponse,
  PauseScheduleFormData,
  PauseScheduleSubmissionData
> = {
  id: 'pause',
  label: 'Pause',
  subtitle: 'Pause a schedule',
  modal: {
    banner: {
      kind: 'warning',
      icon: pauseScheduleBannerIcon,
      render: () => PAUSE_SCHEDULE_MODAL_BANNER_MESSAGE,
    },
    withForm: true,
    form: ScheduleActionPauseForm,
    formSchema: pauseScheduleFormSchema,
    transformFormDataToSubmission: (formData) => formData,
    initialFormValues: { reason: '' },
  },
  icon: MdPauseCircleOutline,
  getRunnableStatus: (schedule) =>
    schedule.state?.paused
      ? 'NOT_RUNNABLE_SCHEDULE_ALREADY_PAUSED'
      : 'RUNNABLE',
  apiRoute: (params) =>
    `/api/domains/${encodeURIComponent(params.domain)}/${encodeURIComponent(params.cluster)}/schedules/${encodeURIComponent(params.scheduleId)}/pause`,
  renderSuccessMessage: () => 'Schedule has been paused.',
};

const resumeScheduleActionConfig: ScheduleAction<
  UnpauseScheduleResponse,
  ResumeScheduleFormData,
  ResumeScheduleSubmissionData
> = {
  id: 'resume',
  label: 'Resume',
  subtitle: 'Resume a paused schedule',
  modal: {
    withForm: true,
    form: ScheduleActionResumeForm,
    formSchema: resumeScheduleFormSchema,
    transformFormDataToSubmission: transformResumeScheduleFormToSubmission,
    initialFormValues: {
      catchUpPolicy: USE_SCHEDULE_CATCH_UP_POLICY,
      reason: '',
    },
  },
  icon: MdPlayCircleOutline,
  getRunnableStatus: (schedule) =>
    schedule.state?.paused ? 'RUNNABLE' : 'NOT_RUNNABLE_SCHEDULE_NOT_PAUSED',
  apiRoute: (params) =>
    `/api/domains/${encodeURIComponent(params.domain)}/${encodeURIComponent(params.cluster)}/schedules/${encodeURIComponent(params.scheduleId)}/unpause`,
  renderSuccessMessage: () => 'Schedule has been resumed.',
};

const scheduleActionsConfig = [
  pauseScheduleActionConfig,
  resumeScheduleActionConfig,
];

export default scheduleActionsConfig;
