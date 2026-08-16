import { type DomainAccessResponse } from '@/route-handlers/domain-access/domain-access.types';
import request from '@/utils/request';

import {
  AUTHORIZED_SCHEDULE_ACTIONS_CONFIG,
  DEFAULT_DISABLED_SCHEDULE_ACTIONS_CONFIG,
  UNAUTHORIZED_SCHEDULE_ACTIONS_CONFIG,
} from './schedule-actions-enabled.constants';
import {
  type ScheduleActionsEnabledConfig,
  type ScheduleActionsEnabledResolverParams,
} from './schedule-actions-enabled.types';

/**
 * Override this resolver if you have different
 * requirements for enabling/disabling schedule actions.
 *
 * All schedule actions are enabled by default for users with write access to the domain.
 * Domain access is resolved via the domain access API
 * (GET /api/domains/[domain]/[cluster]/access).
 */
export default async function scheduleActionsEnabled(
  params: ScheduleActionsEnabledResolverParams
): Promise<ScheduleActionsEnabledConfig> {
  try {
    const access: DomainAccessResponse = await request(
      `/api/domains/${encodeURIComponent(params.domain)}/${encodeURIComponent(params.cluster)}/access`
    ).then((res) => res.json());
    if (!access.canWrite) {
      return UNAUTHORIZED_SCHEDULE_ACTIONS_CONFIG;
    }

    return AUTHORIZED_SCHEDULE_ACTIONS_CONFIG;
  } catch {
    return DEFAULT_DISABLED_SCHEDULE_ACTIONS_CONFIG;
  }
}
