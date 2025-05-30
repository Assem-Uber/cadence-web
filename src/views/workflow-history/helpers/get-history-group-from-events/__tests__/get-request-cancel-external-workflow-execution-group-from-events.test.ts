import {
  initiateRequestCancelExternalWorkflowEvent,
  requestCancelExternalWorkflowEvent,
} from '@/views/workflow-history/__fixtures__/workflow-history-request-cancel-external-workflow-events';

import type { RequestCancelExternalWorkflowExecutionHistoryEvent } from '../../../workflow-history.types';
import getRequestCancelExternalWorkflowExecutionGroupFromEvents from '../get-request-cancel-external-workflow-execution-group-from-events';

jest.useFakeTimers().setSystemTime(new Date('2024-05-25'));

describe('getRequestCancelExternalWorkflowExecutionGroupFromEvents', () => {
  it('should return a group with a correct label', () => {
    const events: RequestCancelExternalWorkflowExecutionHistoryEvent[] = [
      requestCancelExternalWorkflowEvent,
    ];

    const expectedLabel = `Request Cancel External Workflow`;

    const group =
      getRequestCancelExternalWorkflowExecutionGroupFromEvents(events);

    expect(group.label).toBe(expectedLabel);
  });

  it('should return a group with hasMissingEvents set to true when any event is missing', () => {
    const assertions: Array<{
      name: string;
      events: RequestCancelExternalWorkflowExecutionHistoryEvent[];
      assertionValue: boolean;
    }> = [
      {
        name: 'missingInitiatedEvent',
        events: [requestCancelExternalWorkflowEvent],
        assertionValue: true,
      },
      {
        name: 'missingCloseEvent',
        events: [initiateRequestCancelExternalWorkflowEvent],
        assertionValue: true,
      },
      {
        name: 'completedEvent',
        events: [
          initiateRequestCancelExternalWorkflowEvent,
          requestCancelExternalWorkflowEvent,
        ],
        assertionValue: false,
      },
    ];

    assertions.forEach(({ name, events, assertionValue }) => {
      const group =
        getRequestCancelExternalWorkflowExecutionGroupFromEvents(events);
      expect([name, group.hasMissingEvents]).toEqual([name, assertionValue]);
    });
  });

  it('should return a group with groupType equal to RequestCancelExternalWorkflowExecution', () => {
    const events: RequestCancelExternalWorkflowExecutionHistoryEvent[] = [
      initiateRequestCancelExternalWorkflowEvent,
      requestCancelExternalWorkflowEvent,
    ];
    const group =
      getRequestCancelExternalWorkflowExecutionGroupFromEvents(events);
    expect(group.groupType).toBe('RequestCancelExternalWorkflowExecution');
  });

  it('should return group eventsMetadata with correct labels', () => {
    const events: RequestCancelExternalWorkflowExecutionHistoryEvent[] = [
      initiateRequestCancelExternalWorkflowEvent,
      requestCancelExternalWorkflowEvent,
    ];
    const group =
      getRequestCancelExternalWorkflowExecutionGroupFromEvents(events);
    expect(group.eventsMetadata.map(({ label }) => label)).toEqual([
      'Initiated',
      'Requested',
    ]);
  });

  it('should return group eventsMetadata with correct status', () => {
    // initiated
    const initiateEvents: RequestCancelExternalWorkflowExecutionHistoryEvent[] =
      [initiateRequestCancelExternalWorkflowEvent];
    const initiatedGroup =
      getRequestCancelExternalWorkflowExecutionGroupFromEvents(initiateEvents);
    expect(initiatedGroup.eventsMetadata.map(({ status }) => status)).toEqual([
      'WAITING',
    ]);

    // requested
    const requestEvents: RequestCancelExternalWorkflowExecutionHistoryEvent[] =
      [
        initiateRequestCancelExternalWorkflowEvent,
        requestCancelExternalWorkflowEvent,
      ];
    const requestedGroup =
      getRequestCancelExternalWorkflowExecutionGroupFromEvents(requestEvents);
    expect(requestedGroup.eventsMetadata.map(({ status }) => status)).toEqual([
      'COMPLETED',
      'COMPLETED',
    ]);
  });

  it('should return group eventsMetadata with correct timeLabel', () => {
    const events: RequestCancelExternalWorkflowExecutionHistoryEvent[] = [
      initiateRequestCancelExternalWorkflowEvent,
      requestCancelExternalWorkflowEvent,
    ];
    const group =
      getRequestCancelExternalWorkflowExecutionGroupFromEvents(events);
    expect(group.eventsMetadata.map(({ timeLabel }) => timeLabel)).toEqual([
      'Initiated at 07 Sep, 22:51:10 UTC',
      'Requested at 07 Sep, 22:52:50 UTC',
    ]);
  });

  it('should return group with closeTimeMs equal to closeEvent timeMs', () => {
    const group = getRequestCancelExternalWorkflowExecutionGroupFromEvents([
      initiateRequestCancelExternalWorkflowEvent,
      requestCancelExternalWorkflowEvent,
    ]);
    expect(group.closeTimeMs).toEqual(1725749570927.7693);

    const groupWithMissingCloseEvent =
      getRequestCancelExternalWorkflowExecutionGroupFromEvents([
        initiateRequestCancelExternalWorkflowEvent,
      ]);
    expect(groupWithMissingCloseEvent.closeTimeMs).toEqual(null);
  });
});
