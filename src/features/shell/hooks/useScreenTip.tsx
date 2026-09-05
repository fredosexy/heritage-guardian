import { useCallback, useState } from "react";
import { useLocation } from "react-router-dom";
import { buildScreenTip, type ScreenTip } from "@/services";
import { useIdentity } from "@/features/identity";
import { useDossiers } from "@/features/dossiers/hooks/useDossiers";
import { useUnreadAlerts } from "@/features/alerts/hooks/useAlerts";

const DISMISS_PREFIX = "memoire.tip.";

function isDismissed(id: string) {
  try {
    return sessionStorage.getItem(DISMISS_PREFIX + id) === "1";
  } catch {
    return false;
  }
}

/** Liaison état ↔ UI : la phrase d'accueil de l'assistant pour l'écran courant. */
export function useScreenTip(options?: { fileCount?: number }) {
  const { pathname } = useLocation();
  const { isGuest } = useIdentity();
  const { dossiers } = useDossiers();
  const { alerts } = useUnreadAlerts(5);
  const [dismissedAt, setDismissedAt] = useState(0);

  const tip: ScreenTip = buildScreenTip({
    pathname,
    isGuest,
    dossierCount: dossiers.length,
    unreadAlertCount: alerts.length,
    incompleteCount: dossiers.filter((d) => d.status !== "secure").length,
    fileCount: options?.fileCount,
  });

  const dismiss = useCallback(() => {
    try {
      sessionStorage.setItem(DISMISS_PREFIX + tip.id, "1");
    } catch {
      /* stockage indisponible : on masque simplement pour cette vue */
    }
    setDismissedAt(Date.now());
  }, [tip.id]);

  const hidden = dismissedAt > 0 || isDismissed(tip.id);

  return { tip, hidden, dismiss };
}
