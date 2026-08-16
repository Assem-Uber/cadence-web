import { type NextRequest, NextResponse } from 'next/server';

import { getDomainReadAccessDeniedResponse } from '@/utils/auth/authorization/domain-access-http';
import { splitGroupList } from '@/utils/auth/authorization/split-group-list';
import { getHTTPStatusCode, GRPCError } from '@/utils/grpc/grpc-error';
import logger, { type RouteHandlerErrorPayload } from '@/utils/logger';

import {
  type Context,
  type DomainAccessGroupsResponse,
  type RequestParams,
  type RouteParams,
} from './domain-access-groups.types';

/**
 * GET /api/domains/[domain]/[cluster]/access-groups
 *
 * TODO(cadence-backend): temporary web-side placeholder — allowed groups are
 * an auth-provider concern; delegate once the Cadence backend exposes them.
 *
 * Returns the groups allowed to read/write a domain, for display purposes.
 * The default implementation reads READ_GROUPS/WRITE_GROUPS from the domain
 * metadata. Replace the body of this handler if allowed groups live elsewhere
 * (e.g. a Cadence backend API or an external permissions provider), and
 * optionally return `domainGroupsModifyUrl` pointing at the tool where they
 * are managed.
 */
export async function getDomainAccessGroups(
  _: NextRequest,
  requestParams: RequestParams,
  ctx: Context
) {
  const params = requestParams.params as RouteParams;

  try {
    const res = await ctx.grpcClusterMethods.describeDomain({
      name: params.domain,
    });

    if (!res.domain) {
      return NextResponse.json(
        { message: 'Domain not found' },
        { status: 404 }
      );
    }

    const accessDeniedResponse = getDomainReadAccessDeniedResponse(
      res.domain,
      ctx.authInfo
    );
    if (accessDeniedResponse) {
      return accessDeniedResponse;
    }

    const response: DomainAccessGroupsResponse = {
      readGroups: splitGroupList(res.domain.data?.READ_GROUPS ?? ''),
      writeGroups: splitGroupList(res.domain.data?.WRITE_GROUPS ?? ''),
    };

    return NextResponse.json(response, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (e) {
    logger.error<RouteHandlerErrorPayload>(
      { requestParams: params, error: e },
      'Failed to fetch domain access groups'
    );

    return NextResponse.json(
      {
        message:
          e instanceof GRPCError
            ? e.message
            : 'Failed to fetch domain access groups',
        cause: e,
      },
      { status: getHTTPStatusCode(e) }
    );
  }
}
