import { Modal } from 'baseui/modal';

import ScheduleActionsModalContent from '../schedule-actions-modal-content/schedule-actions-modal-content';

import { overrides } from './schedule-actions-modal.styles';
import { type Props } from './schedule-actions-modal.types';

export default function ScheduleActionsModal<Result, FormData, SubmissionData>({
  action,
  onClose,
  initialFormValues,
  ...scheduleDetailsParams
}: Props<Result, FormData, SubmissionData>) {
  return (
    <Modal
      isOpen={Boolean(action)}
      onClose={onClose}
      closeable
      overrides={overrides.modal}
    >
      {action && (
        <ScheduleActionsModalContent
          action={action}
          params={{
            ...scheduleDetailsParams,
          }}
          initialFormValues={initialFormValues}
          onCloseModal={onClose}
        />
      )}
    </Modal>
  );
}
