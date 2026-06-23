'use client';

import React from 'react';

import { StatefulPanel } from 'baseui/accordion';
import { Button } from 'baseui/button';
import { mergeOverrides } from 'baseui/helpers/overrides';
import { Input } from 'baseui/input';
import { LabelXSmall } from 'baseui/typography';
import { Controller } from 'react-hook-form';
import { MdExpandLess, MdExpandMore } from 'react-icons/md';

import useStyletronClasses from '@/hooks/use-styletron-classes';
import DomainSchedulesHorizontalField from '@/views/domain-schedules/domain-schedules-horizontal-field/domain-schedules-horizontal-field';
import getFieldErrorMessage from '@/views/workflow-actions/workflow-action-start-form/helpers/get-field-error-message';
import { cssStyles, overrides } from './create-schedule-advanced-form.styles';
import { type Props } from './create-schedule-advanced-form.types';

export default function CreateScheduleAdvancedForm({ control, fieldErrors }: Props) {
  const { cls } = useStyletronClasses(cssStyles);

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
      </>
    </StatefulPanel>
  );
}
