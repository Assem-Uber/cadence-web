import { type DomainDescription } from '../domain-page.types';

export const mockDomainDescription: DomainDescription = {
  activeClusterName: 'cluster_1',
  clusters: [{ clusterName: 'cluster_1' }, { clusterName: 'cluster_2' }],
  data: { Tier: '5', IsManagedByCadence: 'true' },
  id: 'mock-domain-staging-uuid',
  name: 'mock-domain-staging',
  status: 'DOMAIN_STATUS_REGISTERED',
  description: 'This is a mock domain used for test fixtures',
  ownerEmail: 'mockdomainowner@gmail.com',
  isGlobalDomain: true,
  activeClusters: null,
  badBinaries: null,
  asyncWorkflowConfig: null,
  historyArchivalStatus: 'ARCHIVAL_STATUS_DISABLED',
  failoverInfo: null,
  isolationGroups: null,
  visibilityArchivalStatus: 'ARCHIVAL_STATUS_DISABLED',
  visibilityArchivalUri: '',
  workflowExecutionRetentionPeriod: {
    seconds: '86400',
    nanos: 0,
  },
  historyArchivalUri: '',
  failoverVersion: '123456',
};

export const mockDomainDescriptionSingleCluster: DomainDescription = {
  activeClusterName: 'cluster_1',
  clusters: [{ clusterName: 'cluster_1' }],
  data: { Tier: '5', IsManagedByCadence: 'true' },
  id: 'mock-domain-staging-single-uuid',
  name: 'mock-domain-staging-single',
  status: 'DOMAIN_STATUS_REGISTERED',
  description:
    'This is a mock domain with single cluster used for test fixtures',
  ownerEmail: 'mockdomainowner@gmail.com',
  isGlobalDomain: true,
  activeClusters: null,
  badBinaries: null,
  asyncWorkflowConfig: null,
  historyArchivalStatus: 'ARCHIVAL_STATUS_DISABLED',
  failoverInfo: null,
  isolationGroups: null,
  visibilityArchivalStatus: 'ARCHIVAL_STATUS_DISABLED',
  visibilityArchivalUri: '',
  workflowExecutionRetentionPeriod: {
    seconds: '86400',
    nanos: 0,
  },
  historyArchivalUri: '',
  failoverVersion: '123456',
};
