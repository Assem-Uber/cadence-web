import { type NextRequest, NextResponse } from 'next/server';

import { resolveAuthContext } from '@/utils/auth/auth-context';

import { type UserInfoResponse } from './user-info.types';

/**
 * GET /api/auth/user
 *
 * TODO(cadence-backend): temporary web-side placeholder — user identity
 * should come from the backend auth provider once such an API exists.
 *
 * Returns display info for the current user. The default implementation
 * derives it from the auth session; replace the body of this handler to
 * source user info from the Cadence backend or an external identity
 * provider once such an API is available.
 */
export async function getUserInfo(request: NextRequest) {
  const authContext = await resolveAuthContext(request.cookies);

  const userInfo: UserInfoResponse = {
    id: authContext.id,
    userName: authContext.userName,
    pictureUrl: authContext.pictureUrl,
  };

  return NextResponse.json(userInfo, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
