export type UseUrlDraftWriteMode =
  | 'immediate'
  | 'manual'
  | { debounceMs: number };

export type UseUrlDraftParams = {
  // The URL-owned value for this input's key (from usePageQueryParams).
  committedValue: string;
  // The input's existing URL write. Also used to re-assert the last committed
  // value when the URL diverges while editing (never called with the draft).
  onCommit: (value: string) => void;
  // immediate: commit every edit. manual: never commit on edit (submit does).
  writeMode?: UseUrlDraftWriteMode;
};

export type UseUrlDraftResult = {
  draft: string;
  setDraft: (value: string) => void;
  focusProps: {
    onFocus: () => void;
    onBlur: () => void;
  };
};
