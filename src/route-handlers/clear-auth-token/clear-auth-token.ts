import { type NextRequest, NextResponse } from 'next/server';

import {
  AUTH_COOKIE_OPTIONS,
  CADENCE_AUTH_COOKIE_NAME,
  NO_STORE_HEADERS,
} from '@/utils/auth/auth.constants';
import getCookieSecureAttribute from '@/utils/auth/helpers/get-cookie-secure-attribute';

export async function clearAuthToken(request: NextRequest) {
  const response = NextResponse.json(
    { ok: true },
    { headers: NO_STORE_HEADERS }
  );
  response.cookies.set(CADENCE_AUTH_COOKIE_NAME, '', {
    ...AUTH_COOKIE_OPTIONS,
    secure: getCookieSecureAttribute(request),
    expires: new Date(0),
    maxAge: 0,
  });
  return response;
}
