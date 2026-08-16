'use client';

import ErrorPanel from '@/components/error-panel/error-panel';

import { type Props } from './domain-page-error-unauthorized.types';

export default function DomainPageErrorUnauthorized({ domain }: Props) {
  return (
    <ErrorPanel
      message={`Access denied for domain "${domain}"`}
      description="You do not have permission to view this domain. Contact your administrator to request access."
      actions={[
        {
          kind: 'link-internal',
          label: 'Go to domains',
          link: '/domains',
        },
      ]}
      omitLogging={true}
    />
  );
}
