import { OIDC_LOGIN_PATH } from '@/utils/auth/auth.constants';
import { type AuthLogoutNotice } from '@/utils/auth/auth.types';
import { sanitizeReturnTo } from '@/utils/auth/helpers/sanitize-return-to';

export function buildOidcLoginPath(
  returnTo?: string | null,
  notice?: AuthLogoutNotice
): string {
  const params = new URLSearchParams({
    returnTo: sanitizeReturnTo(returnTo),
  });
  if (notice) {
    params.set('notice', notice);
  }
  return `${OIDC_LOGIN_PATH}?${params.toString()}`;
}
