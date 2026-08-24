import authStrategy from './auth-strategy';
import {
  type TrustedHeaderAuthConfig,
  type TrustedHeaderGrpcMetadataMapping,
} from './trusted-header-auth-config.types';

function parseGrpcMetadataMap(
  raw: string | undefined
): TrustedHeaderGrpcMetadataMapping[] {
  if (!raw?.trim()) {
    return [];
  }

  return raw.split(',').map((pair) => {
    const [inboundHeader, outboundKey] = pair.split(':').map((s) => s.trim());
    if (!inboundHeader || !outboundKey) {
      throw new Error(
        `CADENCE_WEB_TRUSTED_HEADER_GRPC_METADATA entry "${pair}" must be "inbound-header:outbound-key"`
      );
    }
    return { inboundHeader, outboundKey };
  });
}

export default function trustedHeaderAuthConfig(): TrustedHeaderAuthConfig | null {
  if (authStrategy() !== 'trusted-header') {
    return null;
  }

  const userIdHeader = process.env.CADENCE_WEB_TRUSTED_HEADER_USER_ID?.trim();
  if (!userIdHeader) {
    throw new Error(
      'CADENCE_WEB_AUTH_STRATEGY=trusted-header requires: CADENCE_WEB_TRUSTED_HEADER_USER_ID'
    );
  }

  const sharedSecretHeader =
    process.env.CADENCE_WEB_TRUSTED_HEADER_SHARED_SECRET_HEADER?.trim() ||
    undefined;
  const sharedSecret =
    process.env.CADENCE_WEB_TRUSTED_HEADER_SHARED_SECRET?.trim() || undefined;
  if (Boolean(sharedSecretHeader) !== Boolean(sharedSecret)) {
    throw new Error(
      'CADENCE_WEB_TRUSTED_HEADER_SHARED_SECRET_HEADER and CADENCE_WEB_TRUSTED_HEADER_SHARED_SECRET must be set together'
    );
  }

  return {
    userIdHeader,
    emailHeader:
      process.env.CADENCE_WEB_TRUSTED_HEADER_EMAIL?.trim() || undefined,
    nameHeader:
      process.env.CADENCE_WEB_TRUSTED_HEADER_NAME?.trim() || undefined,
    groupsHeader:
      process.env.CADENCE_WEB_TRUSTED_HEADER_GROUPS?.trim() || undefined,
    adminHeader:
      process.env.CADENCE_WEB_TRUSTED_HEADER_ADMIN?.trim() || undefined,
    grpcMetadataMap: parseGrpcMetadataMap(
      process.env.CADENCE_WEB_TRUSTED_HEADER_GRPC_METADATA
    ),
    sharedSecretHeader,
    sharedSecret,
  };
}
