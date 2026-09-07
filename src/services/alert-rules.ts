import type { AlertSeverity, AlertType, Dossier } from "@/core/types/domain";

/**
 * Règles d'alertes réelles : calcul pur à partir de l'état des dossiers.
 * Chaque alerte porte une clé stable (dedupe_key) pour ne jamais être créée deux fois.
 */
export interface AlertCandidate {
  dedupe_key: string;
  type: AlertType;
  severity: AlertSeverity;
  /** Clé i18n du titre */
  titleKey: string;
  /** Clé i18n du message */
  messageKey: string;
  /** Valeurs d'interpolation i18n */
  vars: Record<string, string | number>;
  action_label_key: string;
  action_route: string;
  related_dossier_id: string | null;
}

export interface AlertRulesInput {
  dossiers: Dossier[];
  /** Nombre de preuves par dossier */
  proofCountByDossier: Record<string, number>;
  /** Nombre d'héritiers / participants par dossier */
  participantCountByDossier: Record<string, number>;
  /** Profil incomplet ? */
  profileIncomplete: boolean;
}

const STALE_DAYS = 30;

function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

export function computeAlertCandidates(input: AlertRulesInput): AlertCandidate[] {
  const out: AlertCandidate[] = [];

  for (const d of input.dossiers) {
    const proofs = input.proofCountByDossier[d.id] ?? 0;
    const participants = input.participantCountByDossier[d.id] ?? 0;

    if (proofs === 0) {
      out.push({
        dedupe_key: `no-proof:${d.id}`,
        type: "urgent",
        severity: "high",
        titleKey: "alertRules.noProof.title",
        messageKey: "alertRules.noProof.message",
        vars: { title: d.title },
        action_label_key: "alertRules.noProof.action",
        action_route: `/dossiers/${d.id}`,
        related_dossier_id: d.id,
      });
    }

    if (participants === 0) {
      out.push({
        dedupe_key: `no-heir:${d.id}`,
        type: "info",
        severity: "medium",
        titleKey: "alertRules.noHeir.title",
        messageKey: "alertRules.noHeir.message",
        vars: { title: d.title },
        action_label_key: "alertRules.noHeir.action",
        action_route: `/dossiers/${d.id}`,
        related_dossier_id: d.id,
      });
    }

    if (d.status === "risk") {
      out.push({
        dedupe_key: `at-risk:${d.id}`,
        type: "urgent",
        severity: "high",
        titleKey: "alertRules.atRisk.title",
        messageKey: "alertRules.atRisk.message",
        vars: { title: d.title },
        action_label_key: "alertRules.atRisk.action",
        action_route: `/dossiers/${d.id}`,
        related_dossier_id: d.id,
      });
    }

    if (proofs > 0 && daysSince(d.updated_at) >= STALE_DAYS) {
      out.push({
        dedupe_key: `stale:${d.id}:${Math.floor(daysSince(d.updated_at) / STALE_DAYS)}`,
        type: "suggestion",
        severity: "low",
        titleKey: "alertRules.stale.title",
        messageKey: "alertRules.stale.message",
        vars: { title: d.title, days: daysSince(d.updated_at) },
        action_label_key: "alertRules.stale.action",
        action_route: `/dossiers/${d.id}`,
        related_dossier_id: d.id,
      });
    }
  }

  if (input.dossiers.length === 0) {
    out.push({
      dedupe_key: "no-dossier",
      type: "suggestion",
      severity: "medium",
      titleKey: "alertRules.noDossier.title",
      messageKey: "alertRules.noDossier.message",
      vars: {},
      action_label_key: "alertRules.noDossier.action",
      action_route: "/create",
      related_dossier_id: null,
    });
  }

  if (input.profileIncomplete) {
    out.push({
      dedupe_key: "profile-incomplete",
      type: "info",
      severity: "low",
      titleKey: "alertRules.profile.title",
      messageKey: "alertRules.profile.message",
      vars: {},
      action_label_key: "alertRules.profile.action",
      action_route: "/profile",
      related_dossier_id: null,
    });
  }

  return out;
}
