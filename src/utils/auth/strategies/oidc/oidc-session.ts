import { EncryptJWT, jwtDecrypt } from 'jose';
import { hkdfSync } from 'node:crypto';
import { z } from 'zod';

import { DEFAULT_AUTH_RETURN_TO } from '@/utils/auth/auth.constants';
import {
  type OidcPendingPayload,
  type OidcSessionPayload,
} from '@/utils/auth/auth.types';

const oidcSessionPayloadSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1).optional(),
  expiresAtMs: z.number().int().positive(),
  idToken: z.string().min(1).optional(),
  authenticatedAtMs: z.number().int().positive(),
});

const oidcPendingPayloadSchema = z.object({
  codeVerifier: z.string().min(1),
  state: z.string().min(1),
  nonce: z.string().min(1),
  returnTo: z.string().min(1).optional(),
});

function getEncryptionKey(secret: string) {
  const keyBytes = new TextEncoder().encode(secret);
  if (keyBytes.length < 32) {
    throw new Error('OIDC session secret must be at least 32 bytes');
  }
  // HKDF spreads the full secret's entropy into the AES key instead of
  // truncating the secret to its first 32 bytes.
  return new Uint8Array(
    hkdfSync(
      'sha256',
      keyBytes,
      new Uint8Array(0),
      'cadence-web-oidc-session',
      32
    )
  );
}

async function encryptPayload<T extends Record<string, unknown>>(
  payload: T,
  secret: string,
  maxAgeSeconds: number
): Promise<string> {
  const key = getEncryptionKey(secret);
  return new EncryptJWT(payload)
    .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
    .setIssuedAt()
    .setExpirationTime(`${maxAgeSeconds}s`)
    .encrypt(key);
}

async function decryptPayload<T>(
  token: string,
  secret: string,
  schema: z.ZodType<T>
): Promise<T | undefined> {
  try {
    const key = getEncryptionKey(secret);
    const { payload } = await jwtDecrypt(token, key);
    const result = schema.safeParse(payload);
    return result.success ? result.data : undefined;
  } catch {
    return undefined;
  }
}

export async function encryptOidcSession(
  payload: OidcSessionPayload,
  secret: string,
  maxAgeSeconds: number
): Promise<string> {
  return encryptPayload(payload, secret, maxAgeSeconds);
}

export async function decryptOidcSession(
  token: string,
  secret: string
): Promise<OidcSessionPayload | undefined> {
  return decryptPayload(token, secret, oidcSessionPayloadSchema);
}

export async function encryptOidcPending(
  payload: OidcPendingPayload,
  secret: string,
  maxAgeSeconds: number
): Promise<string> {
  return encryptPayload(payload, secret, maxAgeSeconds);
}

export async function decryptOidcPending(
  token: string,
  secret: string
): Promise<OidcPendingPayload | undefined> {
  const pending = await decryptPayload(token, secret, oidcPendingPayloadSchema);
  if (!pending) {
    return undefined;
  }

  return {
    ...pending,
    returnTo: pending.returnTo ?? DEFAULT_AUTH_RETURN_TO,
  };
}
