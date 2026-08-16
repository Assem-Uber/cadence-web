import {
  type AuthLoginResult,
  type AuthLogoutNotice,
  type AuthRecoveryResult,
} from '@/utils/auth/auth.types';

export type AuthLifecycle = {
  isAuthEnabled: boolean;
  isJwtAuth: boolean;
  isOidcAuth: boolean;
  isValidToken: boolean;
  isAuthLoading: boolean;
  userName?: string;
  pictureUrl?: string;
  expiresAtMs?: number;
  /** Whether the session expiry can be extended silently (e.g. OIDC refresh token). */
  canRefreshSession: boolean;
  login: (returnTo?: string) => AuthLoginResult | null;
  saveToken: (token: string) => Promise<boolean>;
  /** Attempts silent session recovery (e.g. OIDC refresh token) and refetches auth state on success. */
  recoverSession: (returnTo?: string) => Promise<AuthRecoveryResult>;
  logout: () => Promise<void>;
  logoutWithRedirect: (notice?: AuthLogoutNotice, returnTo?: string) => boolean;
};
