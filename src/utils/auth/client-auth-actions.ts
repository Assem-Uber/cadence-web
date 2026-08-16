import { type AuthStrategyConfigValue } from '@/config/dynamic/resolvers/auth-strategy.types';

import {
  type AuthFailureContext,
  type AuthRecoveryResult,
  type AuthClientPolicy,
  type AuthLoginResult,
  type AuthLogoutNotice,
} from './auth.types';
import {
  getCachedAuthStrategyConfig,
  resolveCachedAuthStrategy,
} from './helpers/auth-strategy-config-cache';
import disabledClientPolicy from './strategies/disabled/disabled-client-actions';
import jwtClientPolicy from './strategies/jwt/jwt-client-actions';
import oidcClientPolicy from './strategies/oidc/oidc-client-actions';

export type { AuthLoginResult, AuthLogoutNotice };

export {
  startOidcLogin,
  startOidcLogoutRedirect,
} from './strategies/oidc/oidc-client-actions';

export {
  startJwtLogin,
  startJwtLogoutRedirect,
} from './strategies/jwt/jwt-client-actions';

const AUTH_CLIENT_POLICIES: Record<AuthStrategyConfigValue, AuthClientPolicy> =
  {
    disabled: disabledClientPolicy,
    jwt: jwtClientPolicy,
    oidc: oidcClientPolicy,
  };

let recoveryInFlight: Promise<AuthRecoveryResult> | null = null;

function getClientPolicy(
  authStrategy: AuthStrategyConfigValue | undefined
): AuthClientPolicy | undefined {
  if (!authStrategy) {
    return undefined;
  }
  return AUTH_CLIENT_POLICIES[authStrategy];
}

export function supportsSessionRecovery(
  authStrategy: AuthStrategyConfigValue | undefined
): boolean {
  return getClientPolicy(authStrategy)?.supportsSessionRecovery ?? false;
}

export function resolveClientLoginAction(
  authStrategy: AuthStrategyConfigValue | undefined,
  returnTo?: string | null
): AuthLoginResult | null {
  return getClientPolicy(authStrategy)?.login(returnTo) ?? null;
}

export function resolveClientLogoutRedirect(
  authStrategy: AuthStrategyConfigValue | undefined,
  notice?: AuthLogoutNotice,
  returnTo?: string | null
): boolean {
  return getClientPolicy(authStrategy)?.logout(notice, returnTo) ?? false;
}

export async function handleApiUnauthorized(
  ctx: AuthFailureContext
): Promise<AuthRecoveryResult> {
  const authStrategy =
    getCachedAuthStrategyConfig() ?? (await resolveCachedAuthStrategy());
  const policy = getClientPolicy(authStrategy);
  if (!policy) {
    return { kind: 'noop' };
  }

  if (!recoveryInFlight) {
    recoveryInFlight = policy.onUnauthorized(ctx).finally(() => {
      recoveryInFlight = null;
    });
  }
  return recoveryInFlight;
}
