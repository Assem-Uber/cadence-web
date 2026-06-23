import { z } from 'zod';

import { ScheduleCatchUpPolicy } from '@/__generated__/proto-ts/uber/cadence/api/v1/ScheduleCatchUpPolicy';
import { ScheduleOverlapPolicy } from '@/__generated__/proto-ts/uber/cadence/api/v1/ScheduleOverlapPolicy';
import { CRON_FIELD_ORDER } from '@/components/cron-schedule-input/cron-schedule-input.constants';
import {
  SCHEDULE_CATCH_UP_POLICIES,
  SCHEDULE_OVERLAP_POLICIES,
} from '@/route-handlers/create-schedule/create-schedule.constants';
// TODO(refactor): WORKER_SDK_LANGUAGES is imported from start-workflow — extract to shared constants once both features stabilise
import { WORKER_SDK_LANGUAGES } from '@/route-handlers/start-workflow/start-workflow.constants';
// TODO(refactor): schedule policy constants imported from create-schedule route handler — extract to shared location
import { getCronFieldsError } from '@/views/workflow-actions/workflow-action-start-form/helpers/get-cron-fields-error';

import {
  DEFAULT_CATCH_UP_POLICY,
  DEFAULT_OVERLAP_POLICY,
  MAX_CATCH_UP_WINDOW_DAYS,
} from '../create-schedule-advanced-form/create-schedule-advanced-form.constants';

const cronExpressionFieldsSchema = z
  .object({
    minutes: z.string(),
    hours: z.string(),
    daysOfMonth: z.string(),
    months: z.string(),
    daysOfWeek: z.string(),
  })
  // If cron is invalid catch the error to proceed with better error messages in superRefine
  .catch(() => ({
    minutes: '',
    hours: '',
    daysOfMonth: '',
    months: '',
    daysOfWeek: '',
  }))
  .superRefine((data, ctx) => {
    const allFieldsHasValue = Object.values(data).every(Boolean);

    if (!allFieldsHasValue) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Cron expression is required',
      });
      // If there are missing fields, no need to validate the cron schedule format.
      return;
    }

    const cronString = CRON_FIELD_ORDER.map((key) => data[key]).join(' ');
    const cronFieldsErrors = getCronFieldsError(cronString);

    if (!cronFieldsErrors) return;

    if (cronFieldsErrors?.general) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid cron schedule format',
      });
    } else {
      // multi error format exposes the general error along with field errors
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid cron schedule format',
        path: ['general'],
      });

      Object.entries(cronFieldsErrors).forEach(([errorKey, errorMessage]) => {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: errorMessage,
          path: [errorKey],
        });
      });
    }
  });

const baseSchema = z.object({
  // --- Main fields ---
  cronExpression: cronExpressionFieldsSchema,
  workflowType: z.object({
    name: z.string().min(1, 'Workflow type is required'),
  }),
  taskList: z.object({
    name: z.string().min(1, 'Task list is required'),
  }),
  executionStartToCloseTimeoutSeconds: z
    .number({
      required_error: 'Execution timeout is required',
    })
    .positive('Execution timeout must be positive'),
  taskStartToCloseTimeoutSeconds: z
    .number({
      required_error: 'Task timeout is required',
    })
    .positive('Task timeout must be positive'),
  // TODO(refactor): WORKER_SDK_LANGUAGES imported from start-workflow — extract to shared constants
  workerSDKLanguage: z
    .enum(WORKER_SDK_LANGUAGES)
    .default(WORKER_SDK_LANGUAGES[0]),
  input: z
    .array(z.string())
    .optional()
    .superRefine((inputArray, ctx) => {
      if (!inputArray) return;
      if (inputArray.length === 1 && inputArray[0] === '') {
        return;
      }
      // Check each input individually for field-level errors
      for (let i = 0; i < inputArray.length; i++) {
        const val = inputArray[i];
        try {
          JSON.parse(val);
        } catch {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Input must be valid JSON',
            path: [i],
          });
        }
      }
    }),
  pauseOnFailure: z.boolean().optional().default(false),

  // --- Advanced fields ---
  scheduleId: z.string().min(1).optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  jitterSeconds: z.number().nonnegative('Must be zero or positive').optional(),
  overlapPolicy: z
    .enum(SCHEDULE_OVERLAP_POLICIES)
    .default(DEFAULT_OVERLAP_POLICY),
  catchUpPolicy: z
    .enum(SCHEDULE_CATCH_UP_POLICIES)
    .default(DEFAULT_CATCH_UP_POLICY),
  catchUpWindowDays: z
    .number()
    .int('Must be an integer')
    .positive('Must be at least 1 day')
    .max(
      MAX_CATCH_UP_WINDOW_DAYS,
      `Must be at most ${MAX_CATCH_UP_WINDOW_DAYS} days`
    )
    .optional(),
  bufferLimit: z
    .number()
    .int('Must be an integer')
    .nonnegative('Must be zero or positive')
    .optional(),
  concurrencyLimit: z
    .number()
    .int('Must be an integer')
    .nonnegative('Must be zero or positive')
    .optional(),
  workflowIdPrefix: z.string().optional(),
  enableRetryPolicy: z.boolean().optional(),
  limitRetries: z.enum(['ATTEMPTS', 'DURATION']).optional(),
  retryPolicy: z
    .object({
      initialIntervalSeconds: z.string().optional(),
      backoffCoefficient: z.string().optional(),
      maximumIntervalSeconds: z.string().optional(),
      maximumAttempts: z.string().optional(),
      expirationIntervalSeconds: z.string().optional(),
    })
    .optional(),
  memo: z
    .string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === '') return true;
      try {
        JSON.parse(val);
        return true;
      } catch {
        return false;
      }
    }, 'Memo must be valid JSON Object'),
  searchAttributes: z
    .array(
      z.object({
        key: z.string().min(1, 'Attribute key is required'),
        value: z.union([
          z.string().min(1, 'Attribute value is required'),
          z.number(),
          z.boolean(),
        ]),
      })
    )
    .optional(),
});

export const createScheduleFormSchema = baseSchema.superRefine((data, ctx) => {
  if (data.enableRetryPolicy) {
    if (!data.retryPolicy?.initialIntervalSeconds) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Initial interval is required when retry policy is enabled',
        path: ['retryPolicy', 'initialIntervalSeconds'],
      });
    }

    if (!data.retryPolicy?.backoffCoefficient) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Backoff coefficient is required when retry policy is enabled',
        path: ['retryPolicy', 'backoffCoefficient'],
      });
    }

    if (
      data.limitRetries === 'ATTEMPTS' &&
      !data.retryPolicy?.maximumAttempts
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Maximum attempts is required when retries limit is ATTEMPTS',
        path: ['retryPolicy', 'maximumAttempts'],
      });
    }

    if (
      data.limitRetries === 'DURATION' &&
      !data.retryPolicy?.expirationIntervalSeconds
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Expiration interval is required when retries limit is DURATION',
        path: ['retryPolicy', 'expirationIntervalSeconds'],
      });
    }
  }

  if (
    data.overlapPolicy ===
      ScheduleOverlapPolicy.SCHEDULE_OVERLAP_POLICY_BUFFER &&
    data.bufferLimit === undefined
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Buffer limit is required when overlap policy is buffer limit',
      path: ['bufferLimit'],
    });
  }

  if (
    data.overlapPolicy ===
      ScheduleOverlapPolicy.SCHEDULE_OVERLAP_POLICY_CONCURRENT &&
    data.concurrencyLimit === undefined
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        'Concurrency limit is required when overlap policy is concurrency limit',
      path: ['concurrencyLimit'],
    });
  }

  if (
    data.catchUpPolicy !==
      ScheduleCatchUpPolicy.SCHEDULE_CATCH_UP_POLICY_SKIP &&
    data.catchUpWindowDays === undefined
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Catch-up window is required when catch-up policy is not skip',
      path: ['catchUpWindowDays'],
    });
  }
});
