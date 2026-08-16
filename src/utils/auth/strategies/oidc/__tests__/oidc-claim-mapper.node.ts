import { DEFAULT_OIDC_CLAIM_MAPPING } from '@/utils/auth/auth.constants';

import {
  getJwtExpiresAtMs,
  getTokenResponseExpiresAtMs,
  mapSessionClaims,
  mapTokenClaims,
} from '../oidc-claim-mapper';

const CONFIG = DEFAULT_OIDC_CLAIM_MAPPING;

function buildJwt(payload: Record<string, unknown>) {
  const header = Buffer.from(
    JSON.stringify({ alg: 'RS256', typ: 'JWT', kid: 'test' })
  ).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${header}.${body}.signature`;
}

describe(mapTokenClaims.name, () => {
  it('maps configured claim paths to groups and admin flag', () => {
    const token = buildJwt({
      sub: 'user-1',
      preferred_username: 'test-user',
      name: 'Test User',
      realm_access: {
        roles: ['cadence-writers', 'cadence-admin', 'offline_access'],
      },
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    expect(mapTokenClaims(token, CONFIG)).toEqual({
      groups: ['cadence-writers', 'cadence-admin', 'offline_access'],
      isAdmin: true,
      id: 'user-1',
      userName: 'Test User',
      pictureUrl: undefined,
    });
  });

  it('supports custom claim paths and admin roles', () => {
    const token = buildJwt({
      sub: 'user-1',
      'custom-roles': 'ops-team super-user',
    });

    expect(
      mapTokenClaims(token, {
        groupsClaims: ['custom-roles'],
        adminRoles: ['super-user'],
      })
    ).toMatchObject({
      groups: ['ops-team', 'super-user'],
      isAdmin: true,
    });
  });

  it('maps picture claim when present', () => {
    const token = buildJwt({
      sub: 'user-1',
      name: 'Test User',
      picture: 'https://example.com/avatar.png',
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    expect(mapTokenClaims(token, CONFIG)?.pictureUrl).toBe(
      'https://example.com/avatar.png'
    );
  });

  it('returns undefined for non-JWT (opaque) tokens', () => {
    expect(mapTokenClaims('not-a-jwt', CONFIG)).toBeUndefined();
  });
});

describe(mapSessionClaims.name, () => {
  it('prefers ID token identity and unions groups across tokens', () => {
    const idToken = buildJwt({
      sub: 'user-1',
      name: 'ID Token Name',
      groups: ['team-a'],
    });
    const accessToken = buildJwt({
      sub: 'user-1',
      name: 'Access Token Name',
      realm_access: { roles: ['team-b'] },
    });

    expect(mapSessionClaims({ accessToken, idToken }, CONFIG)).toEqual({
      groups: ['team-a', 'team-b'],
      isAdmin: false,
      id: 'user-1',
      userName: 'ID Token Name',
      pictureUrl: undefined,
    });
  });

  it('keeps a usable result when the access token is opaque', () => {
    const idToken = buildJwt({
      sub: 'user-1',
      name: 'Test User',
      groups: ['cadence-admin'],
    });

    expect(
      mapSessionClaims({ accessToken: 'opaque-token', idToken }, CONFIG)
    ).toEqual({
      groups: ['cadence-admin'],
      isAdmin: true,
      id: 'user-1',
      userName: 'Test User',
      pictureUrl: undefined,
    });
  });

  it('returns empty claims when no token is a JWT', () => {
    expect(mapSessionClaims({ accessToken: 'opaque-token' }, CONFIG)).toEqual({
      groups: [],
      isAdmin: false,
      id: undefined,
      userName: undefined,
      pictureUrl: undefined,
    });
  });
});

describe(getTokenResponseExpiresAtMs.name, () => {
  it('prefers expires_in from the token response', () => {
    const before = Date.now();
    const result = getTokenResponseExpiresAtMs({
      access_token: 'opaque-token',
      expiresIn: () => 300,
    });
    expect(result).toBeGreaterThanOrEqual(before + 300_000);
  });

  it('falls back to the access token exp claim', () => {
    const exp = Math.floor(Date.now() / 1000) + 3600;
    const result = getTokenResponseExpiresAtMs({
      access_token: buildJwt({ sub: 'user-1', exp }),
      expiresIn: () => undefined,
    });
    expect(result).toBe(exp * 1000);
  });

  it('returns undefined when no expiry source exists', () => {
    expect(
      getTokenResponseExpiresAtMs({
        access_token: 'opaque-token',
        expiresIn: () => undefined,
      })
    ).toBeUndefined();
    expect(getJwtExpiresAtMs('opaque-token')).toBeUndefined();
  });
});
