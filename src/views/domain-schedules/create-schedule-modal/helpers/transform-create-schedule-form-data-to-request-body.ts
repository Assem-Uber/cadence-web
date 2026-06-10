import { CRON_FIELD_ORDER } from '@/components/cron-schedule-input/cron-schedule-input.constants';
import { type CreateScheduleRequestBody } from '@/route-handlers/create-schedule/create-schedule.types';

import { type CreateScheduleFormData } from '../create-schedule-form/create-schedule-form.types';

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

  return {
    cronExpression: cronString,
    pauseOnFailure: data.pauseOnFailure,
    startWorkflow: {
      workflowType: data.workflowType,
      taskList: data.taskList,
      workerSDKLanguage: data.workerSDKLanguage,
      input:
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
          : undefined,
      workflowIdPrefix: data.workflowIdPrefix ?? '',
      executionStartToCloseTimeoutSeconds:
        data.executionStartToCloseTimeoutSeconds,
      taskStartToCloseTimeoutSeconds: data.taskStartToCloseTimeoutSeconds,
    },
  };
}
