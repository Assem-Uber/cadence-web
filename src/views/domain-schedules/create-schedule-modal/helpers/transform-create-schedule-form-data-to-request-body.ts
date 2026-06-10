import { CRON_FIELD_ORDER } from '@/components/cron-schedule-input/cron-schedule-input.constants';
import { type CreateScheduleRequestBody } from '@/route-handlers/create-schedule/create-schedule.types';

import { type CreateScheduleFormData } from '../create-schedule-form/create-schedule-form.types';

function safeParseJson(
  value: string | undefined
): Record<string, unknown> | undefined {
  if (!value?.trim()) return undefined;
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    // ignore invalid JSON — validated by Zod
  }
  return undefined;
}

/**
 * Transforms the create-schedule form data into the API request body expected
 * by the POST /api/domains/:domain/:cluster/schedules route handler.
 */
export default function transformCreateScheduleFormDataToRequestBody(
  data: CreateScheduleFormData
): CreateScheduleRequestBody {
  const cronString = CRON_FIELD_ORDER.map((key) => data.cronExpression[key]).join(
    ' '
  );

  const parsedInput =
    data.input && data.input.some((v) => v.trim() !== '')
      ? data.input
          .filter((v) => v.trim() !== '')
          .map((v) => {
            try {
              return JSON.parse(v);
            } catch {
              return v;
            }
          })
      : undefined;

  const retryPolicy =
    data.retryPolicy &&
    Object.values(data.retryPolicy).some((v) => v !== undefined)
      ? data.retryPolicy
      : undefined;

  return {
    scheduleId: data.scheduleId,
    cronExpression: cronString,

    startTime: data.startTime || undefined,
    endTime: data.endTime || undefined,
    jitterSeconds: data.jitterSeconds,

    overlapPolicy: data.overlapPolicy,
    catchUpPolicy: data.catchUpPolicy,
    catchUpWindowSeconds: data.catchUpWindowSeconds,
    pauseOnFailure: data.pauseOnFailure,
    bufferLimit: data.bufferLimit,
    concurrencyLimit: data.concurrencyLimit,

    startWorkflow: {
      workflowType: data.workflowType,
      taskList: data.taskList,
      workerSDKLanguage: data.workerSDKLanguage,
      input: parsedInput,
      workflowIdPrefix: data.workflowIdPrefix ?? '',
      executionStartToCloseTimeoutSeconds:
        data.executionStartToCloseTimeoutSeconds,
      taskStartToCloseTimeoutSeconds: data.taskStartToCloseTimeoutSeconds,
      retryPolicy,
      memo: safeParseJson(data.memo),
      searchAttributes: safeParseJson(data.searchAttributes) as
        | Record<string, string | number | boolean>
        | undefined,
    },
  };
}
