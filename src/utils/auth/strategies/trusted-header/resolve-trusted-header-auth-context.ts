import 'server-only';

import { type TrustedHeaderAuthConfig } from '@/config/dynamic/resolvers/trusted-header-auth-config.types';
import {
  type AuthRequest,
  type PrivateAuthContext,
} from '@/utils/auth/auth.types';
import { splitGroupList } from '@/utils/auth/authorization/split-group-list';
import getConfigValue from '@/utils/config/get-config-value';

const UNAUTHENTICATED_CONTEXT: PrivateAuthContext = {
  authEnabled: true,
  auth: { isValidToken: false },
  groups: [],
  isAdmin: false,
};

function isTruthyHeaderValue(value: string | null): boolean {
  return (
    value !== null && ['true', '1', 'yes'].includes(value.trim().toLowerCase())
  );
}

function hasValidSharedSecret(
  config: TrustedHeaderAuthConfig,
  request: AuthRequest
): boolean {
  if (!config.sharedSecretHeader || !config.sharedSecret) {
    return true;
  }
  return request.headers.get(config.sharedSecretHeader) === config.sharedSecret;
}

export async function resolveTrustedHeaderAuthContext(
  request: AuthRequest
): Promise<PrivateAuthContext> {
  const config = await getConfigValue('TRUSTED_HEADER_AUTH_CONFIG');
  if (!config || !hasValidSharedSecret(config, request)) {
    return UNAUTHENTICATED_CONTEXT;
  }

  const id = request.headers.get(config.userIdHeader)?.trim();
  if (!id) {
    return UNAUTHENTICATED_CONTEXT;
  }

  const userName =
    (config.nameHeader && request.headers.get(config.nameHeader)?.trim()) ||
    (config.emailHeader && request.headers.get(config.emailHeader)?.trim()) ||
    id;
  const groups = config.groupsHeader
    ? splitGroupList(request.headers.get(config.groupsHeader) ?? '')
    : [];
  const isAdmin = config.adminHeader
    ? isTruthyHeaderValue(request.headers.get(config.adminHeader))
    : false;

  return {
    authEnabled: true,
    auth: { isValidToken: true },
    groups,
    isAdmin,
    id,
    userName,
  };
}
