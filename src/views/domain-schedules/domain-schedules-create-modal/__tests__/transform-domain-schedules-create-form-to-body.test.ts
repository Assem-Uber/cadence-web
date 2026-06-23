import { type DomainSchedulesCreateFormData } from '../domain-schedules-create-modal.types';
import { CREATE_SCHEDULE_ADVANCED_FORM_DEFAULTS } from '../create-schedule-advanced-form/create-schedule-advanced-form.constants';
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
    pauseOnFailure: false,
    overlapPolicy: CREATE_SCHEDULE_ADVANCED_FORM_DEFAULTS.overlapPolicy,
    catchUpPolicy: CREATE_SCHEDULE_ADVANCED_FORM_DEFAULTS.catchUpPolicy,
    catchUpWindowDays: CREATE_SCHEDULE_ADVANCED_FORM_DEFAULTS.catchUpWindowDays,
  };

  it('maps form fields to create-schedule request body', () => {
    const result = transformDomainSchedulesCreateFormToBody(baseForm);

    expect(result).toEqual({
      cronExpression: '0 9 * * *',
      pauseOnFailure: false,
      overlapPolicy: CREATE_SCHEDULE_ADVANCED_FORM_DEFAULTS.overlapPolicy,
      catchUpPolicy: CREATE_SCHEDULE_ADVANCED_FORM_DEFAULTS.catchUpPolicy,
      startWorkflow: {
        workflowType: { name: 'DemoWorkflow' },
        taskList: { name: 'demo-tl' },
        workerSDKLanguage: 'GO',
        executionStartToCloseTimeoutSeconds: 3600,
        taskStartToCloseTimeoutSeconds: 45,
        workflowIdPrefix: '',
      },
    });
  });

  it('includes catch-up window when catch-up policy is not skip', () => {
    const result = transformDomainSchedulesCreateFormToBody({
      ...baseForm,
      catchUpPolicy: 'SCHEDULE_CATCH_UP_POLICY_ONE',
      catchUpWindowDays: 7,
    });

    expect(result.catchUpWindowSeconds).toBe(7 * 86_400);
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
});
