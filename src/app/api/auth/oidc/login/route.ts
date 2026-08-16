import { type NextRequest } from 'next/server';

import { handleOidcLogin } from '@/route-handlers/oidc-login/oidc-login';

export async function GET(request: NextRequest) {
  return handleOidcLogin(request);
}
