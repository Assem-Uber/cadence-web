import { type NextRequest, NextResponse } from 'next/server';

import { FULL_ACCESS, NO_ACCESS } from '@/utils/auth/auth.constants';
import { getDomainAccessForUser } from '@/utils/auth/authorization/domain-access';
import { getHTTPStatusCode, GRPCError } from '@/utils/grpc/grpc-error';
import logger, { type RouteHandlerErrorPayload } from '@/utils/logger';

import {
  type Context,
  type DomainAccessResponse,
  type RequestParams,
  type RouteParams,
} from './domain-access.types';

/**
 * GET /api/domains/[domain]/[cluster]/access
 *
 * TODO(cadence-backend): temporary web-side placeholder — this authorization
 * decision belongs to the backend auth provider; delegate once the Cadence
 * backend exposes a permissions API.
 *
 * Returns the current user's access to a domain. The default implementation
 * mirrors the Cadence OSS model: groups/admin claims from the auth session
 * matched against the domain's READ_GROUPS/WRITE_GROUPS metadata. Replace the
 * body of this handler to delegate to a Cadence backend API or an external
 * permissions provider (e.g. providers whose permissions are not embedded in
 * the token), and optionally return `userGroupsModifyUrl` to let users
 * request access.
 */
export async function getDomainAccess(
  _: NextRequest,
  requestParams: RequestParams,
  ctx: Context
) {
  const params = requestParams.params as RouteParams;
  const authInfo = ctx.authInfo;

  const respond = (response: DomainAccessResponse) =>
    NextResponse.json(response, {
      headers: { 'Cache-Control': 'no-store' },
    });

  if (!authInfo.authEnabled || authInfo.isAdmin) {
    return respond({ ...FULL_ACCESS, isAdmin: authInfo.isAdmin });
  }

  if (!authInfo.auth.isValidToken) {
    return respond({ ...NO_ACCESS, isAdmin: false });
  }

  try {
    const res = await ctx.grpcClusterMethods.describeDomain({
      name: params.domain,
    });

    if (!res.domain) {
      return respond({ ...NO_ACCESS, isAdmin: false });
    }

    return respond({
      ...getDomainAccessForUser(res.domain, authInfo),
      isAdmin: false,
    });
  } catch (e) {
    if (e instanceof GRPCError && getHTTPStatusCode(e) === 403) {
      return respond({ ...NO_ACCESS, isAdmin: false });
    }

    logger.error<RouteHandlerErrorPayload>(
      { requestParams: params, error: e },
      'Failed to resolve domain access'
    );

    return NextResponse.json(
      {
        message:
          e instanceof GRPCError
            ? e.message
            : 'Failed to resolve domain access',
        cause: e,
      },
      { status: getHTTPStatusCode(e) }
    );
  }
}
