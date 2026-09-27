import { z } from "zod";

export const AuditResultSchema = z.enum([
  "SUCCEEDED",
  "DENIED",
  "REJECTED",
  "FAILED",
  "REVIEW_REQUIRED",
  "ACCEPTED_ASYNC",
]);

export const AuditEventSchema = z.object({
  id: z.string().uuid().optional(),
  event_type: z.enum(["ACTION", "AUTHORIZATION", "COMMAND", "SECURITY", "SYSTEM"]),
  actor_user_id: z.string().uuid().nullable(),
  actor_person_id: z.string().uuid().nullable(),
  acting_role: z.string().max(80).nullable(),
  represented_person_id: z.string().uuid().nullable(),
  mandate_id: z.string().uuid().nullable(),
  permission: z.string().max(80).nullable(),
  scope_type: z.string().max(80).nullable(),
  scope_id: z.string().uuid().nullable(),
  action: z.string().min(1).max(160),
  target_domain: z.string().min(1).max(80),
  target_type: z.string().max(80).nullable(),
  target_id: z.string().uuid().nullable(),
  result: AuditResultSchema,
  reason_code: z.string().max(160).nullable(),
  command_id: z.string().uuid().nullable(),
  correlation_id: z.string().uuid(),
  causation_id: z.string().uuid().nullable(),
  safe_context: z.record(z.unknown()),
  occurred_at: z.string().datetime({ offset: true }),
});
export type AuditEvent = z.infer<typeof AuditEventSchema>;

const SENSITIVE_KEYS = /password|token|secret|authorization|cookie|document_content|raw_file|exact_coordinates/i;

/**
 * Removes obviously sensitive keys before a context is eligible for structured audit.
 * Server-side audit writers must still pass only data explicitly allowed by their contract.
 */
export function sanitizeAuditContext(
  input: Record<string, unknown>,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(input).filter(([key]) => !SENSITIVE_KEYS.test(key)),
  );
}

export function createCorrelationId(): string {
  return crypto.randomUUID();
}
