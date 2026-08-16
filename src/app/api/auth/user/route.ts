import { type NextRequest } from 'next/server';

import { getUserInfo } from '@/route-handlers/user-info/get-user-info';

export async function GET(request: NextRequest) {
  return getUserInfo(request);
}
