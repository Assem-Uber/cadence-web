import { NextRequest } from 'next/server';

import getConfigValue from '@/utils/config/get-config-value';

import { handleOidcLogoutRedirect } from '../oidc-logout';

jest.mock('@/utils/config/get-config-value');
jest.mock('@/utils/auth/strategies/oidc/oidc-client', () => ({
  getOidcClientConfiguration: jest.fn().mockResolvedValue({
    serverMetadata: () => ({}),
  }),
}));

const mockGetConfigValue = getConfigValue as jest.MockedFunction<
  typeof getConfigValue
>;

describe(handleOidcLogoutRedirect.name, () => {
  beforeEach(() => {
    mockGetConfigValue.mockImplementation((async (key: string) => {
      if (key === 'CADENCE_WEB_AUTH_STRATEGY') return 'oidc';
      if (key === 'OIDC_AUTH_CONFIG')
        return {
          redirectUri: 'https://cadence.test/api/auth/oidc/callback',
          sessionSecret: 'test-oidc-session-secret-32bytes!!',
          clientId: 'client-id',
        };
      return undefined;
    }) as unknown as typeof getConfigValue);
  });

  it('clears session cookies on a same-site logout navigation', async () => {
    const response = await setup({ secFetchSite: 'same-origin' });

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('https://cadence.test/');
    const setCookie = response.headers.get('set-cookie') ?? '';
    expect(setCookie).toContain('cadence-oidc-session=;');
    expect(setCookie).toContain('cadence-oidc-pending=;');
  });

  it('refuses to clear the session on a cross-site logout navigation', async () => {
    const response = await setup({ secFetchSite: 'cross-site' });

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('https://cadence.test/');
    expect(response.headers.get('set-cookie')).toBeNull();
  });
});

async function setup({ secFetchSite }: { secFetchSite?: string }) {
  const headers = new Headers();
  if (secFetchSite) {
    headers.set('sec-fetch-site', secFetchSite);
  }
  const request = new NextRequest('https://cadence.test/api/auth/oidc/logout', {
    headers,
  });
  return handleOidcLogoutRedirect(request);
}
