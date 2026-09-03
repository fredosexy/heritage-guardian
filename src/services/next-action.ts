/**
 * Navigation zéro-blocage : chaque écran a une seule action suivante évidente.
 * Service pur — aucune dépendance UI, testable.
 */

export type NextActionIcon = "create" | "proof" | "account" | "alert" | "assistant" | "dossiers" | "profile";

export interface NextAction {
  /** Clé i18n de l'intitulé de l'action. */
  labelKey: string;
  /** Clé i18n de la phrase d'explication (langage humain). */
  hintKey: string;
  route: string;
  icon: NextActionIcon;
}

export interface NextActionInput {
  /** Chemin de l'écran courant. */
  pathname: string;
  isGuest: boolean;
  dossierCount: number;
  unreadAlertCount: number;
  /** Étape de profil encore manquante, si elle existe. */
  missingProfileStep?: { labelKey: string; route: string } | null;
}

/** Action centrale de la barre d'onglets : dépend de l'écran affiché. */
export function centralAction(pathname: string): NextAction {
  if (pathname.startsWith("/dossiers/")) {
    return {
      labelKey: "next.addProof",
      hintKey: "next.addProofHint",
      route: "#proofs",
      icon: "proof",
    };
  }
  if (pathname.startsWith("/assistant")) {
    return { labelKey: "next.createDossier", hintKey: "next.createDossierHint", route: "/create", icon: "create" };
  }
  return { labelKey: "next.createDossier", hintKey: "next.createDossierHint", route: "/create", icon: "create" };
}

/** Prochaine action conseillée sur l'écran courant. Jamais nulle : aucun cul-de-sac. */
export function computeNextAction(input: NextActionInput): NextAction {
  const { pathname, isGuest, dossierCount, unreadAlertCount, missingProfileStep } = input;

  if (dossierCount === 0 && !pathname.startsWith("/create")) {
    return { labelKey: "next.createDossier", hintKey: "next.firstDossierHint", route: "/create", icon: "create" };
  }

  if (unreadAlertCount > 0 && !pathname.startsWith("/alerts")) {
    return { labelKey: "next.seeAlerts", hintKey: "next.seeAlertsHint", route: "/alerts", icon: "alert" };
  }

  if (isGuest) {
    return { labelKey: "next.createAccount", hintKey: "next.createAccountHint", route: "/auth", icon: "account" };
  }

  if (missingProfileStep && !pathname.startsWith("/profile")) {
    return {
      labelKey: missingProfileStep.labelKey,
      hintKey: "next.profileHint",
      route: missingProfileStep.route,
      icon: "profile",
    };
  }

  if (!pathname.startsWith("/assistant")) {
    return { labelKey: "next.askAssistant", hintKey: "next.askAssistantHint", route: "/assistant", icon: "assistant" };
  }

  return { labelKey: "next.seeDossiers", hintKey: "next.seeDossiersHint", route: "/dossiers", icon: "dossiers" };
}

/** Écran parent, pour un retour toujours prévisible même en arrivée directe. */
export function parentRoute(pathname: string): string {
  if (pathname.startsWith("/dossiers/")) return "/dossiers";
  if (pathname === "/files") return "/profile";
  if (pathname === "/create" || pathname === "/assistant" || pathname === "/auth") return "/";
  return "/";
}
