/**
 * Assistant d'accueil contextuel : une seule phrase utile par écran.
 * Service pur — aucune dépendance UI, testable.
 */

export interface ScreenTipInput {
  /** Chemin de l'écran courant. */
  pathname: string;
  isGuest: boolean;
  dossierCount: number;
  unreadAlertCount: number;
  /** Nombre de dossiers encore incomplets. */
  incompleteCount?: number;
  /** Nombre de fichiers déjà ajoutés. */
  fileCount?: number;
}

export interface ScreenTip {
  /** Identifiant stable, sert aussi à mémoriser un rejet. */
  id: string;
  /** Clé i18n de la phrase affichée. */
  messageKey: string;
  messageParams?: Record<string, number | string>;
  /** Clé i18n de la question envoyée à l'assistant au clic. */
  askKey: string;
}

/** Phrase d'accueil de l'assistant, adaptée à l'écran et à l'état de l'utilisateur. */
export function buildScreenTip(input: ScreenTipInput): ScreenTip {
  const { pathname, isGuest, dossierCount, unreadAlertCount, incompleteCount = 0, fileCount = 0 } = input;

  if (pathname === "/alerts") {
    return unreadAlertCount > 0
      ? { id: "alerts-unread", messageKey: "tip.alertsUnread", messageParams: { count: unreadAlertCount }, askKey: "tip.askAlerts" }
      : { id: "alerts-calm", messageKey: "tip.alertsCalm", askKey: "tip.askAlerts" };
  }

  if (pathname === "/files") {
    return fileCount === 0
      ? { id: "files-empty", messageKey: "tip.filesEmpty", askKey: "tip.askFiles" }
      : { id: "files-some", messageKey: "tip.filesSome", messageParams: { count: fileCount }, askKey: "tip.askFiles" };
  }

  if (pathname === "/profile") {
    return isGuest
      ? { id: "profile-guest", messageKey: "tip.profileGuest", askKey: "tip.askAccount" }
      : { id: "profile-auth", messageKey: "tip.profileAuth", askKey: "tip.askProfile" };
  }

  if (pathname === "/dossiers") {
    if (dossierCount === 0) return { id: "dossiers-empty", messageKey: "tip.dossiersEmpty", askKey: "tip.askFirstDossier" };
    if (incompleteCount > 0)
      return {
        id: "dossiers-incomplete",
        messageKey: "tip.dossiersIncomplete",
        messageParams: { count: incompleteCount },
        askKey: "tip.askStrengthen",
      };
    return { id: "dossiers-ok", messageKey: "tip.dossiersOk", askKey: "tip.askNextStep" };
  }

  // Accueil et écrans principaux restants.
  if (dossierCount === 0) return { id: "home-empty", messageKey: "tip.homeEmpty", askKey: "tip.askFirstDossier" };
  if (isGuest) return { id: "home-guest", messageKey: "tip.homeGuest", askKey: "tip.askAccount" };
  if (unreadAlertCount > 0)
    return {
      id: "home-alerts",
      messageKey: "tip.homeAlerts",
      messageParams: { count: unreadAlertCount },
      askKey: "tip.askAlerts",
    };
  if (incompleteCount > 0)
    return {
      id: "home-incomplete",
      messageKey: "tip.homeIncomplete",
      messageParams: { count: incompleteCount },
      askKey: "tip.askStrengthen",
    };
  return { id: "home-ok", messageKey: "tip.homeOk", askKey: "tip.askNextStep" };
}
