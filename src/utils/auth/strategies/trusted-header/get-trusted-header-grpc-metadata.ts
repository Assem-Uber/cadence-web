import 'server-only';

import { type AuthRequest } from '@/utils/auth/auth.types';
import getConfigValue from '@/utils/config/get-config-value';
import { type GRPCMetadata } from '@/utils/grpc/grpc-service';

export async function getTrustedHeaderGrpcMetadata(
  request: AuthRequest
): Promise<GRPCMetadata | undefined> {
  const config = await getConfigValue('TRUSTED_HEADER_AUTH_CONFIG');
  if (!config || config.grpcMetadataMap.length === 0) {
    return undefined;
  }

  const metadata: GRPCMetadata = {};
  for (const { inboundHeader, outboundKey } of config.grpcMetadataMap) {
    const value = request.headers.get(inboundHeader);
    if (value) {
      metadata[outboundKey] = value;
    }
  }

  return Object.keys(metadata).length > 0 ? metadata : undefined;
}
