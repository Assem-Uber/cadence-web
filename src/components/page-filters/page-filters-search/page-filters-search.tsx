import React, { useCallback } from 'react';

import { Search } from 'baseui/icon';
import { Input } from 'baseui/input';

import usePageQueryParams from '@/hooks/use-page-query-params/use-page-query-params';
import {
  type PageQueryParams,
  type PageQueryParamKeys,
  type PageQueryParamSetterValues,
} from '@/hooks/use-page-query-params/use-page-query-params.types';
import useUrlDraft from '@/hooks/use-url-draft/use-url-draft';

import { overrides } from './page-filters-search.styles';
import { type Props } from './page-filters-search.types';

export default function PageFiltersSearch<
  P extends PageQueryParams,
  K extends PageQueryParamKeys<P>,
>({
  pageQueryParamsConfig,
  searchQueryParamKey,
  searchPlaceholder,
  searchTrimRegExp = /^\s+/g,
  inputDebounceDurationMs,
}: Props<P, K>) {
  const [queryParams, setQueryParams] = usePageQueryParams(
    pageQueryParamsConfig,
    { replace: true }
  );

  const queryParamsSearch = queryParams[searchQueryParamKey];

  const setSearch = useCallback(
    (value: string) =>
      setQueryParams({ [searchQueryParamKey]: value } as Partial<
        PageQueryParamSetterValues<P>
      >),
    [searchQueryParamKey, setQueryParams]
  );

  const { draft, setDraft, focusProps } = useUrlDraft({
    committedValue: queryParamsSearch,
    onCommit: setSearch,
    writeMode: inputDebounceDurationMs
      ? { debounceMs: inputDebounceDurationMs }
      : 'immediate',
  });

  return (
    <Input
      value={draft}
      onChange={(event) => {
        setDraft(event.target.value.replaceAll(searchTrimRegExp, ''));
      }}
      {...focusProps}
      placeholder={searchPlaceholder}
      startEnhancer={() => <Search />}
      clearable
      clearOnEscape
      overrides={overrides.searchInput}
    />
  );
}
