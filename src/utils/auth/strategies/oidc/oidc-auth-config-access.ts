import 'server-only';

import { NextResponse } from 'next/server';

import { type OidcAuthConfig } from '@/config/dynamic/resolvers/oidc-auth-config.types';
import getConfigValue from '@/utils/config/get-config-value';

export async function getRequiredOidcAuthConfig(): Promise<OidcAuthConfig> {
  const strategy = await getConfigValue('CADENCE_WEB_AUTH_STRATEGY');
  const oidcConfig = await getConfigValue('OIDC_AUTH_CONFIG');

  if (strategy !== 'oidc' || !oidcConfig) {
    throw new OidcAuthNotEnabledError();
  }

  return oidcConfig;
}

export class OidcAuthNotEnabledError extends Error {
  constructor() {
    super('OIDC auth is not enabled');
    this.name = 'OidcAuthNotEnabledError';
  }
}

export function oidcNotEnabledResponse(): NextResponse {
  return NextResponse.json(
    { message: 'OIDC auth is not enabled' },
    { status: 404, headers: { 'Cache-Control': 'no-store' } }
  );
}
