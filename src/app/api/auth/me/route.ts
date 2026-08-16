import { NextResponse, type NextRequest } from 'next/server';

import {
  getPublicAuthContext,
  resolveAuthContext,
} from '@/utils/auth/auth-context';
import getConfigValue from '@/utils/config/get-config-value';

export async function GET(request: NextRequest) {
  const [authContext, authStrategy] = await Promise.all([
    resolveAuthContext(request.cookies),
    getConfigValue('CADENCE_WEB_AUTH_STRATEGY'),
  ]);
  return NextResponse.json(
    { ...getPublicAuthContext(authContext), authStrategy },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
