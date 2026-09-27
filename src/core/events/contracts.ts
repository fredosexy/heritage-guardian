import { z } from "zod";
import type { ActionContext, IdFactory } from "@/core/application";

export const EventCategorySchema = z.enum([
  "DOMAIN_EVENT",
  "INTEGRATION_EVENT",
  "SYSTEM_EVENT",
  "AUDIT_EVENT",
]);
export const ConfidentialitySchema = z.enum([
  "NORMAL",
  "SENSITIVE",
  "HIGHLY_SENSITIVE",
  "SECRET",
]);
export const EventOriginSchema = z.enum([
  "APPLICATION",
  "PROCESS_MANAGER",
  "JOB",
  "SYSTEM",
  "IMPORT",
]);

export const DomainEventEnvelopeSchema = z.object({
  event_id: z.string().uuid(),
  event_name: z.string().regex(/^[a-z0-9-]+\.[a-z0-9-]+\.[a-z0-9-]+$/),
  event_version: z.number().int().positive(),
  event_category: EventCategorySchema,
  source_domain: z.string().min(1).max(80),
  source_entity_type: z.string().min(1).max(80),
  source_entity_id: z.string().uuid().nullable(),
  aggregate_version: z.number().int().nonnegative().nullable(),
  aggregate_sequence: z.number().int().nonnegative().nullable(),
  occurred_at: z.string().datetime({ offset: true }),
  recorded_at: z.string().datetime({ offset: true }),
  actor_user_id: z.string().uuid().nullable(),
  actor_person_id: z.string().uuid().nullable(),
  acting_role: z.string().max(80).nullable(),
  represented_person_id: z.string().uuid().nullable(),
  mandate_id: z.string().uuid().nullable(),
  correlation_id: z.string().uuid(),
  causation_id: z.string().uuid().nullable(),
  confidentiality: ConfidentialitySchema,
  event_origin: EventOriginSchema,
  payload: z.unknown(),
});
export type DomainEventEnvelope<TPayload = unknown> = Omit<
  z.infer<typeof DomainEventEnvelopeSchema>,
  "payload"
> & { payload: TPayload };

const defaultIdFactory: IdFactory = () => crypto.randomUUID();

export function createDomainEventEnvelope<TPayload>(params: {
  event_name: string;
  event_version?: number;
  event_category?: z.infer<typeof EventCategorySchema>;
  source_domain: string;
  source_entity_type: string;
  source_entity_id?: string | null;
  aggregate_version?: number | null;
  aggregate_sequence?: number | null;
  action_context: ActionContext;
  confidentiality?: z.infer<typeof ConfidentialitySchema>;
  event_origin?: z.infer<typeof EventOriginSchema>;
  payload: TPayload;
  event_id?: string;
  occurred_at?: string;
  recorded_at?: string;
  idFactory?: IdFactory;
}): DomainEventEnvelope<TPayload> {
  const idFactory = params.idFactory ?? defaultIdFactory;
  const now = new Date().toISOString();
  const event = {
    event_id: params.event_id ?? idFactory(),
    event_name: params.event_name,
    event_version: params.event_version ?? 1,
    event_category: params.event_category ?? "DOMAIN_EVENT",
    source_domain: params.source_domain,
    source_entity_type: params.source_entity_type,
    source_entity_id: params.source_entity_id ?? null,
    aggregate_version: params.aggregate_version ?? null,
    aggregate_sequence: params.aggregate_sequence ?? null,
    occurred_at: params.occurred_at ?? now,
    recorded_at: params.recorded_at ?? now,
    actor_user_id: params.action_context.actor_user_id ?? null,
    actor_person_id: params.action_context.actor_person_id ?? null,
    acting_role: params.action_context.acting_role ?? null,
    represented_person_id: params.action_context.represented_person_id ?? null,
    mandate_id: params.action_context.mandate_id ?? null,
    correlation_id: params.action_context.correlation_id,
    causation_id: params.action_context.causation_id ?? null,
    confidentiality: params.confidentiality ?? "NORMAL",
    event_origin: params.event_origin ?? "APPLICATION",
    payload: params.payload,
  };
  DomainEventEnvelopeSchema.parse(event);
  return event;
}
