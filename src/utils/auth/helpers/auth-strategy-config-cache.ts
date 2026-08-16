import { type AuthStrategyConfigValue } from '@/config/dynamic/resolvers/auth-strategy.types';

let cachedAuthStrategyConfig: AuthStrategyConfigValue | undefined;

export function setCachedAuthStrategyConfig(
  authStrategy: AuthStrategyConfigValue | undefined
) {
  cachedAuthStrategyConfig = authStrategy;
}

export function getCachedAuthStrategyConfig():
  | AuthStrategyConfigValue
  | undefined {
  return cachedAuthStrategyConfig;
}

/** Returns cached strategy, fetching /api/auth/me when the cache is empty. */
export async function resolveCachedAuthStrategy(): Promise<
  AuthStrategyConfigValue | undefined
> {
  if (cachedAuthStrategyConfig) {
    return cachedAuthStrategyConfig;
  }

  try {
    const response = await fetch('/api/auth/me', { cache: 'no-store' });
    if (!response.ok) {
      return undefined;
    }
    const data = (await response.json()) as {
      authStrategy?: AuthStrategyConfigValue;
    };
    setCachedAuthStrategyConfig(data.authStrategy);
    return data.authStrategy;
  } catch {
    return undefined;
  }
}
