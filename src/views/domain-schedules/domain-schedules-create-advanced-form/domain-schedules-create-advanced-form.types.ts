import {
  type Control,
  type UseFormClearErrors,
  type FieldErrors,
} from 'react-hook-form';

import { type DomainSchedulesCreateFormData } from '../domain-schedules-create-modal/domain-schedules-create-modal.types';

export type Props = {
  control: Control<DomainSchedulesCreateFormData>;
  clearErrors: UseFormClearErrors<DomainSchedulesCreateFormData>;
  fieldErrors: FieldErrors<DomainSchedulesCreateFormData>;
};
