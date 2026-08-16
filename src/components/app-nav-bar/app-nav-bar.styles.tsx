import { type SnackbarElementOverrides } from 'baseui/snackbar';

import type {
  StyletronCSSObject,
  StyletronCSSObjectOf,
} from '@/hooks/use-styletron-classes';

const cssStylesObj = {
  titleIcon: {
    display: 'flex',
    height: '1em',
  },
  signOutLink: {
    color: 'inherit',
    textDecoration: 'none',
    cursor: 'pointer',
    ':hover': {
      textDecoration: 'underline',
    },
  },
} satisfies StyletronCSSObject;

export const cssStyles: StyletronCSSObjectOf<typeof cssStylesObj> =
  cssStylesObj;

export const overrides = {
  errorSnackbar: {
    Root: {
      style: {
        backgroundColor: '#c62828',
      },
    },
  } satisfies SnackbarElementOverrides,
  warningSnackbar: {
    Root: {
      style: {
        backgroundColor: '#996f00',
      },
    },
  } satisfies SnackbarElementOverrides,
};
