export type RequestOptions = RequestInit & {
  omitUserHeaders?: boolean;
  skipAuthRecovery?: boolean;
  _authRetried?: boolean;
};
