import { CRON_FIELD_ORDER } from '@/components/cron-schedule-input/cron-schedule-input.constants';
import { type CreateScheduleRequestBody } from '@/route-handlers/create-schedule/create-schedule.types';
import { type Json } from '@/route-handlers/start-workflow/start-workflow.types';

import { type DomainSchedulesCreateFormData } from '../domain-schedules-create-modal.types';

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

export default function transformDomainSchedulesCreateFormToBody(
  formData: DomainSchedulesCreateFormData
): CreateScheduleRequestBody {
  const cronString = CRON_FIELD_ORDER.map(
    (key) => formData.cronExpression?.[key] ?? ''
  ).join(' ');

  const parsedInput = formData.input
    ?.filter((v) => v.trim() !== '')
    .map((v) => JSON.parse(v) as Json);

  const retryPolicy =
    formData.retryPolicy &&
    Object.values(formData.retryPolicy).some((v) => v !== undefined)
      ? formData.retryPolicy
      : undefined;

  return {
    scheduleId: formData.scheduleId,
    cronExpression: cronString,

    startTime: formData.startTime || undefined,
    endTime: formData.endTime || undefined,
    jitterSeconds: formData.jitterSeconds,

    overlapPolicy: formData.overlapPolicy,
    catchUpPolicy: formData.catchUpPolicy,
    catchUpWindowSeconds: formData.catchUpWindowSeconds,
    pauseOnFailure: formData.pauseOnFailure ?? false,
    bufferLimit: formData.bufferLimit,
    concurrencyLimit: formData.concurrencyLimit,

    startWorkflow: {
      workflowType: { name: formData.workflowType.name.trim() },
      taskList: { name: formData.taskList.name.trim() },
      workerSDKLanguage: formData.workerSDKLanguage,
      ...(parsedInput && parsedInput.length > 0 ? { input: parsedInput } : {}),
      workflowIdPrefix: formData.workflowIdPrefix ?? '',
      executionStartToCloseTimeoutSeconds:
        formData.executionStartToCloseTimeoutSeconds,
      taskStartToCloseTimeoutSeconds: formData.taskStartToCloseTimeoutSeconds,
      ...(retryPolicy ? { retryPolicy } : {}),
      memo: safeParseJson(formData.memo),
      searchAttributes: safeParseJson(formData.searchAttributes) as
        | Record<string, string | number | boolean>
        | undefined,
    },
  };
}
