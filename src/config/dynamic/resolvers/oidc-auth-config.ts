import authStrategy from './auth-strategy';
import { type OidcAuthConfig } from './oidc-auth-config.types';

const DEFAULT_OIDC_SCOPES = 'openid profile email';

// The openid scope is mandatory for OIDC; without it no ID token is issued.
function withOpenidScope(scopes: string): string {
  return scopes.split(/\s+/).includes('openid') ? scopes : `openid ${scopes}`;
}

export default function oidcAuthConfig(): OidcAuthConfig | null {
  if (authStrategy() !== 'oidc') {
    return null;
  }

  const issuer = process.env.CADENCE_WEB_OIDC_ISSUER?.trim();
  const clientId = process.env.CADENCE_WEB_OIDC_CLIENT_ID?.trim();
  const clientSecret = process.env.CADENCE_WEB_OIDC_CLIENT_SECRET?.trim();
  const redirectUri = process.env.CADENCE_WEB_OIDC_REDIRECT_URI?.trim();
  const sessionSecret = process.env.CADENCE_WEB_OIDC_SESSION_SECRET?.trim();
  const scopes = withOpenidScope(
    process.env.CADENCE_WEB_OIDC_SCOPES?.trim() || DEFAULT_OIDC_SCOPES
  );

  const missing = [
    !issuer && 'CADENCE_WEB_OIDC_ISSUER',
    !clientId && 'CADENCE_WEB_OIDC_CLIENT_ID',
    !clientSecret && 'CADENCE_WEB_OIDC_CLIENT_SECRET',
    !redirectUri && 'CADENCE_WEB_OIDC_REDIRECT_URI',
    !sessionSecret && 'CADENCE_WEB_OIDC_SESSION_SECRET',
  ].filter(Boolean);

  if (missing.length > 0) {
    throw new Error(
      `CADENCE_WEB_AUTH_STRATEGY=oidc requires: ${missing.join(', ')}`
    );
  }

  const issuerUrl = new URL(issuer as string);
  // http issuers are auto-allowed outside production only (local Keycloak);
  // production must opt in explicitly so a misconfigured issuer cannot
  // silently downgrade OIDC traffic to plaintext.
  const allowInsecureExplicit =
    process.env.CADENCE_WEB_OIDC_ALLOW_INSECURE === 'true';
  const allowInsecureRequests =
    allowInsecureExplicit ||
    (process.env.NODE_ENV !== 'production' && issuerUrl.protocol === 'http:');

  if (issuerUrl.protocol === 'http:' && !allowInsecureRequests) {
    throw new Error(
      'CADENCE_WEB_OIDC_ISSUER uses http; set CADENCE_WEB_OIDC_ALLOW_INSECURE=true to explicitly allow insecure OIDC requests in production'
    );
  }

  return {
    issuer: issuer as string,
    clientId: clientId as string,
    clientSecret: clientSecret as string,
    redirectUri: redirectUri as string,
    sessionSecret: sessionSecret as string,
    scopes,
    allowInsecureRequests,
  };
}
