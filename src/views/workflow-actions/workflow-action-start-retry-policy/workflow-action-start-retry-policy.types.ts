import { type SubFormProps } from '../workflow-action-start-form/workflow-action-start-form.types';

export type Props = SubFormProps & {
  /** When false, omits the left indent border (e.g. nested horizontal form layouts). */
  showSectionBorder?: boolean;
};
