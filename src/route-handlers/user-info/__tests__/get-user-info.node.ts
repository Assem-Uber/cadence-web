import { NextRequest } from 'next/server';

import { CADENCE_AUTH_COOKIE_NAME } from '@/utils/auth/auth.constants';
import getConfigValue from '@/utils/config/get-config-value';

import { getUserInfo } from '../get-user-info';

jest.mock('@/utils/config/get-config-value');

const mockGetConfigValue = getConfigValue as jest.MockedFunction<
  typeof getConfigValue
>;

const buildToken = (claims: Record<string, unknown>) => {
  const payload = Buffer.from(JSON.stringify(claims)).toString('base64url');
  return ['header', payload, 'signature'].join('.');
};

const buildRequest = (cookie?: string) => {
  const headers = new Headers();
  if (cookie) {
    headers.set('cookie', `${CADENCE_AUTH_COOKIE_NAME}=${cookie}`);
  }
  return new NextRequest('http://localhost/api/auth/user', {
    method: 'GET',
    headers,
  });
};

describe('getUserInfo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetConfigValue.mockImplementation((async (key: string) => {
      if (key === 'CADENCE_WEB_AUTH_STRATEGY') return 'jwt';
      return '';
    }) as unknown as typeof getConfigValue);
  });

  it('returns user info from the auth session', async () => {
    const token = buildToken({
      sub: 'user-id',
      name: 'test-user',
      groups: 'reader writer',
      admin: true,
    });

    const response = await getUserInfo(buildRequest(token));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ id: 'user-id', userName: 'test-user' });
    expect(response.headers.get('Cache-Control')).toBe('no-store');
  });

  it('returns empty user info when there is no session', async () => {
    const response = await getUserInfo(buildRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({});
  });
});
