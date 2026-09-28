import type { AuditEvent } from "@/data/audit.repo";

export type AuditAudience = "essential" | "complete";

const ESSENTIAL = new Set([
  "CREATED", "ARCHIVED", "PARTICIPANT_ADDED", "PARTICIPANT_REVOKED",
  "STEP_COMPLETED", "STEP_BLOCKED", "DOCUMENT_ADDED", "DOCUMENT_VERIFIED", "VERIFIED",
  "ACCESS_GRANTED", "ACCESS_REVOKED", "INTERVENTION_RECORDED",
  "SIGNALEMENT_CREATED", "SIGNALEMENT_STATUS_CHANGED",
]);

const ACTION_KEYS: Record<string, string> = {
  CREATED: "created",
  UPDATED: "updated",
  ARCHIVED: "archived",
  PARTICIPANT_ADDED: "participantAdded",
  PARTICIPANT_REVOKED: "participantRevoked",
  STEP_STARTED: "stepStarted",
  STEP_COMPLETED: "stepCompleted",
  STEP_BLOCKED: "stepBlocked",
  DOCUMENT_ADDED: "documentAdded",
  VERSION_ADDED: "versionAdded",
  DOCUMENT_VERIFIED: "documentVerified",
  VERIFIED: "verified",
  ACCESS_REQUESTED: "accessRequested",
  ACCESS_GRANTED: "accessGranted",
  ACCESS_REVOKED: "accessRevoked",
  INTERVENTION_RECORDED: "interventionRecorded",
  INTERVENTION_CORRECTED: "interventionCorrected",
  SIGNALEMENT_CREATED: "signalementCreated",
  SIGNALEMENT_STATUS_CHANGED: "signalementStatusChanged",
};

export const auditEventKey = (action: string) => `audit.actions.${ACTION_KEYS[action] ?? "unknown"}`;

export const filterAuditEvents = (events: AuditEvent[], audience: AuditAudience) =>
  audience === "complete" ? events : events.filter((event) => ESSENTIAL.has(event.action));

export function groupAuditEventsByDay(events: AuditEvent[]) {
  return events.reduce<Record<string, AuditEvent[]>>((groups, event) => {
    const day = event.occurred_at.slice(0, 10);
    (groups[day] ??= []).push(event);
    return groups;
  }, {});
}
