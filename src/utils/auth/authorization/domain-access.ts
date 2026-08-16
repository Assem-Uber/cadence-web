import { type Domain } from '@/__generated__/proto-ts/uber/cadence/api/v1/Domain';

import { FULL_ACCESS } from '../auth.constants';
import { type PrivateAuthContext, type DomainAccess } from '../auth.types';

import { splitGroupList } from './split-group-list';

/**
 * TODO(cadence-backend): temporary web-side mirror of the Cadence OSS
 * authorization model (READ_GROUPS/WRITE_GROUPS domain metadata matched
 * against token groups). Custom backend auth providers may use entirely
 * different rules; the backend remains the enforcement point and this
 * helper should be replaced by a backend permissions API when available.
 */
export const getDomainAccessForUser = (
  domain: Domain,
  authContext: PrivateAuthContext | null | undefined
): DomainAccess => {
  if (!authContext?.authEnabled || authContext.isAdmin) {
    return FULL_ACCESS;
  }

  const readGroups = splitGroupList(domain.data?.READ_GROUPS ?? '');
  const writeGroups = splitGroupList(domain.data?.WRITE_GROUPS ?? '');

  const userGroups = authContext.groups;
  if (readGroups.length === 0 && writeGroups.length === 0) {
    // No domain-level group metadata means the UI has no explicit restriction to enforce.
    // Allow the action path here and defer final authorization to the backend/external authorizer.
    return FULL_ACCESS;
  }

  const effectiveReadGroups = readGroups.length > 0 ? readGroups : writeGroups;
  const hasWriteGroup = writeGroups.some((g) => userGroups.includes(g));
  const hasReadGroup = effectiveReadGroups.some((g) => userGroups.includes(g));

  const canRead = hasReadGroup || hasWriteGroup;
  const canWrite = writeGroups.length > 0 ? hasWriteGroup : false;

  return {
    canRead,
    canWrite,
  };
};
