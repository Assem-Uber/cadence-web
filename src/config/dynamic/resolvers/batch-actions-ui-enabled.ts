import { type DomainAccessResponse } from '@/route-handlers/domain-access/domain-access.types';
import { resolveAuthContext } from '@/utils/auth/auth-context';
import request from '@/utils/request';

import { type BatchActionsUiEnabledResolverParams } from './batch-actions-ui-enabled.types';

/**
 * Returns whether the Batch Actions feature is enabled for the current user/domain.
 *
 * Controlled by the CADENCE_BATCH_ACTIONS_UI_ENABLED env variable:
 * - `ENABLED` — enabled for everyone.
 * - `ADMIN`   — enabled when auth is disabled, or for users with the global admin claim.
 * - `WRITE`   — enabled for users with write access to the domain.
 * - unset / any other value — disabled for everyone.
 *
 * For further customization, override the implementation of this resolver.
 *
 * @returns {Promise<boolean>} Whether the Batch Actions feature is enabled.
 */
export default async function batchActionsUiEnabled({
  domain,
  cluster,
}: BatchActionsUiEnabledResolverParams): Promise<boolean> {
  try {
    switch (process.env.CADENCE_BATCH_ACTIONS_UI_ENABLED) {
      case 'ENABLED':
        return true;
      case 'WRITE': {
        const access: DomainAccessResponse = await request(
          `/api/domains/${encodeURIComponent(domain)}/${encodeURIComponent(cluster)}/access`
        ).then((res) => res.json());
        return access.canWrite;
      }
      case 'ADMIN': {
        const authContext = await resolveAuthContext();
        return !authContext.authEnabled || authContext.isAdmin;
      }
      default:
        return false;
    }
  } catch {
    return false;
  }
}
