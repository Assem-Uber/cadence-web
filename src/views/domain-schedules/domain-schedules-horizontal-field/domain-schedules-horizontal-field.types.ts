import type { ReactNode } from 'react';

export type Props = {
  label: ReactNode;
  description?: ReactNode;
  /** When set, associates the left column with the control via `htmlFor` / `id`. */
  htmlFor?: string;
  error?: ReactNode;
  children: ReactNode;
};

export type GroupedFieldsProps = {
  children: ReactNode;
};

export type Component = ((props: Props) => JSX.Element) & {
  GroupedFields: (props: GroupedFieldsProps) => JSX.Element;
};
