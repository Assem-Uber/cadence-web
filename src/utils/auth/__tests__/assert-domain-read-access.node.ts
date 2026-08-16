import { type Domain } from '@/__generated__/proto-ts/uber/cadence/api/v1/Domain';

import { type PrivateAuthContext } from '../auth.types';
import { getDomainReadAccessDeniedResponse } from '../authorization/domain-access-http';

const DOMAIN = {
  name: 'restricted',
  data: {
    READ_GROUPS: 'cadence-readers',
    WRITE_GROUPS: 'cadence-writers',
  },
} as unknown as Domain;

const AUTH_ENABLED: PrivateAuthContext = {
  authEnabled: true,
  auth: { isValidToken: true, token: 'token' },
  groups: ['cadence-readers'],
  isAdmin: false,
};

describe(getDomainReadAccessDeniedResponse.name, () => {
  it('returns null when auth is disabled', () => {
    expect(
      getDomainReadAccessDeniedResponse(DOMAIN, {
        ...AUTH_ENABLED,
        authEnabled: false,
      })
    ).toBeNull();
  });

  it('returns null for admin users', () => {
    expect(
      getDomainReadAccessDeniedResponse(DOMAIN, {
        ...AUTH_ENABLED,
        isAdmin: true,
      })
    ).toBeNull();
  });

  it('returns 401 when auth is enabled without a valid token', () => {
    const response = getDomainReadAccessDeniedResponse(DOMAIN, {
      ...AUTH_ENABLED,
      auth: { isValidToken: false },
    });

    expect(response?.status).toBe(401);
  });

  it('returns 403 when user lacks read access', () => {
    const response = getDomainReadAccessDeniedResponse(DOMAIN, {
      ...AUTH_ENABLED,
      groups: ['other-group'],
    });

    expect(response?.status).toBe(403);
  });

  it('returns null when user has read access', () => {
    expect(getDomainReadAccessDeniedResponse(DOMAIN, AUTH_ENABLED)).toBeNull();
  });
});
