import { describe, expect, it } from "vitest";
import { auditEventLabel, filterAuditEvents, groupAuditEventsByDay } from "@/services/audit-timeline";
import type { AuditEvent } from "@/data/audit.repo";

const event = (action: string, createdAt: string): AuditEvent => ({
  id: crypto.randomUUID(), actor_user_id: "u", actor_actor_id: null,
  on_behalf_of_user_id: null, dossier_id: "d", entity_type: "dossier",
  entity_id: "d", action, source: "backend", metadata: {},
  request_id: "r", created_at: createdAt,
});

describe("audit timeline", () => {
  it("keeps the essential rural view concise", () => {
    const events = [event("updated", "2026-09-27T10:00:00Z"), event("access_granted", "2026-09-27T11:00:00Z")];
    expect(filterAuditEvents(events, "essential").map((item) => item.action)).toEqual(["access_granted"]);
    expect(filterAuditEvents(events, "complete")).toHaveLength(2);
  });

  it("groups immutable events by server day", () => {
    const groups = groupAuditEventsByDay([
      event("created", "2026-09-27T10:00:00Z"),
      event("step_completed", "2026-09-28T10:00:00Z"),
    ]);
    expect(Object.keys(groups)).toEqual(["2026-09-27", "2026-09-28"]);
    expect(auditEventLabel("step_completed")).toBe("Étape terminée");
  });
});
