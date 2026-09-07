import { alertsRepo, dossiersRepo, participantsRepo, profilesRepo, proofsRepo } from "@/data";
import { supabase } from "@/integrations/supabase/client";
import type { Alert } from "@/core/types/domain";
import { computeAlertCandidates } from "./alert-rules";
import { computeProfileCompletion } from "./profile-completion";

type Translate = (key: string, vars?: Record<string, string | number>) => string;

/**
 * Génère les alertes réelles depuis l'état des dossiers, puis demande
 * l'envoi d'un e-mail récapitulatif pour les nouvelles alertes importantes.
 */
export async function syncAlerts(userId: string, t: Translate): Promise<Alert[]> {
  const [dossiers, profile] = await Promise.all([
    dossiersRepo.listDossiers(userId),
    profilesRepo.getProfile(userId),
  ]);

  const [proofCountByDossier, participantCountByDossier] = await Promise.all([
    proofsRepo.countProofsByDossier(userId),
    participantsRepo.countParticipantsByDossier(dossiers.map((d) => d.id)),
  ]);

  const completion = profile
    ? computeProfileCompletion({
        fullName: profile.full_name,
        phone: profile.phone,
        avatarUrl: profile.avatar_url,
        onboardingCompleted: profile.onboarding_completed,
        dossierCount: dossiers.length,
      })
    : null;

  const candidates = computeAlertCandidates({
    dossiers,
    proofCountByDossier,
    participantCountByDossier,
    profileIncomplete: completion ? completion.percent < 100 : false,
  });

  const created = await alertsRepo.upsertAlerts(
    candidates.map((c) => ({
      user_id: userId,
      dedupe_key: c.dedupe_key,
      type: c.type,
      severity: c.severity,
      title: t(c.titleKey, c.vars),
      message: t(c.messageKey, c.vars),
      action_label: t(c.action_label_key),
      action_route: c.action_route,
      related_dossier_id: c.related_dossier_id,
    }))
  );

  if (created.length > 0 && profile?.email_alerts !== false) {
    void notifyByEmail(created);
  }

  return alertsRepo.listAlerts(userId);
}

/** Envoi silencieux : si l'e-mail n'est pas disponible, l'app continue normalement. */
async function notifyByEmail(alerts: Alert[]): Promise<void> {
  const important = alerts.filter((a) => a.severity !== "low");
  if (important.length === 0) return;
  try {
    const { error } = await supabase.functions.invoke("notify-alerts", {
      body: { alertIds: important.map((a) => a.id) },
    });
    if (!error) await alertsRepo.markEmailSent(important.map((a) => a.id));
  } catch {
    /* e-mail indisponible : on n'interrompt jamais le parcours */
  }
}
