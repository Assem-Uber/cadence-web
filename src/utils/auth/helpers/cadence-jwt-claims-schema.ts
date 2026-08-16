import { z } from 'zod';

/**
 * TODO(cadence-backend): claim shape mirrors the Cadence OSS OAuth
 * authorizer (sub/name/groups/admin). Custom backend auth providers may
 * issue different claims; these are decoded (not verified) for UI hints
 * only and should move behind a backend introspection API when available.
 */
export const cadenceJwtClaimsSchema = z
  .object({
    admin: z.boolean().optional(),
    exp: z.number().optional(),
    groups: z.string().optional(),
    name: z.string().trim().min(1).optional(),
    sub: z.string().trim().min(1).optional(),
  })
  .refine((claims) => claims.sub !== undefined || claims.name !== undefined, {
    message: 'JWT claims must include sub or name',
  });
