import { ScheduleCatchUpPolicy } from '@/__generated__/proto-ts/uber/cadence/api/v1/ScheduleCatchUpPolicy';
import { ScheduleOverlapPolicy } from '@/__generated__/proto-ts/uber/cadence/api/v1/ScheduleOverlapPolicy';
import { CRON_FIELD_ORDER } from '@/components/cron-schedule-input/cron-schedule-input.constants';
import { type CreateScheduleRequestBody } from '@/route-handlers/create-schedule/create-schedule.types';
import { type Json } from '@/route-handlers/start-workflow/start-workflow.types';

import { type DomainSchedulesCreateFormData } from '../domain-schedules-create-modal.types';

export default function transformDomainSchedulesCreateFormToBody(
  formData: DomainSchedulesCreateFormData
): CreateScheduleRequestBody {
  const cronString = CRON_FIELD_ORDER.map(
    (key) => formData.cronExpression?.[key] ?? ''
  ).join(' ');

  const parsedInput = formData.input
    ?.filter((v) => v.trim() !== '')
    .map((v) => JSON.parse(v) as Json);

  return {
    cronExpression: cronString,
    startWorkflow: {
      workflowType: { name: formData.workflowType.name.trim() },
      taskList: { name: formData.taskList.name.trim() },
      workerSDKLanguage: formData.workerSDKLanguage,
      executionStartToCloseTimeoutSeconds:
        formData.executionStartToCloseTimeoutSeconds,
      taskStartToCloseTimeoutSeconds: formData.taskStartToCloseTimeoutSeconds,
      ...(parsedInput && parsedInput.length > 0 ? { input: parsedInput } : {}),
      ...(formData.workflowIdPrefix?.trim()
        ? { workflowIdPrefix: formData.workflowIdPrefix.trim() }
        : {}),
    },
    pauseOnFailure: formData.pauseOnFailure,
    overlapPolicy: formData.overlapPolicy,
    ...(formData.catchUpPolicy !== undefined
      ? { catchUpPolicy: formData.catchUpPolicy }
      : {}),
    ...(formData.overlapPolicy ===
    ScheduleOverlapPolicy.SCHEDULE_OVERLAP_POLICY_BUFFER
      ? {
          bufferLimit: formData.bufferLimit
            ? parseInt(formData.bufferLimit, 10)
            : undefined,
        }
      : {}),
    ...(formData.overlapPolicy ===
    ScheduleOverlapPolicy.SCHEDULE_OVERLAP_POLICY_CONCURRENT
      ? {
          concurrencyLimit: formData.concurrencyLimit
            ? parseInt(formData.concurrencyLimit, 10)
            : undefined,
        }
      : {}),
    ...(formData.catchUpPolicy !== undefined &&
    formData.catchUpPolicy !==
      ScheduleCatchUpPolicy.SCHEDULE_CATCH_UP_POLICY_SKIP &&
    formData.catchUpWindowDays
      ? {
          catchUpWindowSeconds:
            parseInt(formData.catchUpWindowDays, 10) * 86400, // Convert days to seconds
        }
      : {}),
    ...(formData.scheduleId?.trim()
      ? { scheduleId: formData.scheduleId.trim() }
      : {}),
    ...(formData.jitterSeconds
      ? { jitterSeconds: parseFloat(formData.jitterSeconds) }
      : {}),
  };
}
