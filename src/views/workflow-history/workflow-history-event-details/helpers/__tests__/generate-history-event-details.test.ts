import { createElement } from 'react';

import generateHistoryEventDetails from '../generate-history-event-details';
import getHistoryEventFieldRenderConfig from '../get-history-event-field-render-config';

jest.mock('../get-history-event-field-render-config', () => jest.fn());

const mockedGetHistoryEventFieldRenderConfig =
  getHistoryEventFieldRenderConfig as jest.Mock;

describe(generateHistoryEventDetails.name, () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockedGetHistoryEventFieldRenderConfig.mockReturnValue({
      name: 'Mock render config',
      customMatcher: () => false,
    });
  });

  it('should return an empty object when details is empty, null or undefined', () => {
    expect(generateHistoryEventDetails({ details: {} })).toEqual([]);
    // @ts-expect-error testing null
    expect(generateHistoryEventDetails({ details: null })).toEqual([]);
    // @ts-expect-error testing undefined
    expect(generateHistoryEventDetails({ details: undefined })).toEqual([]);
  });

  it('should group nested object details correctly', () => {
    const details = {
      event1: {
        subEvent1: { data: 'value1' },
        subEvent2: { data: 'value2' },
      },
      event2: 'value3',
    };

    const expected = [
      {
        groupEntries: [
          {
            isGroup: false,
            key: 'data',
            path: 'event1.subEvent1.data',
            renderConfig: { name: 'Mock render config' },
            value: 'value1',
          },
          {
            isGroup: false,
            key: 'data',
            path: 'event1.subEvent2.data',
            renderConfig: { name: 'Mock render config' },
            value: 'value2',
          },
        ],
        isGroup: true,
        key: 'event1',
        path: 'event1',
        renderConfig: { name: 'Mock render config' },
      },
      {
        isGroup: false,
        key: 'event2',
        path: 'event2',
        renderConfig: { name: 'Mock render config' },
        value: 'value3',
      },
    ];

    const result = generateHistoryEventDetails({ details });
    expect(result).toMatchObject(expected);
  });

  it('should group array details correctly', () => {
    const details = {
      metadata: {
        events: ['event1', 'event2', 'event3'],
      },
    };

    // TODO @adhitya.mamallan - we may need to revisit how we handle arrays
    const expected = [
      {
        groupEntries: [
          {
            isGroup: false,
            key: '0',
            path: 'metadata.events.0',
            renderConfig: { name: 'Mock render config' },
            value: 'event1',
          },
          {
            isGroup: false,
            key: '1',
            path: 'metadata.events.1',
            renderConfig: { name: 'Mock render config' },
            value: 'event2',
          },
          {
            isGroup: false,
            key: '2',
            path: 'metadata.events.2',
            renderConfig: { name: 'Mock render config' },
            value: 'event3',
          },
        ],
        isGroup: true,
        key: 'events',
        path: 'metadata.events',
        renderConfig: { name: 'Mock render config' },
      },
    ];

    const result = generateHistoryEventDetails({ details });
    expect(result).toMatchObject(expected);
  });

  it('should handle single nested object correctly', () => {
    const details = {
      event1: {
        subEvent1: {
          subSubEvent1: 'value1',
        },
      },
    };

    const expected = [
      {
        isGroup: false,
        key: 'subSubEvent1',
        path: 'event1.subEvent1.subSubEvent1',
        renderConfig: { name: 'Mock render config' },
        value: 'value1',
      },
    ];

    const result = generateHistoryEventDetails({ details });
    expect(result).toMatchObject(expected);
  });

  it('should respect renderConfig hide function', () => {
    mockedGetHistoryEventFieldRenderConfig.mockReturnValue({
      name: 'Mock render config that always matches and hides',
      customMatcher: () => true,
      hide: () => true,
    });

    const details = {
      event1: 'value1',
    };

    const result = generateHistoryEventDetails({ details });
    expect(result).toEqual([]);
  });

  it('should leave the object untouched if renderConfig has a value component', () => {
    mockedGetHistoryEventFieldRenderConfig.mockReturnValue({
      name: 'Mock render config with value component that always matches',
      customMatcher: () => true,
      valueComponent: (args: any) => createElement('div', {}, args),
    });

    const details = {
      event1: {
        subEvent1: {
          subSubEvent1: 'value1',
        },
      },
    };

    const expected = [
      {
        isGroup: false,
        key: 'event1',
        path: 'event1',
        renderConfig: {
          name: 'Mock render config with value component that always matches',
        },
        value: { subEvent1: { subSubEvent1: 'value1' } },
      },
    ];

    const result = generateHistoryEventDetails({ details });
    expect(result).toMatchObject(expected);
  });

  it('should mark fields as negative when they are in negativeFields array', () => {
    const details = {
      reason: 'error reason',
      details: 'error details',
      success: 'success value',
    };

    const negativeFields = ['reason', 'details'];

    const result = generateHistoryEventDetails({ details, negativeFields });

    expect(result).toHaveLength(3);

    const reasonEntry = result.find((entry) => entry.path === 'reason');
    const detailsEntry = result.find((entry) => entry.path === 'details');
    const successEntry = result.find((entry) => entry.path === 'success');

    expect(reasonEntry?.isNegative).toBe(true);
    expect(detailsEntry?.isNegative).toBe(true);
    expect(successEntry?.isNegative).toBeUndefined();
  });

  it('should mark nested fields as negative when their full path is in negativeFields array', () => {
    const details = {
      error: {
        reason: 'nested error reason',
        details: 'nested error details',
      },
      success: 'success value',
    };

    const negativeFields = ['error.reason', 'error.details'];

    const result = generateHistoryEventDetails({ details, negativeFields });

    expect(result).toHaveLength(2);

    const errorGroup = result.find((entry) => entry.path === 'error');
    expect(errorGroup?.isGroup).toBe(true);
    expect((errorGroup as any)?.groupEntries).toHaveLength(2);

    const reasonEntry = (errorGroup as any)?.groupEntries?.find(
      (entry: any) => entry.path === 'error.reason'
    );
    const detailsEntry = (errorGroup as any)?.groupEntries?.find(
      (entry: any) => entry.path === 'error.details'
    );

    expect(reasonEntry?.isNegative).toBe(true);
    expect(detailsEntry?.isNegative).toBe(true);
  });

  it('should not mark any fields as negative when negativeFields is not provided', () => {
    const details = {
      reason: 'error reason',
      details: 'error details',
    };

    const result = generateHistoryEventDetails({ details });

    expect(result).toHaveLength(2);

    result.forEach((entry) => {
      expect(entry.isNegative).toBeUndefined();
    });
  });

  it('should not mark any fields as negative when negativeFields is empty', () => {
    const details = {
      reason: 'error reason',
      details: 'error details',
    };

    const negativeFields: string[] = [];

    const result = generateHistoryEventDetails({ details, negativeFields });

    expect(result).toHaveLength(2);

    result.forEach((entry) => {
      expect(entry.isNegative).toBeUndefined();
    });
  });

  it('should pass negativeFields to recursive calls for nested objects', () => {
    const details = {
      error: {
        reason: 'nested error reason',
        cause: 'nested error cause',
      },
      success: 'success value',
    };

    const negativeFields = ['error.reason'];

    const result = generateHistoryEventDetails({ details, negativeFields });

    expect(result).toHaveLength(2);

    const errorGroup = result.find((entry) => entry.path === 'error');
    expect(errorGroup).toBeDefined();
    expect(errorGroup?.isGroup).toBe(true);
    expect((errorGroup as any)?.groupEntries).toHaveLength(2);

    const reasonEntry = (errorGroup as any)?.groupEntries?.[0];
    expect(reasonEntry?.isNegative).toBe(true);
  });

  it('should handle single nested object with negative fields correctly', () => {
    const details = {
      error: {
        reason: 'nested error reason',
      },
    };

    const negativeFields = ['error.reason'];

    const result = generateHistoryEventDetails({ details, negativeFields });

    expect(result).toHaveLength(1);

    const reasonEntry = result[0];
    expect(reasonEntry.path).toBe('error.reason');
    expect(reasonEntry.isNegative).toBe(true);
  });
});
