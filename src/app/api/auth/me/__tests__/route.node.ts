import { NextRequest } from 'next/server';

import { CADENCE_AUTH_COOKIE_NAME } from '@/utils/auth/auth.constants';
import getConfigValue from '@/utils/config/get-config-value';

import { GET } from '../route';

jest.mock('@/utils/config/get-config-value');

const mockGetConfigValue = getConfigValue as jest.MockedFunction<
  typeof getConfigValue
>;

const setConfig = (strategy: 'jwt' | 'disabled' | 'oidc') => {
  mockGetConfigValue.mockImplementation((async (key: string) => {
    if (key === 'CADENCE_WEB_AUTH_STRATEGY') return strategy;
    return '';
  }) as unknown as typeof getConfigValue);
};

const buildToken = (claims: Record<string, unknown>) => {
  const payload = Buffer.from(JSON.stringify(claims)).toString('base64url');
  return ['header', payload, 'signature'].join('.');
};

const buildRequest = (cookie?: string) => {
  const headers = new Headers();
  if (cookie) {
    headers.set('cookie', `${CADENCE_AUTH_COOKIE_NAME}=${cookie}`);
  }
  return new NextRequest('http://localhost/api/auth/me', {
    method: 'GET',
    headers,
  });
};

describe('GET /api/auth/me', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns session state only', async () => {
    setConfig('jwt');

    const token = buildToken({
      sub: 'user-id',
      name: 'test-user',
      groups: 'reader writer',
      admin: true,
    });

    const response = await GET(buildRequest(token));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      authEnabled: true,
      authStrategy: 'jwt',
      auth: { isValidToken: true, expiresAtMs: undefined },
    });
  });

  it('does not expose identity, groups or admin flag', async () => {
    setConfig('jwt');

    const token = buildToken({
      sub: 'user-id',
      name: 'test-user',
      groups: 'reader writer',
      admin: true,
    });

    const response = await GET(buildRequest(token));
    const body = await response.json();

    expect(body).not.toHaveProperty('userName');
    expect(body).not.toHaveProperty('id');
    expect(body).not.toHaveProperty('groups');
    expect(body).not.toHaveProperty('isAdmin');
  });

  it('returns unauthenticated context when no cookie is present', async () => {
    setConfig('jwt');

    const response = await GET(buildRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      authEnabled: true,
      authStrategy: 'jwt',
      auth: { isValidToken: false },
    });
    expect(body).not.toHaveProperty('token');
  });

  it('returns auth-disabled context when strategy is disabled', async () => {
    setConfig('disabled');

    const response = await GET(buildRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      authEnabled: false,
      authStrategy: 'disabled',
      auth: { isValidToken: false },
    });
  });

  it('never exposes the token in the response', async () => {
    setConfig('jwt');

    const token = buildToken({ sub: 'user-id', name: 'test-user' });
    const response = await GET(buildRequest(token));
    const body = await response.json();

    expect(body).not.toHaveProperty('token');
    expect(JSON.stringify(body)).not.toContain(token);
  });

  it('sets Cache-Control: no-store', async () => {
    setConfig('disabled');

    const response = await GET(buildRequest());

    expect(response.headers.get('Cache-Control')).toBe('no-store');
  });
});
