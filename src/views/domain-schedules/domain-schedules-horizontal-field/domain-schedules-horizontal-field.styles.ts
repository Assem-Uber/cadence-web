import { styled as createStyled, type Theme } from 'baseui';
import { type FormControlOverrides } from 'baseui/form-control';
import { type StyleObject } from 'styletron-react';

import type {
  StyletronCSSObject,
  StyletronCSSObjectOf,
} from '@/hooks/use-styletron-classes';

export const overrides = {
  horizontalFieldFormControl: {
    ControlContainer: {
      style: {
        marginBottom: 0,
      },
    },
  } satisfies FormControlOverrides,
};

export const styled = {
  FieldRow: createStyled(
    'div',
    ({ $theme }: { $theme: Theme }): StyleObject => ({
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: $theme.sizing.scale600,
      marginBottom: $theme.sizing.scale600,
    })
  ),
  FieldLabelColumn: createStyled(
    'div',
    ({ $theme }: { $theme: Theme }): StyleObject => ({
      flexBasis: '38%',
      flexGrow: 0,
      flexShrink: 0,
      maxWidth: '280px',
      paddingTop: $theme.sizing.scale100,
      paddingRight: $theme.sizing.scale400,
    })
  ),
  FieldControlColumn: createStyled(
    'div',
    (): StyleObject => ({
      flex: 1,
      minWidth: 0,
    })
  ),
  FieldLabel: createStyled(
    'label',
    ({ $theme }: { $theme: Theme }): StyleObject => ({
      ...$theme.typography.font250,
      color: $theme.colors.contentPrimary,
      display: 'block',
      width: '100%',
      padding: 0,
      margin: 0,
    })
  ),
  FieldLabelText: createStyled(
    'div',
    ({ $theme }: { $theme: Theme }): StyleObject => ({
      ...$theme.typography.font250,
      color: $theme.colors.contentPrimary,
      width: '100%',
    })
  ),
  FieldDescription: createStyled(
    'div',
    ({ $theme }: { $theme: Theme }): StyleObject => ({
      ...$theme.typography.font100,
      color: $theme.colors.contentTertiary,
      marginTop: $theme.sizing.scale200,
    })
  ),
  GroupedFields: createStyled(
    'div',
    ({ $theme }: { $theme: Theme }): StyleObject => ({
      display: 'flex',
      flexDirection: 'column',
      gap: $theme.sizing.scale400,
      marginBottom: $theme.sizing.scale600,
      borderLeft: `2px solid ${$theme.colors.borderOpaque}`,
      paddingLeft: $theme.sizing.scale600,
      // ponytail: wrapper controls child spacing instead of grouped prop.
      '> div': {
        marginBottom: 0,
      },
    })
  ),
};

const cssStylesObj = {
} satisfies StyletronCSSObject;

export const cssStyles: StyletronCSSObjectOf<typeof cssStylesObj> =
  cssStylesObj;
