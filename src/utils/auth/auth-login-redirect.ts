import 'server-only';

import { type CookieReader } from '@/utils/auth/auth.types';
import { sanitizeReturnTo } from '@/utils/auth/helpers/sanitize-return-to';
import { resolveAuthStrategy } from '@/utils/auth/strategies/resolve-auth-strategy';

export async function getLoginRedirectIfNeeded(
  cookieStore: CookieReader,
  returnTo: string
): Promise<string | null> {
  const strategy = await resolveAuthStrategy();
  return strategy.server.getLoginRedirectIfNeeded(
    cookieStore,
    sanitizeReturnTo(returnTo)
  );
}

export async function getRequestReturnTo(
  returnToHeader: string | null
): Promise<string> {
  return sanitizeReturnTo(returnToHeader);
}
