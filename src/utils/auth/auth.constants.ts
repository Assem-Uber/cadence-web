import {
  type AuthLogoutNotice,
  type DomainAccess,
  type OidcClaimMappingConfig,
} from './auth.types';

// --- Logout notices ---

export const AUTH_LOGOUT_NOTICES = [
  'signed-out',
  'session-expired',
] as const satisfies readonly AuthLogoutNotice[];

export const AUTH_LOGOUT_NOTICE_SET = new Set<string>(AUTH_LOGOUT_NOTICES);

// --- Login redirects ---

export const DEFAULT_AUTH_RETURN_TO = '/';

// --- JWT ---

export const CADENCE_AUTH_COOKIE_NAME = 'cadence-authorization';

export const JWT_LOGIN_PATH = '/login';

// --- OIDC ---

export const CADENCE_OIDC_SESSION_COOKIE_NAME = 'cadence-oidc-session';

export const CADENCE_OIDC_PENDING_COOKIE_NAME = 'cadence-oidc-pending';

/** Short-lived cookie bridging login redirect and callback. */
export const OIDC_PENDING_COOKIE_MAX_AGE_SECONDS = 600;

/**
 * Also the absolute session ceiling: token refresh never extends a session
 * past authenticatedAtMs (login time) + this value; users must re-login.
 */
export const OIDC_SESSION_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24;

export const OIDC_POST_LOGIN_REDIRECT_PATH = '/domains';

export const OIDC_LOGIN_PATH = '/api/auth/oidc/login';

export const OIDC_LOGOUT_PATH = '/api/auth/oidc/logout';

/**
 * TODO(cadence-backend): temporary web-side claim mapping until a Cadence
 * backend introspection API owns authorization data.
 *
 * ponytail: intentionally a code constant, not env config — web-side claim
 * mapping is an interim measure until a Cadence backend introspection API
 * owns it, so it must not surface as a supported deployment knob. Forks that
 * need different claims edit this constant (or the mapper) directly.
 */
export const DEFAULT_OIDC_CLAIM_MAPPING: OidcClaimMappingConfig = {
  groupsClaims: ['groups', 'realm_access.roles'],
  adminRoles: ['cadence-admin'],
};

// --- Auth HTTP plumbing ---

/** Base options for auth cookies; `secure` is derived per request. */
export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
};

export const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store',
};

// --- Domain access ---

export const FULL_ACCESS: DomainAccess = {
  canRead: true,
  canWrite: true,
};

export const NO_ACCESS: DomainAccess = {
  canRead: false,
  canWrite: false,
};
