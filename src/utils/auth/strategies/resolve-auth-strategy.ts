import 'server-only';

import { type AuthServerStrategy } from '@/utils/auth/auth.types';
import getConfigValue from '@/utils/config/get-config-value';

import disabledAuthStrategy from './disabled/disabled-auth-strategy';
import jwtAuthStrategy from './jwt/jwt-auth-strategy';

export async function resolveAuthStrategy(): Promise<AuthServerStrategy> {
  const authStrategy = await getConfigValue('CADENCE_WEB_AUTH_STRATEGY');
  switch (authStrategy) {
    case 'oidc':
      return (await import('./oidc/oidc-auth-strategy')).default;
    case 'jwt':
      return jwtAuthStrategy;
    case 'disabled':
      return disabledAuthStrategy;
    default: {
      // Compile-time exhaustiveness check: adding a strategy to AuthStrategyConfigValue
      // without a matching case above becomes a type error here.
      const _exhaustive: never = authStrategy;
      return _exhaustive;
    }
  }
}
