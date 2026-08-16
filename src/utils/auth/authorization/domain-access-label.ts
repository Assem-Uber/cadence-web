import { type DomainAccess } from '../auth.types';

export default function getDomainAccessLabel(
  access: DomainAccess & { isAdmin?: boolean },
  authEnabled: boolean
): string {
  if (!authEnabled) {
    return 'Open';
  }
  if (access.isAdmin) {
    return 'Admin';
  }
  if (access.canWrite) {
    return 'Read & write';
  }
  if (access.canRead) {
    return 'Read only';
  }
  return 'No access';
}
