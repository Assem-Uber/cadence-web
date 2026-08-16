import { type z } from 'zod';

import { type AuthStrategyConfigValue } from '@/config/dynamic/resolvers/auth-strategy.types';

import { type cadenceJwtClaimsSchema } from './helpers/cadence-jwt-claims-schema';

// --- Session notices ---

export type AuthLogoutNotice = 'signed-out' | 'session-expired';

// --- Infrastructure ---

export type CookieReader = {
  get: (name: string) => { value: string } | undefined;
};

// --- JWT claims ---

export type CadenceJwtClaims = z.infer<typeof cadenceJwtClaimsSchema>;

// --- Auth context ---

export type PublicAuthState = {
  isValidToken: boolean;
  expiresAtMs?: number;
  /** Whether expiry can be extended silently (e.g. an OIDC refresh token). */
  canRefresh?: boolean;
};

export type PrivateAuthState = PublicAuthState & {
  token?: string;
};

/**
 * Public session snapshot returned by GET /api/auth/me. User identity is
 * served by GET /api/auth/user and per-domain permissions by
 * GET /api/domains/[domain]/[cluster]/access(-groups), so each can be
 * re-implemented against a Cadence backend or external provider.
 */
export type PublicSessionContext = {
  authEnabled: boolean;
  auth: PublicAuthState;
};

export type PublicAuthContext = PublicSessionContext & {
  authStrategy: AuthStrategyConfigValue;
};

/** Server-side context resolved from the auth session cookie. */
export type PrivateAuthContext = {
  authEnabled: boolean;
  auth: PrivateAuthState;
  groups: string[];
  isAdmin: boolean;
  userName?: string;
  id?: string;
  pictureUrl?: string;
};

// --- Domain access ---

export type DomainAccess = {
  canRead: boolean;
  canWrite: boolean;
};

// --- Session recovery ---

export type AuthRecoveryResult =
  | { kind: 'recovered' }
  | { kind: 'redirect'; url: string }
  | { kind: 'noop' };

export type AuthFailureContext = {
  returnTo: string;
  notice: AuthLogoutNotice;
};

/** Server-side outcome; cookie side effects applied by the recover route handler. */
export type AuthRecoveryOutcome = {
  result: AuthRecoveryResult;
  clearSession?: boolean;
  oidcSessionToken?: string;
};

// --- Strategy policies ---

export type AuthLoginResult = 'redirect';

/** Browser-side auth actions for a strategy. Registry: client-auth-actions.ts */
export type AuthClientPolicy = {
  /**
   * Whether the strategy can silently extend an expired session (e.g. via an
   * OIDC refresh token). When true, expiry-driven flows attempt recovery
   * before logging the user out.
   */
  supportsSessionRecovery: boolean;
  login: (returnTo?: string | null) => AuthLoginResult | null;
  logout: (notice?: AuthLogoutNotice, returnTo?: string | null) => boolean;
  onUnauthorized: (ctx: AuthFailureContext) => Promise<AuthRecoveryResult>;
};

/** Server-side auth policy for a strategy. Registry: resolve-auth-strategy.ts */
export type AuthServerPolicy = {
  resolveContext: (cookieStore: CookieReader) => Promise<PrivateAuthContext>;
  getLoginRedirectIfNeeded: (
    cookieStore: CookieReader,
    returnTo: string
  ) => Promise<string | null>;
  recoverSession: (
    cookieStore: CookieReader,
    ctx: AuthFailureContext
  ) => Promise<AuthRecoveryOutcome>;
};

export type AuthServerStrategy = {
  server: AuthServerPolicy;
};

// --- OIDC session ---

export type OidcSessionPayload = {
  accessToken: string;
  refreshToken?: string;
  expiresAtMs: number;
  idToken?: string;
  /** Login time; anchors the absolute session ceiling across refreshes. */
  authenticatedAtMs: number;
};

export type OidcPendingPayload = {
  codeVerifier: string;
  state: string;
  nonce: string;
  returnTo: string;
};

export type MappedOidcClaims = {
  groups: string[];
  isAdmin: boolean;
  id?: string;
  userName?: string;
  pictureUrl?: string;
};

export type OidcClaimMappingConfig = {
  /** Dotted claim paths to read group lists from, e.g. "groups" or "realm_access.roles". */
  groupsClaims: string[];
  /** Group/role names that grant admin access in the UI. */
  adminRoles: string[];
};
