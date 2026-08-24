import 'server-only';

import { type AuthRequest } from '@/utils/auth/auth.types';
import { sanitizeReturnTo } from '@/utils/auth/helpers/sanitize-return-to';
import { resolveAuthStrategy } from '@/utils/auth/strategies/resolve-auth-strategy';

export async function getLoginRedirectIfNeeded(
  request: AuthRequest,
  returnTo: string
): Promise<string | null> {
  const strategy = await resolveAuthStrategy();
  return strategy.server.getLoginRedirectIfNeeded(
    request,
    sanitizeReturnTo(returnTo)
  );
}

export async function getRequestReturnTo(
  returnToHeader: string | null
): Promise<string> {
  return sanitizeReturnTo(returnToHeader);
}
