import { type AuthLogoutNotice } from '@/utils/auth/auth.types';

export default function getNoticeMessage(notice: AuthLogoutNotice): string {
  if (notice === 'signed-out') {
    return 'You have been signed out. Paste a new JWT to continue.';
  }
  return 'Your session expired. Paste a new JWT to continue.';
}
