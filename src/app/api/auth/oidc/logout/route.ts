import { type NextRequest } from 'next/server';

import {
  handleOidcLogout,
  handleOidcLogoutRedirect,
} from '@/route-handlers/oidc-logout/oidc-logout';

export async function GET(request: NextRequest) {
  return handleOidcLogoutRedirect(request);
}

export async function DELETE(request: NextRequest) {
  return handleOidcLogout(request);
}
