'use client';

import { useQuery } from '@tanstack/react-query';

import SectionLoadingIndicator from '@/components/section-loading-indicator/section-loading-indicator';
import { RequestError } from '@/utils/request/request-error';
import getDomainDescriptionQueryOptions from '@/views/shared/hooks/use-domain-description/get-domain-description-query-options';

import DomainPageErrorUnauthorized from '../domain-page-error-unauthorized/domain-page-error-unauthorized';

import { type Props } from './domain-page-access-gate.types';

export default function DomainPageAccessGate({
  domain,
  cluster,
  children,
}: Props) {
  const { isPending, isError, error } = useQuery({
    ...getDomainDescriptionQueryOptions({ domain, cluster }),
    retry: false,
  });

  if (isPending) {
    return <SectionLoadingIndicator />;
  }

  if (
    isError &&
    error instanceof RequestError &&
    (error.status === 401 || error.status === 403)
  ) {
    return <DomainPageErrorUnauthorized domain={domain} />;
  }

  if (isError) {
    throw error;
  }

  return children;
}
