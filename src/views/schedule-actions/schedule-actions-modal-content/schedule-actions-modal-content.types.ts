import { type DefaultValues } from 'react-hook-form';

import {
  type ScheduleAction,
  type ScheduleActionInputParams,
} from '../schedule-actions.types';

export type Props<Result, FormData, SubmissionData> = {
  action: ScheduleAction<Result, FormData, SubmissionData>;
  params: ScheduleActionInputParams;
  onCloseModal: () => void;
  initialFormValues?: DefaultValues<FormData>;
};
