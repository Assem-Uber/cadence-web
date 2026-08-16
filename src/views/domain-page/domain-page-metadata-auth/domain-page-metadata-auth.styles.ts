import { styled as createStyled, type Theme } from 'baseui';
import { type StyleObject } from 'styletron-react';

export const styled = {
  Container: createStyled(
    'div',
    ({ $theme }: { $theme: Theme }): StyleObject => ({
      display: 'flex',
      flexDirection: 'column',
      gap: $theme.sizing.scale600,
      marginBottom: $theme.sizing.scale800,
    })
  ),
  Section: createStyled(
    'div',
    ({ $theme }: { $theme: Theme }): StyleObject => ({
      display: 'flex',
      flexDirection: 'column',
      gap: $theme.sizing.scale300,
    })
  ),
  SectionTitle: createStyled(
    'div',
    ({ $theme }: { $theme: Theme }): StyleObject => ({
      ...$theme.typography.LabelMedium,
      color: $theme.colors.contentPrimary,
    })
  ),
  TagList: createStyled(
    'div',
    ({ $theme }: { $theme: Theme }): StyleObject => ({
      display: 'flex',
      flexWrap: 'wrap',
      gap: $theme.sizing.scale300,
    })
  ),
  EmptyText: createStyled(
    'span',
    ({ $theme }: { $theme: Theme }): StyleObject => ({
      ...$theme.typography.ParagraphSmall,
      color: $theme.colors.contentSecondary,
    })
  ),
};

export const overrides = {
  accessTag: {
    Root: {
      style: (): StyleObject => ({
        marginRight: 0,
        marginBottom: 0,
      }),
    },
  },
  groupTag: {
    Root: {
      style: (): StyleObject => ({
        marginRight: 0,
        marginBottom: 0,
      }),
    },
  },
};
