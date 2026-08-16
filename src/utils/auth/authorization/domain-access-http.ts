import { NextResponse } from 'next/server';

import { type Domain } from '@/__generated__/proto-ts/uber/cadence/api/v1/Domain';

import { type PrivateAuthContext } from '../auth.types';

import { getDomainAccessForUser } from './domain-access';

export function getDomainReadAccessDeniedResponse(
  domain: Domain,
  authContext: PrivateAuthContext
): NextResponse | null {
  if (!authContext.authEnabled || authContext.isAdmin) {
    return null;
  }

  if (!authContext.auth.isValidToken) {
    return NextResponse.json(
      { message: 'Authentication required' },
      { status: 401 }
    );
  }

  const access = getDomainAccessForUser(domain, authContext);
  if (!access.canRead) {
    return NextResponse.json({ message: 'Access denied' }, { status: 403 });
  }

  return null;
}
