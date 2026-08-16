import { type NextRequest, NextResponse } from 'next/server';

import { getDomainReadAccessDeniedResponse } from '@/utils/auth/authorization/domain-access-http';
import { getHTTPStatusCode, GRPCError } from '@/utils/grpc/grpc-error';
import logger, { type RouteHandlerErrorPayload } from '@/utils/logger';

import {
  type Context,
  type RequestParams,
  type RouteParams,
} from './describe-domain.types';

export async function describeDomain(
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

    return NextResponse.json(res.domain);
  } catch (e) {
    logger.error<RouteHandlerErrorPayload>(
      { requestParams: params, error: e },
      'Error fetching domain info'
    );

    return NextResponse.json(
      {
        message:
          e instanceof GRPCError ? e.message : 'Error fetching domain info',
        cause: e,
      },
      { status: getHTTPStatusCode(e) }
    );
  }
}
