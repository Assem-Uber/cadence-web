import { type DomainAccessResponse } from '@/route-handlers/domain-access/domain-access.types';
import request from '@/utils/request';

import {
  AUTHORIZED_WORKFLOW_ACTIONS_CONFIG,
  DEFAULT_DISABLED_WORKFLOW_ACTIONS_CONFIG,
  UNAUTHORIZED_WORKFLOW_ACTIONS_CONFIG,
} from './workflow-actions-enabled.constants';
import {
  type WorkflowActionsEnabledConfig,
  type WorkflowActionsEnabledResolverParams,
} from './workflow-actions-enabled.types';

/**
 * Override this resolver if you have different
 * requirements for enabling/disabling workflow actions.
 *
 * All workflow actions are enabled by default for users with write access to the domain.
 * Domain access is resolved via the domain access API
 * (GET /api/domains/[domain]/[cluster]/access).
 */
export default async function workflowActionsEnabled(
  params: WorkflowActionsEnabledResolverParams
): Promise<WorkflowActionsEnabledConfig> {
  try {
    const access: DomainAccessResponse = await request(
      `/api/domains/${encodeURIComponent(params.domain)}/${encodeURIComponent(params.cluster)}/access`
    ).then((res) => res.json());
    if (!access.canWrite) {
      return UNAUTHORIZED_WORKFLOW_ACTIONS_CONFIG;
    }

    return AUTHORIZED_WORKFLOW_ACTIONS_CONFIG;
  } catch {
    return DEFAULT_DISABLED_WORKFLOW_ACTIONS_CONFIG;
  }
}
