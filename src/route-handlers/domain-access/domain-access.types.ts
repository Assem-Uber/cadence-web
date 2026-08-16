import { type DefaultMiddlewaresContext } from '@/utils/route-handlers-middleware';

export type RouteParams = {
  domain: string;
  cluster: string;
};

export type RequestParams = {
  params: RouteParams;
};

export type Context = DefaultMiddlewaresContext;

export type DomainAccessResponse = {
  canRead: boolean;
  canWrite: boolean;
  isAdmin: boolean;
  /** Optional deep link to the tool where users can request/modify their groups. */
  userGroupsModifyUrl?: string;
};
