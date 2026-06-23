import type { ReactNode } from 'react';

export type Props = {
  label: ReactNode;
  description?: ReactNode;
  /** When set, associates the left column with the control via `htmlFor` / `id`. */
  htmlFor?: string;
  /** Optional helper text below the control (right column). */
  hint?: ReactNode;
  error?: ReactNode;
  /** Removes row bottom margin when nested inside a dependency group wrapper. */
  grouped?: boolean;
  children: ReactNode;
};
