export type OidcAuthConfig = {
  issuer: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  sessionSecret: string;
  scopes: string;
  /** ponytail: local Keycloak uses http:// — openid-client requires explicit opt-in */
  allowInsecureRequests: boolean;
};
