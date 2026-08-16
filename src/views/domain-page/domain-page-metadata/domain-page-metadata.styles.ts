import { styled as createStyled } from 'baseui';
import { type StyleObject } from 'styletron-react';

export const styled = {
  MetadataPageContainer: createStyled(
    'div',
    (): StyleObject => ({
      display: 'flex',
      flexDirection: 'column',
    })
  ),
};
