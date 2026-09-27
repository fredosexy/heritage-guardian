import { describe, expect, it } from "vitest";
import {
  ActionContextSchema,
  CommandEnvelopeSchema,
  createActionContext,
  createCommandEnvelope,
} from "@/core/application";
import {
  DomainEventEnvelopeSchema,
  createDomainEventEnvelope,
} from "@/core/events";
import { deniedDecision } from "@/core/authorization";

const USER_ID = "11111111-1111-4111-8111-111111111111";
const CORRELATION_ID = "22222222-2222-4222-8222-222222222222";
const COMMAND_ID = "33333333-3333-4333-8333-333333333333";
const EVENT_ID = "44444444-4444-4444-8444-444444444444";
const ENTITY_ID = "55555555-5555-4555-8555-555555555555";

describe("Phase A canonical contracts", () => {
  it("creates an action context with explicit correlation id", () => {
    const context = createActionContext({
      actor_user_id: USER_ID,
      correlation_id: CORRELATION_ID,
      acting_role: "CASE_ADMIN",
    });

    expect(ActionContextSchema.parse(context).correlation_id).toBe(CORRELATION_ID);
    expect(context.actor_user_id).toBe(USER_ID);
  });

  it("creates a versioned command envelope", () => {
    const context = createActionContext({
      actor_user_id: USER_ID,
      correlation_id: CORRELATION_ID,
    });

    const command = createCommandEnvelope({
      command_id: COMMAND_ID,
      command_name: "CreateCase",
      command_version: 1,
      target_domain: "case",
      target_entity_type: "Case",
      target_entity_id: ENTITY_ID,
      action_context: context,
      idempotency_key: "phase-a-test-key",
      payload: { title: "Test" },
      issued_at: "2026-09-27T10:00:00.000Z",
    });

    expect(CommandEnvelopeSchema.parse(command).command_id).toBe(COMMAND_ID);
    expect(command.action_context.correlation_id).toBe(CORRELATION_ID);
  });

  it("rejects malformed command names", () => {
    const result = CommandEnvelopeSchema.safeParse({
      command_id: COMMAND_ID,
      command_name: "create_case",
      command_version: 1,
      target_domain: "case",
      action_context: {
        actor_user_id: USER_ID,
        correlation_id: CORRELATION_ID,
      },
      issued_at: "2026-09-27T10:00:00.000Z",
      payload: {},
    });

    expect(result.success).toBe(false);
  });

  it("creates a domain event envelope preserving actor and correlation", () => {
    const context = createActionContext({
      actor_user_id: USER_ID,
      correlation_id: CORRELATION_ID,
    });

    const event = createDomainEventEnvelope({
      event_id: EVENT_ID,
      event_name: "case.case.created",
      event_version: 1,
      source_domain: "case",
      source_entity_type: "Case",
      source_entity_id: ENTITY_ID,
      aggregate_version: 1,
      aggregate_sequence: 1,
      action_context: context,
      payload: { case_id: ENTITY_ID },
      occurred_at: "2026-09-27T10:00:00.000Z",
      recorded_at: "2026-09-27T10:00:00.000Z",
    });

    expect(DomainEventEnvelopeSchema.parse(event).event_id).toBe(EVENT_ID);
    expect(event.actor_user_id).toBe(USER_ID);
    expect(event.correlation_id).toBe(CORRELATION_ID);
  });

  it("rejects CRUD-like malformed event names", () => {
    const result = DomainEventEnvelopeSchema.safeParse({
      event_id: EVENT_ID,
      event_name: "case.updated",
      event_version: 1,
      event_category: "DOMAIN_EVENT",
      source_domain: "case",
      source_entity_type: "Case",
      source_entity_id: ENTITY_ID,
      aggregate_version: 1,
      aggregate_sequence: 1,
      occurred_at: "2026-09-27T10:00:00.000Z",
      recorded_at: "2026-09-27T10:00:00.000Z",
      actor_user_id: USER_ID,
      actor_person_id: null,
      acting_role: null,
      represented_person_id: null,
      mandate_id: null,
      correlation_id: CORRELATION_ID,
      causation_id: null,
      confidentiality: "NORMAL",
      event_origin: "APPLICATION",
      payload: {},
    });

    expect(result.success).toBe(false);
  });

  it("creates an explicit denied authorization decision", () => {
    const decision = deniedDecision({
      permission: "EDIT",
      scope_type: "CASE",
      scope_id: ENTITY_ID,
      reason_code: "EXPLICIT_DENY",
      restrictions: ["DENY_OVERRIDES_ALLOW"],
    });

    expect(decision.allowed).toBe(false);
    expect(decision.reason_code).toBe("EXPLICIT_DENY");
    expect(decision.restrictions).toContain("DENY_OVERRIDES_ALLOW");
  });
});
