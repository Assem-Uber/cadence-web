import { type DefaultMiddlewaresContext } from '@/utils/route-handlers-middleware';

export type RouteParams = {
  domain: string;
  cluster: string;
};

export type RequestParams = {
  params: RouteParams;
};

export type Context = DefaultMiddlewaresContext;

export type DomainAccessGroupsResponse = {
  readGroups: string[];
  writeGroups: string[];
  /** Optional deep link to the tool where domain allowed groups are managed. */
  domainGroupsModifyUrl?: string;
};
