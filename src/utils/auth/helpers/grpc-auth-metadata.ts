import { type GRPCMetadata } from '@/utils/grpc/grpc-service';

import { type PrivateAuthContext } from '../auth.types';

export function getGrpcMetadataFromAuth(
  authContext: PrivateAuthContext | null | undefined
): GRPCMetadata | undefined {
  if (!authContext?.authEnabled || !authContext.auth.token) {
    return undefined;
  }

  return {
    'cadence-authorization': authContext.auth.token,
  };
}
