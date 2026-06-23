'use client';

import React from 'react';

import { Checkbox } from 'baseui/checkbox';
import { Input } from 'baseui/input';
import { Radio, RadioGroup } from 'baseui/radio';
import { LabelXSmall } from 'baseui/typography';
import { Controller, useWatch } from 'react-hook-form';

import useStyletronClasses from '@/hooks/use-styletron-classes';
import DomainSchedulesHorizontalField from '@/views/domain-schedules/domain-schedules-horizontal-field/domain-schedules-horizontal-field';
import { cssStyles as horizontalFieldCssStyles } from '@/views/domain-schedules/domain-schedules-horizontal-field/domain-schedules-horizontal-field.styles';
import getFieldErrorMessage from '@/views/workflow-actions/workflow-action-start-form/helpers/get-field-error-message';

import { overrides } from './create-schedule-retry-policy-fields.styles';
import { type Props } from './create-schedule-retry-policy-fields.types';

export default function CreateScheduleRetryPolicyFields({
  control,
  clearErrors,
  fieldErrors,
}: Props) {
  const enableRetryPolicy = useWatch({
    control,
    name: 'enableRetryPolicy',
    defaultValue: false,
  });

  const limitRetries = useWatch({
    control,
    name: 'limitRetries',
    defaultValue: 'ATTEMPTS',
  });

  const { cls } = useStyletronClasses(horizontalFieldCssStyles);

  return (
    <>
      <DomainSchedulesHorizontalField
        label="Retry policy"
        description="Configure retry behavior for workflows started by this schedule."
        htmlFor="create-schedule-form-enable-retry-policy"
      >
        <Controller
          name="enableRetryPolicy"
          control={control}
          defaultValue={false}
          render={({ field: { value, onChange, ref, ...field } }) => (
            <Checkbox
              {...field}
              id="create-schedule-form-enable-retry-policy"
              // @ts-expect-error - inputRef expects ref object while ref is a callback. It should support both.
              inputRef={ref}
              aria-label="Enable retry policy"
              checked={value}
              checkmarkType="toggle"
              labelPlacement="right"
              overrides={overrides.enableRetryPolicyCheckbox}
              onChange={(e) => {
                clearErrors('retryPolicy.initialIntervalSeconds');
                clearErrors('retryPolicy.backoffCoefficient');
                clearErrors('retryPolicy.maximumIntervalSeconds');
                clearErrors('retryPolicy.maximumAttempts');
                clearErrors('retryPolicy.expirationIntervalSeconds');
                onChange(e.currentTarget.checked);
              }}
              error={Boolean(
                getFieldErrorMessage(fieldErrors, 'enableRetryPolicy')
              )}
            >
              Enable retry policy
            </Checkbox>
          )}
        />
      </DomainSchedulesHorizontalField>

      {enableRetryPolicy && (
        <div className={cls.dependentFieldGroup}>
          <DomainSchedulesHorizontalField
            grouped
            label="Initial interval"
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
              defaultValue=""
              render={({ field: { ref, ...field } }) => (
                <Input
                  {...field}
                  id="create-schedule-form-retry-initial"
                  // @ts-expect-error - inputRef expects ref object while ref is a callback. It should support both.
                  inputRef={ref}
                  aria-label="Initial interval"
                  type="number"
                  min={1}
                  onBlur={field.onBlur}
                  error={Boolean(
                    getFieldErrorMessage(
                      fieldErrors,
                      'retryPolicy.initialIntervalSeconds'
                    )
                  )}
                  size="compact"
                  placeholder="Enter initial interval in seconds"
                  endEnhancer={<LabelXSmall>Seconds</LabelXSmall>}
                />
              )}
            />
          </DomainSchedulesHorizontalField>

          <DomainSchedulesHorizontalField
            grouped
            label="Backoff coefficient"
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
              defaultValue=""
              render={({ field: { ref, ...field } }) => (
                <Input
                  {...field}
                  id="create-schedule-form-retry-backoff"
                  // @ts-expect-error - inputRef expects ref object while ref is a callback. It should support both.
                  inputRef={ref}
                  aria-label="Backoff coefficient"
                  type="number"
                  step={0.1}
                  min={1}
                  onBlur={field.onBlur}
                  error={Boolean(
                    getFieldErrorMessage(
                      fieldErrors,
                      'retryPolicy.backoffCoefficient'
                    )
                  )}
                  size="compact"
                  placeholder="Enter backoff coefficient"
                />
              )}
            />
          </DomainSchedulesHorizontalField>

          <DomainSchedulesHorizontalField
            grouped
            label="Maximum interval"
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
              defaultValue=""
              render={({ field: { ref, ...field } }) => (
                <Input
                  {...field}
                  id="create-schedule-form-retry-max-interval"
                  // @ts-expect-error - inputRef expects ref object while ref is a callback. It should support both.
                  inputRef={ref}
                  aria-label="Maximum interval"
                  type="number"
                  min={1}
                  onBlur={field.onBlur}
                  error={Boolean(
                    getFieldErrorMessage(
                      fieldErrors,
                      'retryPolicy.maximumIntervalSeconds'
                    )
                  )}
                  size="compact"
                  placeholder="Enter maximum interval in seconds"
                  endEnhancer={<LabelXSmall>Seconds</LabelXSmall>}
                />
              )}
            />
          </DomainSchedulesHorizontalField>

          <DomainSchedulesHorizontalField
            grouped
            label="Limit retries"
            description="Choose whether to cap retries by attempt count or total duration."
            error={getFieldErrorMessage(fieldErrors, 'limitRetries')}
          >
            <Controller
              name="limitRetries"
              control={control}
              defaultValue="ATTEMPTS"
              render={({ field: { value, onChange, ref, ...field } }) => (
                <RadioGroup
                  {...field}
                  // @ts-expect-error - inputRef expects ref object while ref is a callback. It should support both.
                  inputRef={ref}
                  aria-label="Limit retries"
                  value={value ?? 'ATTEMPTS'}
                  onChange={(e) => {
                    clearErrors('retryPolicy.maximumAttempts');
                    clearErrors('retryPolicy.expirationIntervalSeconds');
                    onChange(e.currentTarget.value);
                  }}
                  error={Boolean(
                    getFieldErrorMessage(fieldErrors, 'limitRetries')
                  )}
                  align="horizontal"
                >
                  <Radio
                    value="ATTEMPTS"
                    overrides={overrides.limitRetriesRadio}
                  >
                    Attempts
                  </Radio>
                  <Radio
                    value="DURATION"
                    overrides={overrides.limitRetriesRadio}
                  >
                    Duration
                  </Radio>
                </RadioGroup>
              )}
            />
          </DomainSchedulesHorizontalField>

          {limitRetries === 'DURATION' && (
            <DomainSchedulesHorizontalField
              grouped
              label="Expiration interval"
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
                defaultValue=""
                render={({ field: { ref, ...field } }) => (
                  <Input
                    {...field}
                    id="create-schedule-form-retry-expiry"
                    // @ts-expect-error - inputRef expects ref object while ref is a callback. It should support both.
                    inputRef={ref}
                    aria-label="Expiration interval"
                    type="number"
                    min={1}
                    onBlur={field.onBlur}
                    error={Boolean(
                      getFieldErrorMessage(
                        fieldErrors,
                        'retryPolicy.expirationIntervalSeconds'
                      )
                    )}
                    size="compact"
                    placeholder="Enter expiration interval in seconds"
                    endEnhancer={<LabelXSmall>Seconds</LabelXSmall>}
                  />
                )}
              />
            </DomainSchedulesHorizontalField>
          )}

          {limitRetries === 'ATTEMPTS' && (
            <DomainSchedulesHorizontalField
              grouped
              label="Maximum attempts"
              description="Maximum number of retry attempts."
              htmlFor="create-schedule-form-retry-max-attempts"
              error={getFieldErrorMessage(
                fieldErrors,
                'retryPolicy.maximumAttempts'
              )}
            >
              <Controller
                name="retryPolicy.maximumAttempts"
                control={control}
                defaultValue=""
                render={({ field: { ref, ...field } }) => (
                  <Input
                    {...field}
                    id="create-schedule-form-retry-max-attempts"
                    // @ts-expect-error - inputRef expects ref object while ref is a callback. It should support both.
                    inputRef={ref}
                    aria-label="Maximum attempts"
                    type="number"
                    min={1}
                    onBlur={field.onBlur}
                    error={Boolean(
                      getFieldErrorMessage(
                        fieldErrors,
                        'retryPolicy.maximumAttempts'
                      )
                    )}
                    size="compact"
                    placeholder="Enter maximum attempts"
                  />
                )}
              />
            </DomainSchedulesHorizontalField>
          )}
        </div>
      )}
    </>
  );
}
