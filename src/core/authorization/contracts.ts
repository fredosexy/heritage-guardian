import { z } from "zod";

export const ApplicationRoleSchema = z.enum([
  "TITULAIRE",
  "CASE_ADMIN",
  "MANAGER",
  "CONTRIBUTOR",
  "PARTICIPANT",
  "READER",
  "REPRESENTATIVE",
  "COMPANION",
  "PROFESSIONAL",
  "MEDIATOR",
  "WITNESS",
  "ADMINISTRATIVE_ACTOR",
]);
export type ApplicationRole = z.infer<typeof ApplicationRoleSchema>;

export const AuthorizationScopeSchema = z.enum([
  "GLOBAL",
  "FAMILY",
  "ASSET",
  "CASE",
  "INHERITANCE",
  "TRANSMISSION",
  "CONFLICT",
  "PROCEDURE",
  "MISSION",
  "DOCUMENT",
  "ALERT",
  "ECONOMIC_ACTIVITY",
]);
export type AuthorizationScope = z.infer<typeof AuthorizationScopeSchema>;

export const CommonPermissionSchema = z.enum([
  "VIEW",
  "CONTRIBUTE",
  "UPLOAD_DOCUMENT",
  "EDIT",
  "MANAGE_DOCUMENTS",
  "MANAGE_PARTICIPANTS",
  "MANAGE_PROCEDURES",
  "MANAGE_CONFLICT",
  "GRANT_ACCESS",
  "REVOKE_ACCESS",
  "ARCHIVE",
  "REMOVE_FROM_CASE",
  "REMOVE_LINK",
  "SOFT_DELETE",
  "RESTORE",
  "EXPORT",
  "ADMIN_CASE",
]);
export type CommonPermission = z.infer<typeof CommonPermissionSchema>;

export const AuthorizationDecisionSchema = z.object({
  allowed: z.boolean(),
  permission: z.string().min(1).max(80),
  scope_type: AuthorizationScopeSchema,
  scope_id: z.string().uuid().nullable(),
  basis: z.array(z.string().max(120)),
  restrictions: z.array(z.string().max(120)),
  reason_code: z.string().max(120),
  decision_version: z.number().int().positive(),
  evaluated_at: z.string().datetime({ offset: true }),
});
export type AuthorizationDecision = z.infer<typeof AuthorizationDecisionSchema>;

/**
 * Client code may render this decision, but never treats it as durable authority.
 * Sensitive commands must re-evaluate authorization on the server.
 */
export function deniedDecision(params: {
  permission: string;
  scope_type: AuthorizationScope;
  scope_id?: string | null;
  reason_code: string;
  restrictions?: string[];
}): AuthorizationDecision {
  return {
    allowed: false,
    permission: params.permission,
    scope_type: params.scope_type,
    scope_id: params.scope_id ?? null,
    basis: [],
    restrictions: params.restrictions ?? [],
    reason_code: params.reason_code,
    decision_version: 1,
    evaluated_at: new Date().toISOString(),
  };
}
