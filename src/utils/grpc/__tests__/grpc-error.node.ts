import * as grpc from '@grpc/grpc-js';

import { getHTTPStatusCode, GRPCError } from '../grpc-error';

/**
 * Simulates a GRPCError constructed by another webpack compilation's copy of
 * the class: same shape and name, but not created by this class.
 */
function buildForeignGrpcError(): Error {
  const error = new Error('denied') as Error & {
    grpcStatusCode: number;
    httpStatusCode: number;
  };
  error.name = 'GRPCError';
  error.grpcStatusCode = grpc.status.PERMISSION_DENIED;
  error.httpStatusCode = 403;
  return error;
}

describe(GRPCError.name, () => {
  it('recognizes own instances via instanceof', () => {
    const error = new GRPCError('denied', {
      grpcStatusCode: grpc.status.PERMISSION_DENIED,
    });
    expect(error instanceof GRPCError).toBe(true);
    expect(getHTTPStatusCode(error)).toBe(403);
  });

  it('recognizes instances from another bundle copy of the class', () => {
    const error = buildForeignGrpcError();
    expect(error instanceof GRPCError).toBe(true);
    expect(getHTTPStatusCode(error)).toBe(403);
  });

  it('does not recognize plain errors', () => {
    expect(new Error('nope') instanceof GRPCError).toBe(false);
    expect(getHTTPStatusCode(new Error('nope'))).toBe(500);
  });
});
