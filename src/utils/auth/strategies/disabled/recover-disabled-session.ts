import 'server-only';

import { type AuthRecoveryOutcome } from '@/utils/auth/auth.types';

export async function recoverDisabledSession(): Promise<AuthRecoveryOutcome> {
  return { result: { kind: 'noop' } };
}
