import { describe, expect, it } from "vitest";
import { auditEventKey, filterAuditEvents, groupAuditEventsByDay } from "@/services/audit-timeline";
import type { AuditEvent } from "@/data/audit.repo";

const event = (action: string, occurredAt: string): AuditEvent => ({
  id: crypto.randomUUID(), event_type: "ACTION", actor_user_id: "u", actor_person_id: null,
  acting_role: null, represented_person_id: null, mandate_id: null, permission: null,
  scope_type: "CASE", scope_id: "d", action, target_domain: "DOSSIER",
  target_type: "DOSSIER", target_id: "d", result: "SUCCEEDED", reason_code: null,
  command_id: null, correlation_id: crypto.randomUUID(), causation_id: null,
  safe_context: { source: "BACKEND" }, occurred_at: occurredAt, created_at: occurredAt,
});

describe("audit timeline", () => {
  it("keeps essential view concise", () => {
    const events = [event("UPDATED", "2026-09-27T10:00:00Z"), event("ACCESS_GRANTED", "2026-09-27T11:00:00Z")];
    expect(filterAuditEvents(events, "essential").map((item) => item.action)).toEqual(["ACCESS_GRANTED"]);
    expect(filterAuditEvents(events, "complete")).toHaveLength(2);
  });

  it("groups by server day and exposes i18n keys", () => {
    const groups = groupAuditEventsByDay([
      event("CREATED", "2026-09-27T10:00:00Z"),
      event("STEP_COMPLETED", "2026-09-28T10:00:00Z"),
    ]);
    expect(Object.keys(groups)).toEqual(["2026-09-27", "2026-09-28"]);
    expect(auditEventKey("STEP_COMPLETED")).toBe("audit.actions.stepCompleted");
    expect(auditEventKey("UNLISTED")).toBe("audit.actions.unknown");
  });
});
