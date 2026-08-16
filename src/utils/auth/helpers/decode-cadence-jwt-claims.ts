import { type CadenceJwtClaims } from '../auth.types';

import { cadenceJwtClaimsSchema } from './cadence-jwt-claims-schema';
import { decodeJwtPayload } from './decode-jwt-payload';

export function decodeCadenceJwtClaims(
  token: string
): CadenceJwtClaims | undefined {
  const parsed = decodeJwtPayload(token);
  if (parsed === undefined) {
    return undefined;
  }

  const result = cadenceJwtClaimsSchema.safeParse(parsed);
  return result.success ? result.data : undefined;
}
