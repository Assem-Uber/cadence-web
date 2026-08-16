import { type NextRequest } from 'next/server';

import { handleOidcCallback } from '@/route-handlers/oidc-callback/oidc-callback';

export async function GET(request: NextRequest) {
  return handleOidcCallback(request);
}
