export type TrustedHeaderGrpcMetadataMapping = {
  inboundHeader: string;
  outboundKey: string;
};

export type TrustedHeaderAuthConfig = {
  userIdHeader: string;
  emailHeader?: string;
  nameHeader?: string;
  groupsHeader?: string;
  adminHeader?: string;
  grpcMetadataMap: TrustedHeaderGrpcMetadataMapping[];
  sharedSecretHeader?: string;
  sharedSecret?: string;
};
