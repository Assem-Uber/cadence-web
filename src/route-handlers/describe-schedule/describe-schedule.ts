import { type NextRequest, NextResponse } from 'next/server';

import { getHTTPStatusCode, GRPCError } from '@/utils/grpc/grpc-error';
import logger, { type RouteHandlerErrorPayload } from '@/utils/logger';

import { type Context, type RequestParams, type RouteParams } from './describe-schedule.types';

export async function describeSchedule(
  _request: NextRequest,
  requestParams: RequestParams,
  ctx: Context
) {
  const params = requestParams.params as RouteParams;

  try {
    const response = await ctx.grpcClusterMethods.describeSchedule({
      domain: params.domain,
      scheduleId: params.scheduleId,
    });

    return NextResponse.json(response);
  } catch (e) {
    logger.error<RouteHandlerErrorPayload>(
      { requestParams: params, error: e },
      'Error describing schedule' +
        (e instanceof GRPCError ? ': ' + e.message : '')
    );

    return NextResponse.json(
      {
        message:
          e instanceof GRPCError ? e.message : 'Error describing schedule',
        cause: e,
      },
      {
        status: getHTTPStatusCode(e),
      }
    );
  }
}
