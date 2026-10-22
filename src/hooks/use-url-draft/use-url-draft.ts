import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import debounce from 'lodash/debounce';

import {
  type UseUrlDraftParams,
  type UseUrlDraftResult,
} from './use-url-draft.types';

// Text draft owner for URL-backed inputs. While the input is edited, the draft
// never follows the URL (an effect-copy after a reverted URL write erases typed
// text — Next can revert a stale-router URL, see .agents gate evidence). The URL
// is repaired instead by re-asserting the last committed value. Back/Forward
// (popstate) always wins: the draft re-syncs and any pending commit is dropped.
export default function useUrlDraft({
  committedValue,
  onCommit,
  writeMode = 'immediate',
}: UseUrlDraftParams): UseUrlDraftResult {
  const [draft, setDraftState] = useState(committedValue);
  const editingRef = useRef(false);
  const lastCommittedRef = useRef(committedValue);
  const pendingYieldRef = useRef(false);

  // Call sites pass inline closures; refs keep identity changes from resetting
  // the debounce or re-firing the sync effect.
  const onCommitRef = useRef(onCommit);
  onCommitRef.current = onCommit;
  const commitStable = useCallback((value: string) => {
    onCommitRef.current(value);
  }, []);

  const debounceMs = typeof writeMode === 'object' ? writeMode.debounceMs : null;
  const commit = useMemo(
    () => (debounceMs ? debounce(commitStable, debounceMs) : commitStable),
    [commitStable, debounceMs]
  );
  const cancelPending = useCallback(() => {
    if ('cancel' in commit && typeof commit.cancel === 'function')
      commit.cancel();
  }, [commit]);

  // Drop a pending commit on unmount: flushing after a Back/Forward unmount
  // would write into the destination URL (the setter reads location at call time).
  useEffect(() => cancelPending, [cancelPending]);

  const setDraft = useCallback(
    (value: string) => {
      // A fresh edit supersedes any traversal yield that has not been consumed.
      pendingYieldRef.current = false;
      setDraftState(value);
      if (writeMode !== 'manual') commit(value);
    },
    [commit, writeMode]
  );

  useEffect(() => {
    const onPopstate = () => {
      cancelPending();
      pendingYieldRef.current = true;
    };
    window.addEventListener('popstate', onPopstate);
    return () => window.removeEventListener('popstate', onPopstate);
  }, [cancelPending]);

  useEffect(() => {
    if (pendingYieldRef.current) {
      pendingYieldRef.current = false;
      setDraftState(committedValue);
      lastCommittedRef.current = committedValue;
    } else if (!editingRef.current) {
      setDraftState(committedValue);
      lastCommittedRef.current = committedValue;
    } else if (committedValue !== lastCommittedRef.current) {
      // Revert or external same-key write while editing: repair the URL with
      // the last committed value. The ref stays put, so the repaired value
      // landing back does not re-fire.
      onCommitRef.current(lastCommittedRef.current);
    }
    // Sync is driven only by the URL-owned value; blur never triggers a copy.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [committedValue]);

  const onFocus = useCallback(() => {
    editingRef.current = true;
  }, []);
  const onBlur = useCallback(() => {
    editingRef.current = false;
    // Blur precedes click-driven exits; flush so the typed tail is not dropped.
    if ('flush' in commit && typeof commit.flush === 'function') commit.flush();
  }, [commit]);

  return { draft, setDraft, focusProps: { onFocus, onBlur } };
}
