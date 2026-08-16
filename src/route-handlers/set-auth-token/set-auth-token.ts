import { type NextRequest, NextResponse } from 'next/server';

import {
  AUTH_COOKIE_OPTIONS,
  CADENCE_AUTH_COOKIE_NAME,
  NO_STORE_HEADERS,
} from '@/utils/auth/auth.constants';
import getCookieSecureAttribute from '@/utils/auth/helpers/get-cookie-secure-attribute';
import isSameOriginRequest from '@/utils/auth/helpers/is-same-origin-request';

import tokenRequestBodySchema from './schemas/token-request-body-schema';

const badRequest = (message: string) =>
  NextResponse.json({ message }, { status: 400, headers: NO_STORE_HEADERS });

export async function setAuthToken(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json(
      { message: 'Cross-origin request rejected' },
      { status: 403, headers: NO_STORE_HEADERS }
    );
  }

  try {
    const requestBody = await request.json();
    const { data, error } = tokenRequestBodySchema.safeParse(requestBody);

    if (error) {
      return badRequest(error.errors[0]?.message ?? 'Invalid request');
    }

    const response = NextResponse.json(
      { ok: true },
      { headers: NO_STORE_HEADERS }
    );
    response.cookies.set(CADENCE_AUTH_COOKIE_NAME, data.token, {
      ...AUTH_COOKIE_OPTIONS,
      secure: getCookieSecureAttribute(request),
    });
    return response;
  } catch {
    return badRequest('Invalid request body');
  }
}
