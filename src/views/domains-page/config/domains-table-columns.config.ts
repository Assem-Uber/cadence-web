import { type TableConfig } from '@/components/table/table.types';

import { type DomainData } from '../domains-page.types';
import DomainsTableClusterCell from '../domains-table-cluster-cell/domains-table-cluster-cell';
import DomainsTableDomainNameCell from '../domains-table-domain-name-cell/domains-table-domain-name-cell';

// Per-domain access is intentionally not shown here: resolving it for every
// row would require one permissions lookup per domain. Access is surfaced on
// the domain page instead (see GET /api/domains/[domain]/[cluster]/access).
const domainsTableColumnsConfig = [
  {
    name: 'Domain Name',
    id: 'name',
    renderCell: DomainsTableDomainNameCell,
    width: '60%',
    sortable: true,
  },
  {
    name: 'Cluster',
    id: 'cluster',
    renderCell: DomainsTableClusterCell,
    width: '40%',
  },
] as const satisfies TableConfig<DomainData>;

export default domainsTableColumnsConfig;
