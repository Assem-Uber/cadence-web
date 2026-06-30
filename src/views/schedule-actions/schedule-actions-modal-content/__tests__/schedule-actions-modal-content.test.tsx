import { HttpResponse } from 'msw';

import { render, screen, userEvent, waitFor } from '@/test-utils/rtl';

import { type PauseScheduleResponse } from '@/route-handlers/pause-schedule/pause-schedule.types';
import { type DeleteScheduleResponse } from '@/route-handlers/delete-schedule/delete-schedule.types';

import { mockScheduleActionsConfig } from '../../__fixtures__/schedule-actions-config';
import { type ScheduleAction } from '../../schedule-actions.types';
import ScheduleActionsModalContent from '../schedule-actions-modal-content';

const mockScheduleParams = {
  domain: 'mock-domain',
  cluster: 'mock-cluster',
  scheduleId: 'mock-schedule-id',
};

const mockEnqueue = jest.fn();
const mockDequeue = jest.fn();
jest.mock('baseui/snackbar', () => ({
  ...jest.requireActual('baseui/snackbar'),
  useSnackbar: () => ({
    enqueue: mockEnqueue,
    dequeue: mockDequeue,
  }),
}));

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  ...jest.requireActual('next/navigation'),
  useRouter: () => ({ push: mockPush }),
}));

describe(ScheduleActionsModalContent.name, () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the modal content as expected', async () => {
    setup({});

    expect(await screen.findAllByText('Mock pause schedule')).toHaveLength(2);
    expect(
      screen.getByText('Mock modal text to pause a schedule')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Mock pause schedule' })
    ).toBeInTheDocument();
  });

  it('calls onCloseModal when the Cancel button is clicked', async () => {
    const { user, mockOnClose } = setup({});

    await user.click(await screen.findByText('Cancel'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls pause API, sends toast, and closes modal when confirmed', async () => {
    const { user, mockOnClose, getLatestRequestBody, waitForRequest } =
      setup({});

    await user.click(
      await screen.findByRole('button', { name: 'Mock pause schedule' })
    );

    await waitForRequest();
    expect(getLatestRequestBody()).toEqual({ reason: 'Mock pause reason' });

    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Mock pause notification',
        })
      );
    });
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('displays banner when the action fails', async () => {
    const { user, mockOnClose } = setup({ error: true });

    await user.click(
      await screen.findByRole('button', { name: 'Mock pause schedule' })
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to pause schedule')).toBeInTheDocument();
    });
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  describe('delete action', () => {
    it('renders confirmation copy with no form inputs', () => {
      setup({ actionConfig: mockScheduleActionsConfig[2] });

      expect(screen.getAllByText('Delete schedule').length).toBeGreaterThan(
        0
      );
      expect(
        screen.getByText(
          'Deletes the schedule permanently. In-progress workflow runs are not affected.'
        )
      ).toBeInTheDocument();
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });

    it('closes without POST when Cancel is clicked', async () => {
      const { user, mockOnClose } = setup({
        actionConfig: mockScheduleActionsConfig[2],
      });

      await user.click(screen.getByText('Cancel'));
      expect(mockOnClose).toHaveBeenCalled();
      expect(mockEnqueue).not.toHaveBeenCalled();
    });

    it('POSTs with empty body, navigates to list, and shows snackbar on success', async () => {
      const { user, mockOnClose, getLatestRequestBody, waitForRequest } =
        setup({ actionConfig: mockScheduleActionsConfig[2] });

      await user.click(
        screen.getByRole('button', { name: 'Delete schedule' })
      );

      await waitForRequest();
      expect(getLatestRequestBody()).toEqual({});

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(
          '/domains/mock-domain/mock-cluster/schedules'
        );
      });
      expect(mockEnqueue).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Schedule deleted.' })
      );
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});

function setup({
  error,
  actionConfig,
}: {
  error?: boolean;
  actionConfig?: ScheduleAction<any, any, any>;
}) {
  const user = userEvent.setup();
  const mockOnClose = jest.fn();
  let latestRequestBody: unknown = null;
  let requestPromiseResolve: (value: unknown) => void = () => undefined;
  const requestPromise = new Promise((resolve) => {
    requestPromiseResolve = resolve;
  });

  render(
    <ScheduleActionsModalContent
      action={actionConfig ?? mockScheduleActionsConfig[0]}
      params={{ ...mockScheduleParams }}
      onCloseModal={mockOnClose}
    />,
    {
      endpointsMocks: [
        {
          path: '/api/domains/:domain/:cluster/schedules/:scheduleId/:action',
          httpMethod: 'POST',
          mockOnce: false,
          httpResolver: async ({ request }) => {
            const text = await request.text();
            latestRequestBody = text ? JSON.parse(text) : null;
            requestPromiseResolve(null);

            if (error) {
              return HttpResponse.json(
                { message: 'Failed to pause schedule' },
                { status: 500 }
              );
            }

            if (request.url.endsWith('/delete')) {
              return HttpResponse.json({} satisfies DeleteScheduleResponse);
            }

            return HttpResponse.json({} satisfies PauseScheduleResponse);
          },
        },
      ],
    }
  );

  return {
    user,
    mockOnClose,
    getLatestRequestBody: () => latestRequestBody,
    waitForRequest: () => requestPromise,
  };
}
