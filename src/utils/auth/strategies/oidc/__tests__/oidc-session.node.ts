import {
  decryptOidcPending,
  decryptOidcSession,
  encryptOidcPending,
  encryptOidcSession,
} from '../oidc-session';

const SESSION_SECRET = 'test-oidc-session-secret-32bytes!!';

describe('oidc-session', () => {
  it('round-trips encrypted session payload', async () => {
    const payload = {
      accessToken: 'access-token-value',
      refreshToken: 'refresh-token-value',
      expiresAtMs: Date.now() + 60_000,
      authenticatedAtMs: Date.now(),
    };

    const encrypted = await encryptOidcSession(payload, SESSION_SECRET, 3600);
    const decrypted = await decryptOidcSession(encrypted, SESSION_SECRET);

    expect(decrypted).toEqual(payload);
  });

  it('round-trips encrypted pending payload', async () => {
    const payload = {
      codeVerifier: 'verifier',
      state: 'state-value',
      nonce: 'nonce-value',
      returnTo: '/domains/sample/cluster',
    };

    const encrypted = await encryptOidcPending(payload, SESSION_SECRET, 600);
    const decrypted = await decryptOidcPending(encrypted, SESSION_SECRET);

    expect(decrypted).toEqual(payload);
  });

  it('rejects tampered session cookie', async () => {
    expect(
      await decryptOidcSession('not-a-valid-jwe-token', SESSION_SECRET)
    ).toBeUndefined();
  });
});
