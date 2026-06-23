import { type RadioOverrides } from 'baseui/radio';
import { type Theme } from 'baseui';
import { type PanelOverrides } from 'baseui/accordion';
import { type TextareaOverrides } from 'baseui/textarea';
import { type StyleObject } from 'styletron-react';

import type {
  StyletronCSSObject,
  StyletronCSSObjectOf,
} from '@/hooks/use-styletron-classes';

export const overrides = {
  jsonInput: {
    Input: {
      style: ({ $theme }: { $theme: Theme }): StyleObject => ({
        ...$theme.typography.MonoParagraphSmall,
      }),
    },
  } satisfies TextareaOverrides,
  panel: {
    PanelContainer: {
      style: {
        borderWidth: '0',
      },
    },
    Content: {
      style: ({ $theme }: { $theme: Theme }): StyleObject => ({
        paddingTop: $theme.sizing.scale600,
        paddingBottom: 0,
        paddingLeft: 0,
        paddingRight: 0,
      }),
    },
  } satisfies PanelOverrides,
  catchUpPolicyRadio: {
    Label: {
      style: ({ $theme }: { $theme: Theme }): StyleObject => ({
        ...$theme.typography.LabelSmall,
      }),
    },
  } satisfies RadioOverrides,
};

const cssStylesObj = {
  toggleRow: () => ({
    display: 'flex',
    alignItems: 'center',
  }),
  divider: (theme: Theme) => ({
    flex: 1,
    height: '1px',
    backgroundColor: theme.colors.borderOpaque,
  }),
  schedulePeriodRow: (theme: Theme) => ({
    display: 'flex',
    flexDirection: 'row',
    gap: theme.sizing.scale400,
    width: '100%',
  }),
  schedulePeriodField: () => ({
    flex: 1,
    minWidth: 0,
  }),
  schedulePeriodLabel: (theme: Theme) => ({
    ...theme.typography.LabelSmall,
    color: theme.colors.contentPrimary,
    marginBottom: theme.sizing.scale200,
  }),
} satisfies StyletronCSSObject;

export const cssStyles: StyletronCSSObjectOf<typeof cssStylesObj> =
  cssStylesObj;
