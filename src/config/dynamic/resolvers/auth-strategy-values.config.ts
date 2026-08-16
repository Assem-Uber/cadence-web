import type { AuthStrategyConfigValue } from './auth-strategy.types';

const AUTH_STRATEGY_VALUES_CONFIG = [
  'disabled',
  'jwt',
  'oidc',
] as const satisfies readonly AuthStrategyConfigValue[];

export default AUTH_STRATEGY_VALUES_CONFIG;
