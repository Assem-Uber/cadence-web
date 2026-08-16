'use client';

import { useSuspenseQueries } from '@tanstack/react-query';
import { StyledLink } from 'baseui/link';
import { Tag } from 'baseui/tag';

import { type DomainAccessResponse } from '@/route-handlers/domain-access/domain-access.types';
import { type DomainAccessGroupsResponse } from '@/route-handlers/domain-access-groups/domain-access-groups.types';
import { type PublicAuthContext } from '@/utils/auth/auth.types';
import getDomainAccessLabel from '@/utils/auth/authorization/domain-access-label';
import request from '@/utils/request';

import { overrides, styled } from './domain-page-metadata-auth.styles';
import { type Props } from './domain-page-metadata-auth.types';

function GroupTags({
  groups,
  emptyLabel,
}: {
  groups: string[];
  emptyLabel: string;
}) {
  if (groups.length === 0) {
    return <styled.EmptyText>{emptyLabel}</styled.EmptyText>;
  }

  return (
    <styled.TagList>
      {groups.map((group) => (
        <Tag key={group} closeable={false} overrides={overrides.groupTag}>
          {group}
        </Tag>
      ))}
    </styled.TagList>
  );
}

export default function DomainPageMetadataAuth({ domain, cluster }: Props) {
  const [{ data: authInfo }, { data: domainAccess }, { data: accessGroups }] =
    useSuspenseQueries({
      queries: [
        {
          queryKey: ['auth-me'],
          queryFn: () =>
            request('/api/auth/me').then(
              (res) => res.json() as Promise<PublicAuthContext>
            ),
        },
        {
          queryKey: ['domain-access', domain, cluster],
          queryFn: () =>
            request(
              `/api/domains/${encodeURIComponent(domain)}/${encodeURIComponent(cluster)}/access`
            ).then((res) => res.json() as Promise<DomainAccessResponse>),
        },
        {
          queryKey: ['domain-access-groups', domain, cluster],
          queryFn: () =>
            request(
              `/api/domains/${encodeURIComponent(domain)}/${encodeURIComponent(cluster)}/access-groups`
            ).then((res) => res.json() as Promise<DomainAccessGroupsResponse>),
        },
      ],
    });

  const yourAccess = getDomainAccessLabel(domainAccess, authInfo.authEnabled);

  return (
    <styled.Container>
      <styled.Section>
        <styled.SectionTitle>Your access</styled.SectionTitle>
        <Tag closeable={false} overrides={overrides.accessTag}>
          {yourAccess}
        </Tag>
        {domainAccess.userGroupsModifyUrl && (
          <StyledLink href={domainAccess.userGroupsModifyUrl} target="_blank">
            Manage your groups
          </StyledLink>
        )}
      </styled.Section>
      <styled.Section>
        <styled.SectionTitle>Read groups</styled.SectionTitle>
        <GroupTags
          groups={accessGroups.readGroups}
          emptyLabel="Any authenticated user"
        />
      </styled.Section>
      <styled.Section>
        <styled.SectionTitle>Write groups</styled.SectionTitle>
        <GroupTags
          groups={accessGroups.writeGroups}
          emptyLabel="Not restricted by group"
        />
      </styled.Section>
      {accessGroups.domainGroupsModifyUrl && (
        <styled.Section>
          <StyledLink href={accessGroups.domainGroupsModifyUrl} target="_blank">
            Manage domain groups
          </StyledLink>
        </styled.Section>
      )}
    </styled.Container>
  );
}
