'use client';
import React, { useContext, useMemo } from 'react';

import PageSection from '@/components/page-section/page-section';
import TableVirtualized from '@/components/table-virtualized/table-virtualized';
import usePageQueryParams from '@/hooks/use-page-query-params/use-page-query-params';
import sortBy, {
  type SortByReturnValue,
  toggleSortOrder,
  type SortOrder,
} from '@/utils/sort-by';

import domainsPageFiltersConfig from '../config/domains-page-filters.config';
import domainsPageQueryParamsConfig from '../config/domains-page-query-params.config';
import domainsTableColumnsConfig from '../config/domains-table-columns.config';
import { DomainsPageContext } from '../domains-page-context-provider/domains-page-context-provider';
import type { DomainData } from '../domains-page.types';

import { type Props } from './domains-table.types';

function DomainsTable({
  domains,
  tableColumns = domainsTableColumnsConfig,
}: Props) {
  const [queryParams, setQueryParams] = usePageQueryParams(
    domainsPageQueryParamsConfig,
    { pageRerender: false }
  );
  const pageCtx = useContext(DomainsPageContext);
  const filteredDomains = useMemo(() => {
    const lowerCaseSearch = queryParams.searchText?.toLowerCase();
    return domains.filter(
      (d) =>
        (!lowerCaseSearch ||
          d.id.toLowerCase() === lowerCaseSearch ||
          d.name.toLowerCase().includes(lowerCaseSearch)) &&
        domainsPageFiltersConfig.every((f) =>
          f.filterFunc(d, queryParams, pageCtx)
        )
    );
  }, [domains, queryParams, pageCtx]);
  const sortedDomains = useMemo(() => {
    if (!queryParams.sortColumn || !queryParams.sortOrder)
      return filteredDomains;
    return sortBy<DomainData>(
      filteredDomains,
      (d) => d[queryParams.sortColumn as keyof DomainData] as SortByReturnValue,
      queryParams.sortOrder
    );
  }, [filteredDomains, queryParams.sortColumn, queryParams.sortOrder]);

  return (
    <PageSection>
      <TableVirtualized
        useWindowScroll
        data={sortedDomains}
        columns={tableColumns}
        shouldShowResults={true}
        onSort={(columnID) =>
          setQueryParams({
            sortColumn: columnID,
            sortOrder: toggleSortOrder({
              currentSortColumn: queryParams.sortColumn,
              currentSortOrder: queryParams.sortOrder,
              newSortColumn: columnID,
            }),
          })
        }
        sortColumn={queryParams.sortColumn}
        sortOrder={queryParams.sortOrder as SortOrder}
        endMessageProps={{
          kind: 'infinite-scroll',
          hasData: sortedDomains.length > 0,
          hasNextPage: false,
          fetchNextPage: () => {},
          isFetchingNextPage: false,
          error: null,
        }}
      />
    </PageSection>
  );
}

export default DomainsTable;
