import { ScheduleCatchUpPolicy } from '@/__generated__/proto-ts/uber/cadence/api/v1/ScheduleCatchUpPolicy';
import { ScheduleOverlapPolicy } from '@/__generated__/proto-ts/uber/cadence/api/v1/ScheduleOverlapPolicy';

import { type DomainSchedulesCreateFormData } from '../domain-schedules-create-modal.types';
import transformDomainSchedulesCreateFormToBody from '../helpers/transform-domain-schedules-create-form-to-body';

describe(transformDomainSchedulesCreateFormToBody.name, () => {
  const baseForm: DomainSchedulesCreateFormData = {
    cronExpression: {
      minutes: '0',
      hours: '9',
      daysOfMonth: '*',
      months: '*',
      daysOfWeek: '*',
    },
    workflowType: { name: 'DemoWorkflow' },
    taskList: { name: 'demo-tl' },
    workerSDKLanguage: 'GO',
    executionStartToCloseTimeoutSeconds: 3600,
    taskStartToCloseTimeoutSeconds: 45,
  };

  it('maps form fields to create-schedule request body', () => {
    const result = transformDomainSchedulesCreateFormToBody(baseForm);

    expect(result).toEqual({
      cronExpression: '0 9 * * *',
      pauseOnFailure: undefined,
      overlapPolicy: undefined,
      startWorkflow: {
        workflowType: { name: 'DemoWorkflow' },
        taskList: { name: 'demo-tl' },
        workerSDKLanguage: 'GO',
        executionStartToCloseTimeoutSeconds: 3600,
        taskStartToCloseTimeoutSeconds: 45,
      },
    });
  });

  it('includes parsed JSON inputs when provided', () => {
    const result = transformDomainSchedulesCreateFormToBody({
      ...baseForm,
      input: ['"a"', '42'],
    });

    expect(result.startWorkflow.input).toEqual(['a', 42]);
  });

  it('omits input when only empty strings are present', () => {
    const result = transformDomainSchedulesCreateFormToBody({
      ...baseForm,
      input: ['', '  '],
    });

    expect(result.startWorkflow.input).toBeUndefined();
  });

  it('trims workflow type and task list names', () => {
    const result = transformDomainSchedulesCreateFormToBody({
      ...baseForm,
      workflowType: { name: ' DemoWorkflow ' },
      taskList: { name: ' demo-tl ' },
    });

    expect(result.startWorkflow.workflowType.name).toBe('DemoWorkflow');
    expect(result.startWorkflow.taskList.name).toBe('demo-tl');
  });

  it('maps optional simple advanced fields only when provided', () => {
    const result = transformDomainSchedulesCreateFormToBody({
      ...baseForm,
      scheduleId: '  my-schedule  ',
      workflowIdPrefix: '  wf-prefix  ',
      jitterSeconds: '10',
    });

    expect(result.scheduleId).toBe('my-schedule');
    expect(result.jitterSeconds).toBe(10);
    expect(result.startWorkflow.workflowIdPrefix).toBe('wf-prefix');
  });

  it('includes bufferLimit only for buffer overlap policy', () => {
    const result = transformDomainSchedulesCreateFormToBody({
      ...baseForm,
      overlapPolicy: ScheduleOverlapPolicy.SCHEDULE_OVERLAP_POLICY_BUFFER,
      bufferLimit: '4',
      concurrencyLimit: '9',
    });

    expect(result.overlapPolicy).toBe(
      ScheduleOverlapPolicy.SCHEDULE_OVERLAP_POLICY_BUFFER
    );
    expect(result.bufferLimit).toBe(4);
    expect(result.concurrencyLimit).toBeUndefined();
  });

  it('includes concurrencyLimit only for concurrent overlap policy', () => {
    const result = transformDomainSchedulesCreateFormToBody({
      ...baseForm,
      overlapPolicy: ScheduleOverlapPolicy.SCHEDULE_OVERLAP_POLICY_CONCURRENT,
      bufferLimit: '2',
      concurrencyLimit: '7',
    });

    expect(result.overlapPolicy).toBe(
      ScheduleOverlapPolicy.SCHEDULE_OVERLAP_POLICY_CONCURRENT
    );
    expect(result.concurrencyLimit).toBe(7);
    expect(result.bufferLimit).toBeUndefined();
  });

  it('maps catch-up window days to seconds for non-skip catch-up policy', () => {
    const result = transformDomainSchedulesCreateFormToBody({
      ...baseForm,
      catchUpPolicy: ScheduleCatchUpPolicy.SCHEDULE_CATCH_UP_POLICY_ONE,
      catchUpWindowDays: '14',
    });

    expect(result.catchUpPolicy).toBe(
      ScheduleCatchUpPolicy.SCHEDULE_CATCH_UP_POLICY_ONE
    );
    expect(result.catchUpWindowSeconds).toBe(14 * 86400);
  });

  it('omits catch-up window seconds for skip catch-up policy', () => {
    const result = transformDomainSchedulesCreateFormToBody({
      ...baseForm,
      catchUpPolicy: ScheduleCatchUpPolicy.SCHEDULE_CATCH_UP_POLICY_SKIP,
      catchUpWindowDays: '14',
    });

    expect(result.catchUpPolicy).toBe(
      ScheduleCatchUpPolicy.SCHEDULE_CATCH_UP_POLICY_SKIP
    );
    expect(result.catchUpWindowSeconds).toBeUndefined();
  });

  it('omits catchUpPolicy when not set on form data', () => {
    const result = transformDomainSchedulesCreateFormToBody(baseForm);

    expect(result.catchUpPolicy).toBeUndefined();
  });

  it('omits buffer and concurrency limits when limit strings are empty', () => {
    const bufferResult = transformDomainSchedulesCreateFormToBody({
      ...baseForm,
      overlapPolicy: ScheduleOverlapPolicy.SCHEDULE_OVERLAP_POLICY_BUFFER,
      bufferLimit: '',
    });
    expect(bufferResult.bufferLimit).toBeUndefined();

    const concurrentResult = transformDomainSchedulesCreateFormToBody({
      ...baseForm,
      overlapPolicy: ScheduleOverlapPolicy.SCHEDULE_OVERLAP_POLICY_CONCURRENT,
      concurrencyLimit: '',
    });
    expect(concurrentResult.concurrencyLimit).toBeUndefined();
  });
});
