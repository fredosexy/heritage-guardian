import type { AuditEvent } from "@/data/audit.repo";

export type AuditAudience = "essential" | "complete";

const ESSENTIAL_ACTIONS = new Set([
  "created","archived","participant_added","participant_revoked","step_completed","step_blocked",
  "document_added","verified","access_granted","access_revoked","intervention_recorded",
  "signalement_created","signalement_status_changed",
]);

const LABELS: Record<string, string> = {
  created: "Dossier créé", updated: "Dossier mis à jour", archived: "Dossier archivé",
  participant_added: "Participant ajouté", participant_revoked: "Accès d’un participant retiré",
  step_started: "Étape commencée", step_completed: "Étape terminée", step_blocked: "Étape bloquée",
  document_added: "Document ajouté", version_added: "Nouvelle version du document", verified: "Vérification enregistrée",
  access_requested: "Accès demandé", access_granted: "Accès accordé", access_revoked: "Accès retiré",
  intervention_recorded: "Intervention enregistrée", intervention_corrected: "Intervention corrigée",
  actor_verified: "Acteur vérifié", actor_suspended: "Acteur suspendu", actor_revoked: "Habilitation retirée",
  signalement_created: "Fait signalé", signalement_status_changed: "Statut du signalement modifié",
  procedure_published: "Procédure publiée", procedure_archived: "Procédure archivée",
};

export function auditEventLabel(action: string) {
  return LABELS[action] ?? "Événement enregistré";
}

export function filterAuditEvents(events: AuditEvent[], audience: AuditAudience) {
  return audience === "complete" ? events : events.filter((event) => ESSENTIAL_ACTIONS.has(event.action));
}

export function groupAuditEventsByDay(events: AuditEvent[]) {
  return events.reduce<Record<string, AuditEvent[]>>((groups, event) => {
    const day = event.created_at.slice(0, 10);
    (groups[day] ??= []).push(event);
    return groups;
  }, {});
}
