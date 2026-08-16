import { styled as createStyled, type Theme } from 'baseui';
import { type StyleObject } from 'styletron-react';

export const styled = {
  Page: createStyled(
    'div',
    ({ $theme }: { $theme: Theme }): StyleObject => ({
      maxWidth: '640px',
      margin: '0 auto',
      padding: $theme.sizing.scale800,
    })
  ),
  Title: createStyled(
    'h1',
    ({ $theme }: { $theme: Theme }): StyleObject => ({
      ...$theme.typography.HeadingMedium,
      marginBottom: $theme.sizing.scale300,
    })
  ),
  Description: createStyled(
    'p',
    ({ $theme }: { $theme: Theme }): StyleObject => ({
      ...$theme.typography.ParagraphMedium,
      color: $theme.colors.contentSecondary,
      marginBottom: $theme.sizing.scale800,
    })
  ),
  Actions: createStyled(
    'div',
    ({ $theme }: { $theme: Theme }): StyleObject => ({
      display: 'flex',
      justifyContent: 'flex-end',
      gap: $theme.sizing.scale300,
      marginTop: $theme.sizing.scale600,
    })
  ),
};
