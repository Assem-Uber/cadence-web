import { type DefaultValues } from 'react-hook-form';

import { type ScheduleAction } from '../schedule-actions.types';

export type Props<Result, FormData, SubmissionData> = {
  domain: string;
  cluster: string;
  scheduleId: string;
  action: ScheduleAction<Result, FormData, SubmissionData> | undefined;
  onClose: () => void;
  initialFormValues?: DefaultValues<FormData>;
};
