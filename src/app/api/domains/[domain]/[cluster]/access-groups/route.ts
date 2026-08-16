import { type NextRequest } from 'next/server';

import { getDomainAccessGroups } from '@/route-handlers/domain-access-groups/domain-access-groups';
import type { RouteParams } from '@/route-handlers/domain-access-groups/domain-access-groups.types';
import { routeHandlerWithMiddlewares } from '@/utils/route-handlers-middleware';
import routeHandlersDefaultMiddlewares from '@/utils/route-handlers-middleware/config/route-handlers-default-middlewares.config';

export async function GET(
  request: NextRequest,
  options: { params: RouteParams }
) {
  return routeHandlerWithMiddlewares(
    getDomainAccessGroups,
    request,
    options,
    routeHandlersDefaultMiddlewares
  );
}
