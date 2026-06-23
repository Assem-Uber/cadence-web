'use client';

import React, { useMemo } from 'react';

import { ScheduleCatchUpPolicy } from '@/__generated__/proto-ts/uber/cadence/api/v1/ScheduleCatchUpPolicy';
import { ScheduleOverlapPolicy } from '@/__generated__/proto-ts/uber/cadence/api/v1/ScheduleOverlapPolicy';
import { StatefulPanel } from 'baseui/accordion';
import { Button } from 'baseui/button';
import { DatePicker } from 'baseui/datepicker';
import { mergeOverrides } from 'baseui/helpers/overrides';
import { Input } from 'baseui/input';
import { Radio, RadioGroup } from 'baseui/radio';
import { Select } from 'baseui/select';
import { Textarea } from 'baseui/textarea';
import { LabelXSmall } from 'baseui/typography';
import { Controller, useWatch } from 'react-hook-form';
import { MdExpandLess, MdExpandMore } from 'react-icons/md';

import useStyletronClasses from '@/hooks/use-styletron-classes';
import useSearchAttributes from '@/views/shared/hooks/use-search-attributes/use-search-attributes';
import DomainSchedulesHorizontalField from '@/views/domain-schedules/domain-schedules-horizontal-field/domain-schedules-horizontal-field';
import { cssStyles as horizontalFieldCssStyles } from '@/views/domain-schedules/domain-schedules-horizontal-field/domain-schedules-horizontal-field.styles';
import getFieldErrorMessage from '@/views/workflow-actions/workflow-action-start-form/helpers/get-field-error-message';
import getSearchAttributesErrorMessage from '@/views/workflow-actions/workflow-action-start-form/helpers/get-search-attributes-error-message';
import WorkflowActionsSearchAttributes from '@/views/workflow-actions/workflow-actions-search-attributes/workflow-actions-search-attributes';

import CreateScheduleRetryPolicyFields from './create-schedule-retry-policy-fields';

import {
  CATCH_UP_POLICY_OPTIONS,
  DEFAULT_BUFFER_LIMIT,
  DEFAULT_CATCH_UP_POLICY,
  DEFAULT_CATCH_UP_WINDOW_DAYS,
  DEFAULT_OVERLAP_POLICY,
  MAX_CATCH_UP_WINDOW_DAYS,
  OVERLAP_POLICY_OPTIONS,
} from './create-schedule-advanced-form.constants';
import { cssStyles, overrides } from './create-schedule-advanced-form.styles';
import { type Props } from './create-schedule-advanced-form.types';

export default function CreateScheduleAdvancedForm({
  control,
  clearErrors,
  fieldErrors,
  cluster,
}: Props) {
  const { cls } = useStyletronClasses({
    ...cssStyles,
    ...horizontalFieldCssStyles,
  });

  const overlapPolicy = useWatch({ control, name: 'overlapPolicy' });
  const catchUpPolicy = useWatch({
    control,
    name: 'catchUpPolicy',
    defaultValue: DEFAULT_CATCH_UP_POLICY,
  });

  const { data: searchAttributesData, isLoading: isLoadingSearchAttributes } =
    useSearchAttributes({ cluster, category: 'custom' });

  const searchAttributesOptions = useMemo(() => {
    return Object.entries(searchAttributesData?.keys || {}).map(
      ([name, valueType]) => ({
        name,
        valueType,
      })
    );
  }, [searchAttributesData?.keys]);

  const showBufferLimit =
    overlapPolicy === ScheduleOverlapPolicy.SCHEDULE_OVERLAP_POLICY_BUFFER;
  const showConcurrencyLimit =
    overlapPolicy === ScheduleOverlapPolicy.SCHEDULE_OVERLAP_POLICY_CONCURRENT;
  const showCatchUpWindow =
    catchUpPolicy !== ScheduleCatchUpPolicy.SCHEDULE_CATCH_UP_POLICY_SKIP;

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
                  ? 'Hide advanced configurations'
                  : 'Show advanced configurations'}
              </Button>
              <div className={cls.divider} />
            </div>
          ),
        },
      })}
    >
      <>
        <DomainSchedulesHorizontalField
          label="Schedule Id"
          description="Unique name provided by users to name the schedule."
          htmlFor="create-schedule-form-schedule-id"
          hint="If left empty server will generate a unique GUID."
          error={getFieldErrorMessage(fieldErrors, 'scheduleId')}
        >
          <Controller
            name="scheduleId"
            control={control}
            render={({ field: { ref, ...field } }) => (
              <Input
                {...field}
                value={field.value ?? ''}
                id="create-schedule-form-schedule-id"
                // @ts-expect-error - inputRef expects ref object while ref is a callback. It should support both.
                inputRef={ref}
                aria-label="Schedule Id"
                onChange={(e) => field.onChange(e.target.value || undefined)}
                onBlur={field.onBlur}
                error={Boolean(getFieldErrorMessage(fieldErrors, 'scheduleId'))}
                size="compact"
                placeholder="Add schedule id"
              />
            )}
          />
        </DomainSchedulesHorizontalField>

        <DomainSchedulesHorizontalField
          label="Overlap policy options"
          description="Define what happens when a new execution is scheduled while a previous one is still running."
          error={getFieldErrorMessage(fieldErrors, 'overlapPolicy')}
        >
          <Controller
            name="overlapPolicy"
            control={control}
            defaultValue={DEFAULT_OVERLAP_POLICY}
            render={({ field: { value, onChange, ref, ...field } }) => (
              <Select
                {...field}
                inputRef={ref}
                aria-label="Overlap policy options"
                options={OVERLAP_POLICY_OPTIONS}
                value={[{ id: value ?? DEFAULT_OVERLAP_POLICY }]}
                onChange={(params) => {
                  onChange(params.value[0]?.id ?? DEFAULT_OVERLAP_POLICY);
                  clearErrors(['bufferLimit', 'concurrencyLimit']);
                }}
                error={Boolean(
                  getFieldErrorMessage(fieldErrors, 'overlapPolicy')
                )}
                size="compact"
                clearable={false}
              />
            )}
          />
        </DomainSchedulesHorizontalField>

        {(showBufferLimit || showConcurrencyLimit) && (
          <div className={cls.dependentFieldGroup}>
            {showBufferLimit && (
              <DomainSchedulesHorizontalField
                grouped
                label="Buffer limit"
              description="Max buffer size limit"
              htmlFor="create-schedule-form-buffer-limit"
              hint="Default buffer limit is 0 (unlimited)"
              error={getFieldErrorMessage(fieldErrors, 'bufferLimit')}
            >
              <Controller
                name="bufferLimit"
                control={control}
                defaultValue={DEFAULT_BUFFER_LIMIT}
                render={({ field: { ref, ...field } }) => (
                  <Input
                    {...field}
                    id="create-schedule-form-buffer-limit"
                    value={field.value ?? DEFAULT_BUFFER_LIMIT}
                    // @ts-expect-error - inputRef expects ref object while ref is a callback. It should support both.
                    inputRef={ref}
                    aria-label="Buffer limit"
                    type="number"
                    min={0}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value !== ''
                          ? parseInt(e.target.value, 10)
                          : undefined
                      )
                    }
                    onBlur={field.onBlur}
                    error={Boolean(
                      getFieldErrorMessage(fieldErrors, 'bufferLimit')
                    )}
                    size="compact"
                  />
                )}
              />
            </DomainSchedulesHorizontalField>
          )}

          {showConcurrencyLimit && (
            <DomainSchedulesHorizontalField
              grouped
              label="Concurrency limit"
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
                    value={field.value ?? DEFAULT_BUFFER_LIMIT}
                    // @ts-expect-error - inputRef expects ref object while ref is a callback. It should support both.
                    inputRef={ref}
                    aria-label="Concurrency limit"
                    type="number"
                    min={0}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value !== ''
                          ? parseInt(e.target.value, 10)
                          : undefined
                      )
                    }
                    onBlur={field.onBlur}
                    error={Boolean(
                      getFieldErrorMessage(fieldErrors, 'concurrencyLimit')
                    )}
                    size="compact"
                  />
                )}
              />
            </DomainSchedulesHorizontalField>
            )}
          </div>
        )}

        <DomainSchedulesHorizontalField
          label="Catch-up policy"
          description="Catch-up policy determines how to handle missed runs when unpausing a schedule."
          error={getFieldErrorMessage(fieldErrors, 'catchUpPolicy')}
        >
          <Controller
            name="catchUpPolicy"
            control={control}
            defaultValue={DEFAULT_CATCH_UP_POLICY}
            render={({ field: { value, onChange, ref, ...field } }) => (
              <RadioGroup
                {...field}
                // @ts-expect-error - inputRef expects ref object while ref is a callback. It should support both.
                inputRef={ref}
                aria-label="Catch-up policy"
                value={value ?? DEFAULT_CATCH_UP_POLICY}
                onChange={(e) => {
                  onChange(e.currentTarget.value);
                  clearErrors('catchUpWindowDays');
                }}
                error={Boolean(
                  getFieldErrorMessage(fieldErrors, 'catchUpPolicy')
                )}
                align="horizontal"
              >
                {CATCH_UP_POLICY_OPTIONS.map((option) => (
                  <Radio
                    key={option.id}
                    value={option.id}
                    overrides={overrides.catchUpPolicyRadio}
                  >
                    {option.label}
                  </Radio>
                ))}
              </RadioGroup>
            )}
          />
        </DomainSchedulesHorizontalField>

        {showCatchUpWindow && (
          <div className={cls.dependentFieldGroup}>
            <DomainSchedulesHorizontalField
              grouped
              label="Catch-up window"
              description="Catchup duration for which catchup policy applies."
              htmlFor="create-schedule-form-catchup-window"
              hint={`Default is ${DEFAULT_CATCH_UP_WINDOW_DAYS} days and max allowed is ${MAX_CATCH_UP_WINDOW_DAYS} days`}
              error={getFieldErrorMessage(fieldErrors, 'catchUpWindowDays')}
            >
              <Controller
                name="catchUpWindowDays"
                control={control}
                defaultValue={DEFAULT_CATCH_UP_WINDOW_DAYS}
                render={({ field: { ref, ...field } }) => (
                  <Input
                    {...field}
                    id="create-schedule-form-catchup-window"
                    value={field.value ?? DEFAULT_CATCH_UP_WINDOW_DAYS}
                    // @ts-expect-error - inputRef expects ref object while ref is a callback. It should support both.
                    inputRef={ref}
                    aria-label="Catch-up window"
                    type="number"
                    min={1}
                    max={MAX_CATCH_UP_WINDOW_DAYS}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value !== ''
                          ? parseInt(e.target.value, 10)
                          : undefined
                      )
                    }
                    onBlur={field.onBlur}
                    error={Boolean(
                      getFieldErrorMessage(fieldErrors, 'catchUpWindowDays')
                    )}
                    size="compact"
                    endEnhancer={<LabelXSmall>Days</LabelXSmall>}
                  />
                )}
              />
            </DomainSchedulesHorizontalField>
          </div>
        )}

        <DomainSchedulesHorizontalField
          label="Schedule period"
          description="When the schedule should start and stop creating workflows."
        >
          <div className={cls.schedulePeriodRow}>
            <div className={cls.schedulePeriodField}>
              <div className={cls.schedulePeriodLabel}>Start date</div>
              <Controller
                name="startTime"
                control={control}
                render={({ field: { value, onChange, ref, ...field } }) => (
                  <DatePicker
                    {...field}
                    // @ts-expect-error - inputRef expects ref object while ref is a callback. It should support both.
                    inputRef={ref}
                    aria-label="Start date"
                    value={value ? [new Date(value)] : []}
                    onChange={({ date }) => {
                      const d = Array.isArray(date) ? date[0] : date;
                      onChange(d ? d.toISOString() : undefined);
                    }}
                    error={Boolean(
                      getFieldErrorMessage(fieldErrors, 'startTime')
                    )}
                    size="compact"
                    timeSelectStart
                    formatString="yyyy/MM/dd HH:mm"
                    placeholder="Select start date"
                    clearable
                  />
                )}
              />
            </div>
            <div className={cls.schedulePeriodField}>
              <div className={cls.schedulePeriodLabel}>End date</div>
              <Controller
                name="endTime"
                control={control}
                render={({ field: { value, onChange, ref, ...field } }) => (
                  <DatePicker
                    {...field}
                    // @ts-expect-error - inputRef expects ref object while ref is a callback. It should support both.
                    inputRef={ref}
                    aria-label="End date"
                    value={value ? [new Date(value)] : []}
                    onChange={({ date }) => {
                      const d = Array.isArray(date) ? date[0] : date;
                      onChange(d ? d.toISOString() : undefined);
                    }}
                    error={Boolean(getFieldErrorMessage(fieldErrors, 'endTime'))}
                    size="compact"
                    timeSelectStart
                    formatString="yyyy/MM/dd HH:mm"
                    placeholder="Select end date"
                    clearable
                  />
                )}
              />
            </div>
          </div>
        </DomainSchedulesHorizontalField>

        <DomainSchedulesHorizontalField
          label="Jitter duration"
          description="Time range to distribute starting workflows across. This helps avoiding burst of workflow creations in a single point of time."
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
                aria-label="Jitter duration"
                type="number"
                min={0}
                onChange={(e) =>
                  field.onChange(
                    e.target.value !== ''
                      ? parseFloat(e.target.value)
                      : undefined
                  )
                }
                onBlur={field.onBlur}
                error={Boolean(
                  getFieldErrorMessage(fieldErrors, 'jitterSeconds')
                )}
                size="compact"
                placeholder="Add Jitter duration"
                endEnhancer={<LabelXSmall>Seconds</LabelXSmall>}
              />
            )}
          />
        </DomainSchedulesHorizontalField>

        <DomainSchedulesHorizontalField
          label="Workflow Id Prefix"
          description="Prefix text to add into started workflows. Ids are formed as `${Prefix}+{auto generated postfix}`."
          htmlFor="create-schedule-form-workflow-id-prefix"
          hint="If the prefix is not provided, scheduleId is used."
          error={getFieldErrorMessage(fieldErrors, 'workflowIdPrefix')}
        >
          <Controller
            name="workflowIdPrefix"
            control={control}
            render={({ field: { ref, ...field } }) => (
              <Input
                {...field}
                value={field.value ?? ''}
                id="create-schedule-form-workflow-id-prefix"
                // @ts-expect-error - inputRef expects ref object while ref is a callback. It should support both.
                inputRef={ref}
                aria-label="Workflow Id Prefix"
                onChange={(e) => field.onChange(e.target.value || undefined)}
                onBlur={field.onBlur}
                error={Boolean(
                  getFieldErrorMessage(fieldErrors, 'workflowIdPrefix')
                )}
                size="compact"
                placeholder="Add workflow id prefix"
              />
            )}
          />
        </DomainSchedulesHorizontalField>

        <CreateScheduleRetryPolicyFields
          control={control}
          clearErrors={clearErrors}
          fieldErrors={fieldErrors}
        />

        <DomainSchedulesHorizontalField
          label="Search attributes"
          description="Searchable metadata assigned to the schedules"
        >
          <Controller
            name="searchAttributes"
            control={control}
            defaultValue={[]}
            render={({ field }) => (
              <WorkflowActionsSearchAttributes
                value={field.value}
                onChange={field.onChange}
                searchAttributes={searchAttributesOptions}
                isLoading={isLoadingSearchAttributes}
                error={getSearchAttributesErrorMessage(
                  fieldErrors,
                  'searchAttributes'
                )}
                showSectionBorder={false}
              />
            )}
          />
        </DomainSchedulesHorizontalField>

        <DomainSchedulesHorizontalField
          label="Memo"
          description="Metadata assigned to the workflows (JSON string)"
          error={getFieldErrorMessage(fieldErrors, 'memo')}
        >
          <Controller
            name="memo"
            control={control}
            defaultValue=""
            render={({ field: { ref, ...field } }) => (
              <Textarea
                {...field}
                // @ts-expect-error - inputRef expects ref object while ref is a callback. It should support both.
                inputRef={ref}
                aria-label="Memo"
                onChange={(e) => field.onChange(e.target.value)}
                overrides={overrides.jsonInput}
                onBlur={field.onBlur}
                error={Boolean(getFieldErrorMessage(fieldErrors, 'memo'))}
                size="compact"
                placeholder="Add schedules action memo"
                rows={3}
              />
            )}
          />
        </DomainSchedulesHorizontalField>
      </>
    </StatefulPanel>
  );
}
