import { useLocation } from "react-router-dom";
import { computeNextAction, type NextAction } from "@/services";
import { useIdentity } from "@/features/identity";
import { useDossiers } from "@/features/dossiers/hooks/useDossiers";
import { useUnreadAlerts } from "@/features/alerts/hooks/useAlerts";
import { useProfileCompletion } from "@/features/profile";

/** Liaison état ↔ UI : la seule action suivante conseillée sur l'écran courant. */
export function useNextAction(): NextAction {
  const { pathname } = useLocation();
  const { isGuest } = useIdentity();
  const { dossiers } = useDossiers();
  const { alerts } = useUnreadAlerts(5);
  const { next } = useProfileCompletion();

  return computeNextAction({
    pathname,
    isGuest,
    dossierCount: dossiers.length,
    unreadAlertCount: alerts.length,
    missingProfileStep: next ? { labelKey: next.labelKey, route: next.route } : null,
  });
}
