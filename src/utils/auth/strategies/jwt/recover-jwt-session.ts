import 'server-only';

import {
  type AuthFailureContext,
  type AuthRecoveryOutcome,
} from '@/utils/auth/auth.types';
import { buildJwtLoginPath } from '@/utils/auth/strategies/jwt/build-jwt-login-path';

export async function recoverJwtSession(
  ctx: AuthFailureContext
): Promise<AuthRecoveryOutcome> {
  return {
    result: {
      kind: 'redirect',
      url: buildJwtLoginPath(ctx.returnTo, ctx.notice),
    },
    clearSession: true,
  };
}
