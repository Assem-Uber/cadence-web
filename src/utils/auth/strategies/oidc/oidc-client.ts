import 'server-only';

import * as client from 'openid-client';

import { type OidcAuthConfig } from '@/config/dynamic/resolvers/oidc-auth-config.types';

let cachedConfig: client.Configuration | undefined;
let cachedConfigKey: string | undefined;

export async function getOidcClientConfiguration(
  oidcConfig: OidcAuthConfig
): Promise<client.Configuration> {
  const cacheKey = `${oidcConfig.issuer}|${oidcConfig.clientId}|${oidcConfig.allowInsecureRequests}`;
  if (cachedConfig && cachedConfigKey === cacheKey) {
    return cachedConfig;
  }

  const server = new URL(oidcConfig.issuer);
  const discoveryOptions: client.DiscoveryRequestOptions | undefined =
    oidcConfig.allowInsecureRequests
      ? { execute: [client.allowInsecureRequests] }
      : undefined;

  cachedConfig = await client.discovery(
    server,
    oidcConfig.clientId,
    undefined,
    client.ClientSecretPost(oidcConfig.clientSecret),
    discoveryOptions
  );
  cachedConfigKey = cacheKey;
  return cachedConfig;
}

export function resetOidcClientConfigurationCache() {
  cachedConfig = undefined;
  cachedConfigKey = undefined;
}
