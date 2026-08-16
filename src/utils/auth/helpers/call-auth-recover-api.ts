import {
  type AuthFailureContext,
  type AuthRecoveryResult,
} from '../auth.types';

export async function callAuthRecoverApi(
  ctx: AuthFailureContext
): Promise<AuthRecoveryResult> {
  const response = await fetch('/api/auth/recover', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(ctx),
    cache: 'no-store',
  });

  if (!response.ok) {
    return { kind: 'noop' };
  }

  const payload = (await response.json()) as AuthRecoveryResult;
  if (payload.kind === 'redirect') {
    window.location.assign(payload.url);
  }
  return payload;
}
