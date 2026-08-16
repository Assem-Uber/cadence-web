import { type NextRequest } from 'next/server';

import { clearAuthToken } from '@/route-handlers/clear-auth-token/clear-auth-token';
import { setAuthToken } from '@/route-handlers/set-auth-token/set-auth-token';

export async function POST(request: NextRequest) {
  return setAuthToken(request);
}

export async function DELETE(request: NextRequest) {
  return clearAuthToken(request);
}
