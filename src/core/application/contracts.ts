import { z } from "zod";

export const CommandStatusSchema = z.enum([
  "SUCCEEDED",
  "ACCEPTED_ASYNC",
  "REVIEW_REQUIRED",
  "REJECTED",
  "NOT_AUTHORIZED",
  "CONFLICT",
  "FAILED",
]);
export type CommandStatus = z.infer<typeof CommandStatusSchema>;

export const ActionContextSchema = z.object({
  actor_user_id: z.string().uuid(),
  actor_person_id: z.string().uuid().nullable().optional(),
  acting_role: z.string().max(80).nullable().optional(),
  represented_person_id: z.string().uuid().nullable().optional(),
  mandate_id: z.string().uuid().nullable().optional(),
  correlation_id: z.string().uuid(),
  causation_id: z.string().uuid().nullable().optional(),
  locale: z.string().max(20).nullable().optional(),
  client_context: z.record(z.unknown()).optional(),
});
export type ActionContext = z.infer<typeof ActionContextSchema>;

export const CommandEnvelopeSchema = z.object({
  command_id: z.string().uuid(),
  command_name: z.string().regex(/^[A-Z][A-Za-z0-9]{2,119}$/),
  command_version: z.number().int().positive(),
  target_domain: z.string().min(1).max(80),
  target_entity_type: z.string().max(80).nullable().optional(),
  target_entity_id: z.string().uuid().nullable().optional(),
  action_context: ActionContextSchema,
  idempotency_key: z.string().min(8).max(200).nullable().optional(),
  expected_version: z.number().int().nonnegative().nullable().optional(),
  issued_at: z.string().datetime({ offset: true }),
  payload: z.unknown(),
});
export type CommandEnvelope<TPayload = unknown> = Omit<
  z.infer<typeof CommandEnvelopeSchema>,
  "payload"
> & { payload: TPayload };

export const CommandErrorSchema = z.object({
  code: z.string().min(1).max(120),
  message_key: z.string().min(1).max(160),
  safe_details: z.record(z.unknown()).optional(),
});
export type CommandError = z.infer<typeof CommandErrorSchema>;

export const CommandResultSchema = z.object({
  command_id: z.string().uuid(),
  status: CommandStatusSchema,
  target_ref: z.record(z.unknown()).nullable().optional(),
  resulting_version: z.number().int().nonnegative().nullable().optional(),
  emitted_event_ids: z.array(z.string().uuid()).default([]),
  warnings: z.array(z.string().max(200)).default([]),
  error: CommandErrorSchema.nullable().optional(),
});
export type CommandResult = z.infer<typeof CommandResultSchema>;

export interface ActionContextInput {
  actor_user_id: string;
  actor_person_id?: string | null;
  acting_role?: string | null;
  represented_person_id?: string | null;
  mandate_id?: string | null;
  correlation_id?: string;
  causation_id?: string | null;
  locale?: string | null;
  client_context?: Record<string, unknown>;
}

export type IdFactory = () => string;
const defaultIdFactory: IdFactory = () => crypto.randomUUID();

export function createActionContext(
  input: ActionContextInput,
  idFactory: IdFactory = defaultIdFactory,
): ActionContext {
  return ActionContextSchema.parse({
    ...input,
    correlation_id: input.correlation_id ?? idFactory(),
  });
}

export function createCommandEnvelope<TPayload>(params: {
  command_name: string;
  command_version?: number;
  target_domain: string;
  target_entity_type?: string | null;
  target_entity_id?: string | null;
  action_context: ActionContext;
  idempotency_key?: string | null;
  expected_version?: number | null;
  payload: TPayload;
  command_id?: string;
  issued_at?: string;
  idFactory?: IdFactory;
}): CommandEnvelope<TPayload> {
  const idFactory = params.idFactory ?? defaultIdFactory;
  const envelope = {
    command_id: params.command_id ?? idFactory(),
    command_name: params.command_name,
    command_version: params.command_version ?? 1,
    target_domain: params.target_domain,
    target_entity_type: params.target_entity_type,
    target_entity_id: params.target_entity_id,
    action_context: params.action_context,
    idempotency_key: params.idempotency_key,
    expected_version: params.expected_version,
    issued_at: params.issued_at ?? new Date().toISOString(),
    payload: params.payload,
  };
  CommandEnvelopeSchema.parse(envelope);
  return envelope;
}

export const COMMAND_ERROR_CODES = [
  "COMMAND_INVALID",
  "COMMAND_VERSION_UNSUPPORTED",
  "COMMAND_NOT_AUTHORIZED",
  "COMMAND_INVALID_STATE",
  "COMMAND_PRECONDITION_FAILED",
  "COMMAND_REFERENCE_NOT_FOUND",
  "COMMAND_REFERENCE_STALE",
  "COMMAND_DEPENDENCY_UNSATISFIED",
  "COMMAND_CONCURRENT_MODIFICATION",
  "COMMAND_REVIEW_REQUIRED",
  "COMMAND_ALREADY_PROCESSED",
  "IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_PAYLOAD",
] as const;
