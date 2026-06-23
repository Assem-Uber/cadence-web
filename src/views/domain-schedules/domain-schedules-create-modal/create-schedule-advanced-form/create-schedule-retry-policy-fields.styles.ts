import { type Theme } from 'baseui';
import { type CheckboxOverrides } from 'baseui/checkbox';
import { type RadioOverrides } from 'baseui/radio';
import { type StyleObject } from 'styletron-react';

export const overrides = {
  enableRetryPolicyCheckbox: {
    Root: {
      style: (): StyleObject => ({
        alignItems: 'center',
      }),
    },
    Label: {
      style: ({ $theme }: { $theme: Theme }): StyleObject => ({
        ...$theme.typography.LabelSmall,
      }),
    },
  } satisfies CheckboxOverrides,
  limitRetriesRadio: {
    Label: {
      style: ({ $theme }: { $theme: Theme }): StyleObject => ({
        ...$theme.typography.LabelSmall,
      }),
    },
  } satisfies RadioOverrides,
};
