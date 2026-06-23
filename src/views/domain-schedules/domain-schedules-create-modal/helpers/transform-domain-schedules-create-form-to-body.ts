import { ScheduleCatchUpPolicy } from '@/__generated__/proto-ts/uber/cadence/api/v1/ScheduleCatchUpPolicy';
import { ScheduleOverlapPolicy } from '@/__generated__/proto-ts/uber/cadence/api/v1/ScheduleOverlapPolicy';
import { CRON_FIELD_ORDER } from '@/components/cron-schedule-input/cron-schedule-input.constants';
import { type CreateScheduleRequestBody } from '@/route-handlers/create-schedule/create-schedule.types';
import { type Json } from '@/route-handlers/start-workflow/start-workflow.types';

import { type DomainSchedulesCreateFormData } from '../domain-schedules-create-modal.types';

const SECONDS_PER_DAY = 86_400;

export default function transformDomainSchedulesCreateFormToBody(
  formData: DomainSchedulesCreateFormData
): CreateScheduleRequestBody {
  const cronString = CRON_FIELD_ORDER.map(
    (key) => formData.cronExpression?.[key] ?? ''
  ).join(' ');

  const parsedInput = formData.input
    ?.filter((v) => v.trim() !== '')
    .map((v) => JSON.parse(v) as Json);

  const searchAttributesObject =
    formData.searchAttributes && formData.searchAttributes.length > 0
      ? Object.fromEntries(
          formData.searchAttributes.map((item) => [item.key, item.value])
        )
      : undefined;

  const retryPolicy = formData.enableRetryPolicy
    ? {
        initialIntervalSeconds: formData.retryPolicy?.initialIntervalSeconds
          ? parseInt(formData.retryPolicy.initialIntervalSeconds, 10)
          : undefined,
        backoffCoefficient: formData.retryPolicy?.backoffCoefficient
          ? parseFloat(formData.retryPolicy.backoffCoefficient)
          : undefined,
        maximumIntervalSeconds: formData.retryPolicy?.maximumIntervalSeconds
          ? parseInt(formData.retryPolicy.maximumIntervalSeconds, 10)
          : undefined,
        ...(formData.limitRetries === 'ATTEMPTS' && {
          maximumAttempts: formData.retryPolicy?.maximumAttempts
            ? parseInt(formData.retryPolicy.maximumAttempts, 10)
            : undefined,
        }),
        ...(formData.limitRetries === 'DURATION' && {
          expirationIntervalSeconds: formData.retryPolicy
            ?.expirationIntervalSeconds
            ? parseInt(formData.retryPolicy.expirationIntervalSeconds, 10)
            : undefined,
        }),
      }
    : undefined;

  const overlapPolicy = formData.overlapPolicy;
  const includeBufferLimit =
    overlapPolicy === ScheduleOverlapPolicy.SCHEDULE_OVERLAP_POLICY_BUFFER;
  const includeConcurrencyLimit =
    overlapPolicy === ScheduleOverlapPolicy.SCHEDULE_OVERLAP_POLICY_CONCURRENT;
  const includeCatchUpWindow =
    formData.catchUpPolicy !==
    ScheduleCatchUpPolicy.SCHEDULE_CATCH_UP_POLICY_SKIP;

  return {
    scheduleId: formData.scheduleId,
    cronExpression: cronString,

    startTime: formData.startTime || undefined,
    endTime: formData.endTime || undefined,
    jitterSeconds: formData.jitterSeconds,

    overlapPolicy,
    catchUpPolicy: formData.catchUpPolicy,
    ...(includeCatchUpWindow &&
    formData.catchUpWindowDays !== undefined
      ? {
          catchUpWindowSeconds:
            formData.catchUpWindowDays * SECONDS_PER_DAY,
        }
      : {}),
    pauseOnFailure: formData.pauseOnFailure ?? false,
    ...(includeBufferLimit ? { bufferLimit: formData.bufferLimit } : {}),
    ...(includeConcurrencyLimit
      ? { concurrencyLimit: formData.concurrencyLimit }
      : {}),

    startWorkflow: {
      workflowType: { name: formData.workflowType.name.trim() },
      taskList: { name: formData.taskList.name.trim() },
      workerSDKLanguage: formData.workerSDKLanguage,
      ...(parsedInput && parsedInput.length > 0 ? { input: parsedInput } : {}),
      workflowIdPrefix: formData.workflowIdPrefix?.trim() ?? '',
      executionStartToCloseTimeoutSeconds:
        formData.executionStartToCloseTimeoutSeconds,
      taskStartToCloseTimeoutSeconds: formData.taskStartToCloseTimeoutSeconds,
      ...(retryPolicy ? { retryPolicy } : {}),
      memo: formData.memo?.trim() ? JSON.parse(formData.memo) : undefined,
      searchAttributes: searchAttributesObject,
    },
  };
}
