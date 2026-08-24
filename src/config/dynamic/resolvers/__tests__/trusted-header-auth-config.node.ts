import trustedHeaderAuthConfig from '../trusted-header-auth-config';

describe(trustedHeaderAuthConfig.name, () => {
  const envKeys = [
    'CADENCE_WEB_AUTH_STRATEGY',
    'CADENCE_WEB_TRUSTED_HEADER_USER_ID',
    'CADENCE_WEB_TRUSTED_HEADER_EMAIL',
    'CADENCE_WEB_TRUSTED_HEADER_NAME',
    'CADENCE_WEB_TRUSTED_HEADER_GROUPS',
    'CADENCE_WEB_TRUSTED_HEADER_ADMIN',
    'CADENCE_WEB_TRUSTED_HEADER_GRPC_METADATA',
    'CADENCE_WEB_TRUSTED_HEADER_SHARED_SECRET_HEADER',
    'CADENCE_WEB_TRUSTED_HEADER_SHARED_SECRET',
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

  it('returns null when strategy is not trusted-header', () => {
    process.env.CADENCE_WEB_AUTH_STRATEGY = 'jwt';

    expect(trustedHeaderAuthConfig()).toBeNull();
  });

  it('returns config with only the required header when strategy is trusted-header', () => {
    process.env.CADENCE_WEB_AUTH_STRATEGY = 'trusted-header';
    process.env.CADENCE_WEB_TRUSTED_HEADER_USER_ID = 'x-test-user-id';

    expect(trustedHeaderAuthConfig()).toEqual({
      userIdHeader: 'x-test-user-id',
      emailHeader: undefined,
      nameHeader: undefined,
      groupsHeader: undefined,
      adminHeader: undefined,
      grpcMetadataMap: [],
      sharedSecretHeader: undefined,
      sharedSecret: undefined,
    });
  });

  it('throws when the required user id header is missing', () => {
    process.env.CADENCE_WEB_AUTH_STRATEGY = 'trusted-header';
    delete process.env.CADENCE_WEB_TRUSTED_HEADER_USER_ID;

    expect(() => trustedHeaderAuthConfig()).toThrow(
      /CADENCE_WEB_TRUSTED_HEADER_USER_ID/
    );
  });

  it('parses the optional header names and gRPC metadata map', () => {
    process.env.CADENCE_WEB_AUTH_STRATEGY = 'trusted-header';
    process.env.CADENCE_WEB_TRUSTED_HEADER_USER_ID = 'x-test-user-id';
    process.env.CADENCE_WEB_TRUSTED_HEADER_EMAIL = 'x-test-email';
    process.env.CADENCE_WEB_TRUSTED_HEADER_NAME = 'x-test-name';
    process.env.CADENCE_WEB_TRUSTED_HEADER_GROUPS = 'x-test-groups';
    process.env.CADENCE_WEB_TRUSTED_HEADER_ADMIN = 'x-test-admin';
    process.env.CADENCE_WEB_TRUSTED_HEADER_GRPC_METADATA =
      'x-test-user-id:caller-id, x-test-groups:caller-groups';

    expect(trustedHeaderAuthConfig()).toMatchObject({
      userIdHeader: 'x-test-user-id',
      emailHeader: 'x-test-email',
      nameHeader: 'x-test-name',
      groupsHeader: 'x-test-groups',
      adminHeader: 'x-test-admin',
      grpcMetadataMap: [
        { inboundHeader: 'x-test-user-id', outboundKey: 'caller-id' },
        { inboundHeader: 'x-test-groups', outboundKey: 'caller-groups' },
      ],
    });
  });

  it('throws on a malformed gRPC metadata map entry', () => {
    process.env.CADENCE_WEB_AUTH_STRATEGY = 'trusted-header';
    process.env.CADENCE_WEB_TRUSTED_HEADER_USER_ID = 'x-test-user-id';
    process.env.CADENCE_WEB_TRUSTED_HEADER_GRPC_METADATA = 'not-a-valid-pair';

    expect(() => trustedHeaderAuthConfig()).toThrow(
      /CADENCE_WEB_TRUSTED_HEADER_GRPC_METADATA/
    );
  });

  it('requires the shared secret header and value together', () => {
    process.env.CADENCE_WEB_AUTH_STRATEGY = 'trusted-header';
    process.env.CADENCE_WEB_TRUSTED_HEADER_USER_ID = 'x-test-user-id';
    process.env.CADENCE_WEB_TRUSTED_HEADER_SHARED_SECRET_HEADER =
      'x-test-shared-secret';
    delete process.env.CADENCE_WEB_TRUSTED_HEADER_SHARED_SECRET;

    expect(() => trustedHeaderAuthConfig()).toThrow(
      /CADENCE_WEB_TRUSTED_HEADER_SHARED_SECRET/
    );
  });

  it('accepts the shared secret header and value when both are set', () => {
    process.env.CADENCE_WEB_AUTH_STRATEGY = 'trusted-header';
    process.env.CADENCE_WEB_TRUSTED_HEADER_USER_ID = 'x-test-user-id';
    process.env.CADENCE_WEB_TRUSTED_HEADER_SHARED_SECRET_HEADER =
      'x-test-shared-secret';
    process.env.CADENCE_WEB_TRUSTED_HEADER_SHARED_SECRET = 'super-secret';

    expect(trustedHeaderAuthConfig()).toMatchObject({
      sharedSecretHeader: 'x-test-shared-secret',
      sharedSecret: 'super-secret',
    });
  });
});
