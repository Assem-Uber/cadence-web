import { useCallback, useMemo } from 'react';

import useUrlDraft from '@/hooks/use-url-draft/use-url-draft';

import getAutocompleteSuggestions from '../helpers/get-autocomplete-suggestions';
import getUpdatedQueryTextWithSuggestion from '../helpers/get-updated-query-text-with-suggestion';

export default function useQueryTextWithAutocomplete({
  initialValue,
  onCommit,
}: {
  initialValue: string;
  onCommit: (value: string) => void;
}) {
  const {
    draft: queryText,
    setDraft: setQueryText,
    focusProps,
  } = useUrlDraft({
    committedValue: initialValue,
    onCommit,
    writeMode: 'manual',
  });

  const nextSuggestions = useMemo(
    () => (queryText ? getAutocompleteSuggestions(queryText) : []),
    [queryText]
  );

  const onSuggestionSelect = useCallback(
    (suggestion: string) => {
      setQueryText(getUpdatedQueryTextWithSuggestion(queryText, suggestion));
    },
    [queryText, setQueryText]
  );

  return {
    queryText,
    setQueryText,
    nextSuggestions,
    onSuggestionSelect,
    focusProps,
  };
}
