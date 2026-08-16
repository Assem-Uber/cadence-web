'use client';
import React from 'react';

import { useSuspenseQueries } from '@tanstack/react-query';
import dynamic from 'next/dynamic';

import { type DomainAccessResponse } from '@/route-handlers/domain-access/domain-access.types';
import { type PublicAuthContext } from '@/utils/auth/auth.types';
import request from '@/utils/request';
import { type DomainPageTabContentProps } from '@/views/domain-page/domain-page-content/domain-page-content.types';

import DomainWorkflowsClusterGate from './domain-workflows-cluster-gate/domain-workflows-cluster-gate';

const DomainWorkflowsBasic = dynamic(
  () => import('@/views/domain-workflows-basic/domain-workflows-basic')
);

export default function DomainWorkflows(props: DomainPageTabContentProps) {
  const [{ data: authInfo }, { data: domainAccess }] = useSuspenseQueries({
    queries: [
      {
        queryKey: ['auth-me'],
        queryFn: () =>
          request('/api/auth/me').then(
            (res) => res.json() as Promise<PublicAuthContext>
          ),
      },
      {
        queryKey: ['domain-access', props.domain, props.cluster],
        queryFn: () =>
          request(
            `/api/domains/${encodeURIComponent(props.domain)}/${encodeURIComponent(props.cluster)}/access`
          ).then((res) => res.json() as Promise<DomainAccessResponse>),
      },
    ],
  });

  // Non-admin authenticated users may not be allowed to call describeCluster,
  // so default them to the basic workflows view.
  // TODO: Revisit once https://github.com/cadence-workflow/cadence/issues/7784 is resolved.
  if (
    authInfo.authEnabled &&
    authInfo.auth.isValidToken &&
    !domainAccess.isAdmin
  ) {
    return (
      <DomainWorkflowsBasic domain={props.domain} cluster={props.cluster} />
    );
  }

  return <DomainWorkflowsClusterGate {...props} />;
}
