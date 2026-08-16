import oidcAuthConfig from '../oidc-auth-config';

describe(oidcAuthConfig.name, () => {
  const envKeys = [
    'CADENCE_WEB_AUTH_STRATEGY',
    'CADENCE_WEB_OIDC_ISSUER',
    'CADENCE_WEB_OIDC_CLIENT_ID',
    'CADENCE_WEB_OIDC_CLIENT_SECRET',
    'CADENCE_WEB_OIDC_REDIRECT_URI',
    'CADENCE_WEB_OIDC_SESSION_SECRET',
    'CADENCE_WEB_OIDC_SCOPES',
    'CADENCE_WEB_OIDC_ALLOW_INSECURE',
  ] as const;

  const originalEnv = Object.fromEntries(
    envKeys.map((key) => [key, process.env[key]])
  );

  afterEach(() => {
    envKeys.forEach((key) => {
      const value = originalEnv[key];
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    });
  });

  it('returns null when strategy is not oidc', () => {
    process.env.CADENCE_WEB_AUTH_STRATEGY = 'jwt';

    expect(oidcAuthConfig()).toBeNull();
  });

  it('returns config when strategy is oidc and env is set', () => {
    process.env.CADENCE_WEB_AUTH_STRATEGY = 'oidc';
    process.env.CADENCE_WEB_OIDC_ISSUER =
      'http://localhost:8080/realms/cadence';
    process.env.CADENCE_WEB_OIDC_CLIENT_ID = 'cadence-web';
    process.env.CADENCE_WEB_OIDC_CLIENT_SECRET = 'secret';
    process.env.CADENCE_WEB_OIDC_REDIRECT_URI =
      'http://localhost:8088/api/auth/oidc/callback';
    process.env.CADENCE_WEB_OIDC_SESSION_SECRET =
      'local-dev-oidc-session-secret-32b';

    expect(oidcAuthConfig()).toEqual({
      issuer: 'http://localhost:8080/realms/cadence',
      clientId: 'cadence-web',
      clientSecret: 'secret',
      redirectUri: 'http://localhost:8088/api/auth/oidc/callback',
      sessionSecret: 'local-dev-oidc-session-secret-32b',
      scopes: 'openid profile email',
      allowInsecureRequests: true,
    });
  });

  it('forces the openid scope', () => {
    setValidOidcEnv({ issuer: 'https://idp.example.test' });
    process.env.CADENCE_WEB_OIDC_SCOPES = 'profile email';

    expect(oidcAuthConfig()).toMatchObject({
      scopes: 'openid profile email',
      allowInsecureRequests: false,
    });
  });

  it('throws for http issuer in production without explicit opt-in', () => {
    setValidOidcEnv({ issuer: 'http://intranet-idp.example.test' });

    withNodeEnv('production', () => {
      expect(() => oidcAuthConfig()).toThrow(/CADENCE_WEB_OIDC_ALLOW_INSECURE/);

      process.env.CADENCE_WEB_OIDC_ALLOW_INSECURE = 'true';
      expect(oidcAuthConfig()).toMatchObject({ allowInsecureRequests: true });
    });
  });

  it('throws when strategy is oidc but env is incomplete', () => {
    process.env.CADENCE_WEB_AUTH_STRATEGY = 'oidc';
    delete process.env.CADENCE_WEB_OIDC_ISSUER;

    expect(() => oidcAuthConfig()).toThrow(/CADENCE_WEB_OIDC_ISSUER/);
  });
});

function setValidOidcEnv({ issuer }: { issuer: string }) {
  process.env.CADENCE_WEB_AUTH_STRATEGY = 'oidc';
  process.env.CADENCE_WEB_OIDC_ISSUER = issuer;
  process.env.CADENCE_WEB_OIDC_CLIENT_ID = 'cadence-web';
  process.env.CADENCE_WEB_OIDC_CLIENT_SECRET = 'secret';
  process.env.CADENCE_WEB_OIDC_REDIRECT_URI =
    'https://cadence.example.test/api/auth/oidc/callback';
  process.env.CADENCE_WEB_OIDC_SESSION_SECRET =
    'local-dev-oidc-session-secret-32b';
}

function withNodeEnv(nodeEnv: string, fn: () => void) {
  const original = process.env.NODE_ENV;
  Object.assign(process.env, { NODE_ENV: nodeEnv });
  try {
    fn();
  } finally {
    Object.assign(process.env, { NODE_ENV: original });
  }
}
