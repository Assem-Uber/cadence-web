import { resolveGrpcMetadataForAuth } from '@/utils/auth/auth-context';
import { type GRPCMetadata } from '@/utils/grpc/grpc-service';

import { type MiddlewareFunction } from '../route-handlers-middleware.types';

import { type AuthInfoMiddlewareContext } from './auth-info.types';

const grpcMetadata: MiddlewareFunction<
  ['grpcMetadata', GRPCMetadata | undefined]
> = async (request, _options, ctx) => {
  const authContext = ctx.authInfo as AuthInfoMiddlewareContext | undefined;
  const metadata = await resolveGrpcMetadataForAuth(authContext, {
    cookies: request.cookies,
    headers: request.headers,
  });
  return ['grpcMetadata', metadata];
};

export default grpcMetadata;
