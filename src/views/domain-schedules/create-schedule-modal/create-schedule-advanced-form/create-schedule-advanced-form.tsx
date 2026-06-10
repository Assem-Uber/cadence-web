'use client';

import React from 'react';

import { StatefulPanel } from 'baseui/accordion';
import { Button } from 'baseui/button';
import { mergeOverrides } from 'baseui/helpers/overrides';
import { Input } from 'baseui/input';
import { Select } from 'baseui/select';
import { Textarea } from 'baseui/textarea';
import { LabelXSmall } from 'baseui/typography';
import { Controller, useFormState } from 'react-hook-form';
import { MdExpandLess, MdExpandMore } from 'react-icons/md';

import useStyletronClasses from '@/hooks/use-styletron-classes';
import CreateScheduleHorizontalField from '@/views/domain-schedules/create-schedule-horizontal-field/create-schedule-horizontal-field';
// TODO(refactor): getFieldErrorMessage imported from start-workflow helpers — extract to shared utils
import getFieldErrorMessage from '@/views/workflow-actions/workflow-action-start-form/helpers/get-field-error-message';

import {
  CATCH_UP_POLICY_OPTIONS,
  OVERLAP_POLICY_OPTIONS,
} from './create-schedule-advanced-form.constants';
import { cssStyles, overrides } from './create-schedule-advanced-form.styles';
import { type Props } from './create-schedule-advanced-form.types';

export default function CreateScheduleAdvancedForm({ control }: Props) {
  const { cls } = useStyletronClasses(cssStyles);
  const { errors: fieldErrors } = useFormState({ control });

  return (
    <StatefulPanel
      overrides={mergeOverrides(overrides.panel, {
        Header: {
          component: (props) => (
            <div className={cls.toggleRow}>
              <Button
                size="mini"
                kind="tertiary"
                type="button"
                startEnhancer={
                  props.$expanded ? (
                    <MdExpandLess size={20} />
                  ) : (
                    <MdExpandMore size={20} />
                  )
                }
                onClick={() =>
                  props.onClick?.({ expanded: !props.$expanded })
                }
              >
                {props.$expanded
                  ? 'Hide advanced settings'
                  : 'Show advanced settings'}
              </Button>
              <div className={cls.divider} />
            </div>
          ),
        },
      })}
    >
      <>
        {/* Schedule identity */}
        <CreateScheduleHorizontalField
          label="Schedule ID (optional)"
          description="Unique identifier for the schedule. Server generates a UUID when omitted."
          htmlFor="create-schedule-form-schedule-id"
          error={getFieldErrorMessage(fieldErrors, 'scheduleId')}
        >
          <Controller
            name="scheduleId"
            control={control}
            defaultValue={undefined}
            render={({ field: { ref, ...field } }) => (
              <Input
                {...field}
                value={field.value ?? ''}
                id="create-schedule-form-schedule-id"
                // @ts-expect-error - inputRef expects ref object while ref is a callback. It should support both.
                inputRef={ref}
                aria-label="Schedule ID"
                onChange={(e) => field.onChange(e.target.value || undefined)}
                onBlur={field.onBlur}
                error={Boolean(getFieldErrorMessage(fieldErrors, 'scheduleId'))}
                size="compact"
                placeholder="Leave blank to auto-generate"
              />
            )}
          />
        </CreateScheduleHorizontalField>

        {/* Spec: start/end/jitter */}
        <CreateScheduleHorizontalField
          label="Start Time (optional)"
          description="Earliest time the schedule may trigger workflows."
          htmlFor="create-schedule-form-start-time"
          error={getFieldErrorMessage(fieldErrors, 'startTime')}
        >
          <Controller
            name="startTime"
            control={control}
            render={({ field: { ref, ...field } }) => (
              <Input
                {...field}
                value={field.value ?? ''}
                id="create-schedule-form-start-time"
                // @ts-expect-error - inputRef expects ref object while ref is a callback. It should support both.
                inputRef={ref}
                aria-label="Start Time"
                onChange={(e) => field.onChange(e.target.value || undefined)}
                onBlur={field.onBlur}
                error={Boolean(getFieldErrorMessage(fieldErrors, 'startTime'))}
                size="compact"
                placeholder="2025-01-01T00:00:00Z"
              />
            )}
          />
        </CreateScheduleHorizontalField>

        <CreateScheduleHorizontalField
          label="End Time (optional)"
          description="Latest time the schedule may trigger workflows."
          htmlFor="create-schedule-form-end-time"
          error={getFieldErrorMessage(fieldErrors, 'endTime')}
        >
          <Controller
            name="endTime"
            control={control}
            render={({ field: { ref, ...field } }) => (
              <Input
                {...field}
                value={field.value ?? ''}
                id="create-schedule-form-end-time"
                // @ts-expect-error - inputRef expects ref object while ref is a callback. It should support both.
                inputRef={ref}
                aria-label="End Time"
                onChange={(e) => field.onChange(e.target.value || undefined)}
                onBlur={field.onBlur}
                error={Boolean(getFieldErrorMessage(fieldErrors, 'endTime'))}
                size="compact"
                placeholder="2025-12-31T23:59:59Z"
              />
            )}
          />
        </CreateScheduleHorizontalField>

        <CreateScheduleHorizontalField
          label="Jitter"
          description="Random jitter added to each trigger time to spread load."
          htmlFor="create-schedule-form-jitter"
          error={getFieldErrorMessage(fieldErrors, 'jitterSeconds')}
        >
          <Controller
            name="jitterSeconds"
            control={control}
            render={({ field: { ref, ...field } }) => (
              <Input
                {...field}
                id="create-schedule-form-jitter"
                value={field.value ?? ''}
                // @ts-expect-error - inputRef expects ref object while ref is a callback. It should support both.
                inputRef={ref}
                aria-label="Jitter"
                type="number"
                min={0}
                onChange={(e) =>
                  field.onChange(
                    e.target.value !== '' ? parseFloat(e.target.value) : undefined
                  )
                }
                onBlur={field.onBlur}
                error={Boolean(
                  getFieldErrorMessage(fieldErrors, 'jitterSeconds')
                )}
                size="compact"
                placeholder="0"
                endEnhancer={<LabelXSmall>Seconds</LabelXSmall>}
              />
            )}
          />
        </CreateScheduleHorizontalField>

        {/* Policies */}
        <CreateScheduleHorizontalField
          label="Overlap Policy"
          description="How to handle a trigger when the previous workflow run is still running."
          htmlFor="create-schedule-form-overlap-policy"
          error={getFieldErrorMessage(fieldErrors, 'overlapPolicy')}
        >
          <Controller
            name="overlapPolicy"
            control={control}
            render={({ field: { value, onChange, ref, ...field } }) => (
              <Select
                {...field}
                inputRef={ref}
                aria-label="Overlap Policy"
                options={OVERLAP_POLICY_OPTIONS}
                value={value ? [{ id: value }] : []}
                onChange={(params) =>
                  onChange(params.value[0]?.id ?? undefined)
                }
                error={Boolean(
                  getFieldErrorMessage(fieldErrors, 'overlapPolicy')
                )}
                size="compact"
                placeholder="Default (skip)"
                clearable
              />
            )}
          />
        </CreateScheduleHorizontalField>

        <CreateScheduleHorizontalField
          label="Catch-up Policy"
          description="How to handle missed triggers when the schedule resumes after a pause."
          htmlFor="create-schedule-form-catchup-policy"
          error={getFieldErrorMessage(fieldErrors, 'catchUpPolicy')}
        >
          <Controller
            name="catchUpPolicy"
            control={control}
            render={({ field: { value, onChange, ref, ...field } }) => (
              <Select
                {...field}
                inputRef={ref}
                aria-label="Catch-up Policy"
                options={CATCH_UP_POLICY_OPTIONS}
                value={value ? [{ id: value }] : []}
                onChange={(params) =>
                  onChange(params.value[0]?.id ?? undefined)
                }
                error={Boolean(
                  getFieldErrorMessage(fieldErrors, 'catchUpPolicy')
                )}
                size="compact"
                placeholder="Default"
                clearable
              />
            )}
          />
        </CreateScheduleHorizontalField>

        <CreateScheduleHorizontalField
          label="Catch-up Window"
          description="How far back to look for missed triggers when resuming."
          htmlFor="create-schedule-form-catchup-window"
          error={getFieldErrorMessage(fieldErrors, 'catchUpWindowSeconds')}
        >
          <Controller
            name="catchUpWindowSeconds"
            control={control}
            render={({ field: { ref, ...field } }) => (
              <Input
                {...field}
                id="create-schedule-form-catchup-window"
                value={field.value ?? ''}
                // @ts-expect-error - inputRef expects ref object while ref is a callback. It should support both.
                inputRef={ref}
                aria-label="Catch-up Window"
                type="number"
                min={0}
                onChange={(e) =>
                  field.onChange(
                    e.target.value !== '' ? parseInt(e.target.value, 10) : undefined
                  )
                }
                onBlur={field.onBlur}
                error={Boolean(
                  getFieldErrorMessage(fieldErrors, 'catchUpWindowSeconds')
                )}
                size="compact"
                placeholder="0"
                endEnhancer={<LabelXSmall>Seconds</LabelXSmall>}
              />
            )}
          />
        </CreateScheduleHorizontalField>

        <CreateScheduleHorizontalField
          label="Buffer Limit"
          description="Maximum number of workflow runs buffered before older ones are dropped."
          htmlFor="create-schedule-form-buffer-limit"
          error={getFieldErrorMessage(fieldErrors, 'bufferLimit')}
        >
          <Controller
            name="bufferLimit"
            control={control}
            render={({ field: { ref, ...field } }) => (
              <Input
                {...field}
                id="create-schedule-form-buffer-limit"
                value={field.value ?? ''}
                // @ts-expect-error - inputRef expects ref object while ref is a callback. It should support both.
                inputRef={ref}
                aria-label="Buffer Limit"
                type="number"
                min={0}
                onChange={(e) =>
                  field.onChange(
                    e.target.value !== '' ? parseInt(e.target.value, 10) : undefined
                  )
                }
                onBlur={field.onBlur}
                error={Boolean(
                  getFieldErrorMessage(fieldErrors, 'bufferLimit')
                )}
                size="compact"
                placeholder="No limit"
              />
            )}
          />
        </CreateScheduleHorizontalField>

        <CreateScheduleHorizontalField
          label="Concurrency Limit"
          description="Maximum number of workflow runs that may run concurrently."
          htmlFor="create-schedule-form-concurrency-limit"
          error={getFieldErrorMessage(fieldErrors, 'concurrencyLimit')}
        >
          <Controller
            name="concurrencyLimit"
            control={control}
            render={({ field: { ref, ...field } }) => (
              <Input
                {...field}
                id="create-schedule-form-concurrency-limit"
                value={field.value ?? ''}
                // @ts-expect-error - inputRef expects ref object while ref is a callback. It should support both.
                inputRef={ref}
                aria-label="Concurrency Limit"
                type="number"
                min={0}
                onChange={(e) =>
                  field.onChange(
                    e.target.value !== '' ? parseInt(e.target.value, 10) : undefined
                  )
                }
                onBlur={field.onBlur}
                error={Boolean(
                  getFieldErrorMessage(fieldErrors, 'concurrencyLimit')
                )}
                size="compact"
                placeholder="No limit"
              />
            )}
          />
        </CreateScheduleHorizontalField>

        {/* Retry policy */}
        <CreateScheduleHorizontalField
          label="Initial Retry Interval"
          description="Starting backoff interval for the first retry."
          htmlFor="create-schedule-form-retry-initial"
          error={getFieldErrorMessage(
            fieldErrors,
            'retryPolicy.initialIntervalSeconds'
          )}
        >
          <Controller
            name="retryPolicy.initialIntervalSeconds"
            control={control}
            render={({ field: { ref, ...field } }) => (
              <Input
                {...field}
                id="create-schedule-form-retry-initial"
                value={field.value ?? ''}
                // @ts-expect-error - inputRef expects ref object while ref is a callback. It should support both.
                inputRef={ref}
                aria-label="Initial Retry Interval"
                type="number"
                min={1}
                onChange={(e) =>
                  field.onChange(
                    e.target.value !== '' ? parseFloat(e.target.value) : undefined
                  )
                }
                onBlur={field.onBlur}
                error={Boolean(
                  getFieldErrorMessage(
                    fieldErrors,
                    'retryPolicy.initialIntervalSeconds'
                  )
                )}
                size="compact"
                placeholder="e.g. 1"
                endEnhancer={<LabelXSmall>Seconds</LabelXSmall>}
              />
            )}
          />
        </CreateScheduleHorizontalField>

        <CreateScheduleHorizontalField
          label="Retry Backoff Coefficient"
          description="Multiplier applied to the retry interval on each attempt."
          htmlFor="create-schedule-form-retry-backoff"
          error={getFieldErrorMessage(
            fieldErrors,
            'retryPolicy.backoffCoefficient'
          )}
        >
          <Controller
            name="retryPolicy.backoffCoefficient"
            control={control}
            render={({ field: { ref, ...field } }) => (
              <Input
                {...field}
                id="create-schedule-form-retry-backoff"
                value={field.value ?? ''}
                // @ts-expect-error - inputRef expects ref object while ref is a callback. It should support both.
                inputRef={ref}
                aria-label="Retry Backoff Coefficient"
                type="number"
                min={1}
                step={0.1}
                onChange={(e) =>
                  field.onChange(
                    e.target.value !== '' ? parseFloat(e.target.value) : undefined
                  )
                }
                onBlur={field.onBlur}
                error={Boolean(
                  getFieldErrorMessage(
                    fieldErrors,
                    'retryPolicy.backoffCoefficient'
                  )
                )}
                size="compact"
                placeholder="e.g. 2"
              />
            )}
          />
        </CreateScheduleHorizontalField>

        <CreateScheduleHorizontalField
          label="Maximum Retry Interval"
          description="Upper bound on the retry interval after backoff."
          htmlFor="create-schedule-form-retry-max-interval"
          error={getFieldErrorMessage(
            fieldErrors,
            'retryPolicy.maximumIntervalSeconds'
          )}
        >
          <Controller
            name="retryPolicy.maximumIntervalSeconds"
            control={control}
            render={({ field: { ref, ...field } }) => (
              <Input
                {...field}
                id="create-schedule-form-retry-max-interval"
                value={field.value ?? ''}
                // @ts-expect-error - inputRef expects ref object while ref is a callback. It should support both.
                inputRef={ref}
                aria-label="Maximum Retry Interval"
                type="number"
                min={1}
                onChange={(e) =>
                  field.onChange(
                    e.target.value !== '' ? parseFloat(e.target.value) : undefined
                  )
                }
                onBlur={field.onBlur}
                error={Boolean(
                  getFieldErrorMessage(
                    fieldErrors,
                    'retryPolicy.maximumIntervalSeconds'
                  )
                )}
                size="compact"
                placeholder="No limit"
                endEnhancer={<LabelXSmall>Seconds</LabelXSmall>}
              />
            )}
          />
        </CreateScheduleHorizontalField>

        <CreateScheduleHorizontalField
          label="Retry Expiration Interval"
          description="Total time after which retries stop regardless of attempt count."
          htmlFor="create-schedule-form-retry-expiry"
          error={getFieldErrorMessage(
            fieldErrors,
            'retryPolicy.expirationIntervalSeconds'
          )}
        >
          <Controller
            name="retryPolicy.expirationIntervalSeconds"
            control={control}
            render={({ field: { ref, ...field } }) => (
              <Input
                {...field}
                id="create-schedule-form-retry-expiry"
                value={field.value ?? ''}
                // @ts-expect-error - inputRef expects ref object while ref is a callback. It should support both.
                inputRef={ref}
                aria-label="Retry Expiration Interval"
                type="number"
                min={1}
                onChange={(e) =>
                  field.onChange(
                    e.target.value !== '' ? parseFloat(e.target.value) : undefined
                  )
                }
                onBlur={field.onBlur}
                error={Boolean(
                  getFieldErrorMessage(
                    fieldErrors,
                    'retryPolicy.expirationIntervalSeconds'
                  )
                )}
                size="compact"
                placeholder="No limit"
                endEnhancer={<LabelXSmall>Seconds</LabelXSmall>}
              />
            )}
          />
        </CreateScheduleHorizontalField>

        <CreateScheduleHorizontalField
          label="Maximum Retry Attempts"
          description="Maximum number of retry attempts. Zero means unlimited."
          htmlFor="create-schedule-form-retry-max-attempts"
          error={getFieldErrorMessage(
            fieldErrors,
            'retryPolicy.maximumAttempts'
          )}
        >
          <Controller
            name="retryPolicy.maximumAttempts"
            control={control}
            render={({ field: { ref, ...field } }) => (
              <Input
                {...field}
                id="create-schedule-form-retry-max-attempts"
                value={field.value ?? ''}
                // @ts-expect-error - inputRef expects ref object while ref is a callback. It should support both.
                inputRef={ref}
                aria-label="Maximum Retry Attempts"
                type="number"
                min={0}
                onChange={(e) =>
                  field.onChange(
                    e.target.value !== '' ? parseInt(e.target.value, 10) : undefined
                  )
                }
                onBlur={field.onBlur}
                error={Boolean(
                  getFieldErrorMessage(
                    fieldErrors,
                    'retryPolicy.maximumAttempts'
                  )
                )}
                size="compact"
                placeholder="0 (unlimited)"
              />
            )}
          />
        </CreateScheduleHorizontalField>

        {/* Memo and search attributes */}
        <CreateScheduleHorizontalField
          label="Memo (optional)"
          description="Arbitrary JSON key-value pairs attached to each workflow run."
          error={getFieldErrorMessage(fieldErrors, 'memo')}
        >
          <Controller
            name="memo"
            control={control}
            render={({ field: { ref, ...field } }) => (
              <Textarea
                {...field}
                value={field.value ?? ''}
                // @ts-expect-error - inputRef expects ref object while ref is a callback. It should support both.
                inputRef={ref}
                aria-label="Memo"
                onChange={(e) => field.onChange(e.target.value || undefined)}
                overrides={overrides.jsonInput}
                onBlur={field.onBlur}
                error={Boolean(getFieldErrorMessage(fieldErrors, 'memo'))}
                size="compact"
                placeholder='{"key":"value"}'
                rows={3}
              />
            )}
          />
        </CreateScheduleHorizontalField>

        <CreateScheduleHorizontalField
          label="Search Attributes (optional)"
          description="Indexed JSON key-value pairs used for workflow search and filtering."
          error={getFieldErrorMessage(fieldErrors, 'searchAttributes')}
        >
          <Controller
            name="searchAttributes"
            control={control}
            render={({ field: { ref, ...field } }) => (
              <Textarea
                {...field}
                value={field.value ?? ''}
                // @ts-expect-error - inputRef expects ref object while ref is a callback. It should support both.
                inputRef={ref}
                aria-label="Search Attributes"
                onChange={(e) => field.onChange(e.target.value || undefined)}
                overrides={overrides.jsonInput}
                onBlur={field.onBlur}
                error={Boolean(
                  getFieldErrorMessage(fieldErrors, 'searchAttributes')
                )}
                size="compact"
                placeholder='{"customAttr":"value"}'
                rows={3}
              />
            )}
          />
        </CreateScheduleHorizontalField>
      </>
    </StatefulPanel>
  );
}
