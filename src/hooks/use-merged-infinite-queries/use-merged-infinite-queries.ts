import { useMemo, useState, useEffect, useCallback } from 'react';

import {
  InfiniteQueryObserver,
  type QueryKey,
  useQueryClient,
} from '@tanstack/react-query';

import mergeSortedArrays from '@/utils/merge-sorted-arrays';

import getMergedFetchNextPage from './helpers/get-merged-fetch-next-page';
import getMergedQueryStatus from './helpers/get-merged-query-status';
import { UseMergedInfiniteQueriesError } from './use-merged-infinite-queries-error';
import {
  type SingleInfiniteQueryResult,
  type MergedQueriesResults,
  type Props,
} from './use-merged-infinite-queries.types';

/**
 * Combines results from multiple infinite queries in sorted order.
 *
 * To ensure the order of the combined results remains consistent even after fetching additional data,
 * this hook requests extra data (page size * number of queries) from all queries. This ensures
 * no higher-priority items are missed when sorting, even if they appear in later pages of data.
 *
 * For instance, to show 5 items across 3 queries, it fetches 15 items.
 *
 * @param queries - Array of react-query Infinite Query configurations.
 * @param pageSize - Number of items to add to the result array when requesting new data.
 * @param flattenResponse - A function that takes the expected query response and flattens it into an array of items
 * @param compare - A comparison function used to determine the order of items. It should take two items and return:
 *   - A positive number (> 0) if the second item should come before the first.
 *   - Zero or a negative number (<= 0) if the first item should come before the second.
 *   - This logic must match the sorting logic used in the queries to ensure consistency.
 *   - For more details, see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#comparefn
 *
 * @returns A tuple [mergedQueryResults, queryResults]:
 *   - `mergedQueryResults`: The merged and sorted results from all queries.
 *   - `queryResults`: An array containing individual results from each query.
 */
export default function useMergedInfiniteQueries<
  TData,
  TResponse,
  TPageParam,
  TQueryKey extends QueryKey,
>({
  queries,
  pageSize,
  flattenResponse,
  compare,
}: Props<TData, TResponse, TPageParam, TQueryKey>): [
  MergedQueriesResults<TData>,
  Array<SingleInfiniteQueryResult<TResponse>>,
] {
  const [count, setCount] = useState(pageSize);

  const [queryResults, setQueryResults] = useState<
    Array<SingleInfiniteQueryResult<TResponse>>
  >([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    setCount(pageSize);
    const observers = (queries || []).map((q) => {
      return new InfiniteQueryObserver(queryClient, q);
    });

    setQueryResults(observers.map((ob) => ob.getCurrentResult()));

    const unsubscribes = observers.map((observer, index) =>
      observer.subscribe((result) => {
        setQueryResults((v) => {
          const newV = [...v];
          newV[index] = result;
          return newV;
        });
      })
    );
    return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
  }, [queries, queryClient, pageSize]);

  const flattenedDataArrays: Array<Array<TData>> = useMemo(() => {
    return queryResults.map((queryResult) => {
      if (!queryResult.data) return [];
      return queryResult.data.pages.flatMap((res) => flattenResponse(res));
    });
  }, [queryResults, flattenResponse]);

  const { pointers, sortedArray } = useMemo(() => {
    return mergeSortedArrays<TData>({
      sortedArrays: flattenedDataArrays,
      itemsCount: count,
      compareFunc: compare,
    });
  }, [flattenedDataArrays, count, compare]);

  const refetchQueriesWithError = useCallback(() => {
    queryResults.forEach((res) => {
      if (res.isError) {
        res.refetch();
      }
    });
  }, [queryResults]);

  const mergedQueryResults = {
    data: sortedArray,
    status: getMergedQueryStatus(queryResults),
    isLoading: queryResults.some((qr) => qr.isLoading),
    isFetching: queryResults.some((qr) => qr.isFetching),
    isFetchingNextPage: queryResults.some((qr) => qr.isFetchingNextPage),
    hasNextPage: queryResults.some((qr) => qr.hasNextPage),
    fetchNextPage: getMergedFetchNextPage({
      queryResults,
      flattenedDataArrays,
      pointers,
      pageSize,
      setCount,
    }),
    error: queryResults.some((qr) => qr.isError)
      ? new UseMergedInfiniteQueriesError(
          'One or more infinite queries failed',
          queryResults.reduce((errors: Array<Error>, qr) => {
            if (qr.isError) {
              errors.push(qr.error);
            }
            return errors;
          }, [])
        )
      : null,
    refetch: refetchQueriesWithError,
    // ...add other properties if needed
  };
  return [mergedQueryResults, queryResults];
}
