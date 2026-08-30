/**
 * Jauge « profil complété » : service pur, réutilisable par l'accueil,
 * l'espace utilisateur et l'assistant. Jamais bloquant, seulement incitatif.
 */

export interface ProfileCompletionInput {
  hasAccount: boolean;
  firstName?: string | null;
  phone?: string | null;
  hasLocation: boolean;
  dossierCount: number;
}

export interface CompletionStep {
  id: "firstName" | "account" | "location" | "phone" | "firstDossier";
  weight: number;
  done: boolean;
  /** Clé i18n de l'invitation douce. */
  labelKey: string;
  /** Route conseillée pour avancer. */
  route: string;
}

export interface ProfileCompletion {
  percent: number;
  steps: CompletionStep[];
  missing: CompletionStep[];
  /** Prochaine action suggérée (la plus utile en premier). */
  next: CompletionStep | null;
}

export function computeProfileCompletion(input: ProfileCompletionInput): ProfileCompletion {
  const steps: CompletionStep[] = [
    {
      id: "firstName",
      weight: 20,
      done: !!input.firstName?.trim(),
      labelKey: "completion.stepFirstName",
      route: "/profile",
    },
    {
      id: "firstDossier",
      weight: 20,
      done: input.dossierCount > 0,
      labelKey: "completion.stepFirstDossier",
      route: "/create",
    },
    {
      id: "account",
      weight: 30,
      done: input.hasAccount,
      labelKey: "completion.stepAccount",
      route: "/auth",
    },
    {
      id: "location",
      weight: 15,
      done: input.hasLocation,
      labelKey: "completion.stepLocation",
      route: "/profile",
    },
    {
      id: "phone",
      weight: 15,
      done: !!input.phone?.trim(),
      labelKey: "completion.stepPhone",
      route: "/profile",
    },
  ];

  const percent = Math.min(
    100,
    steps.reduce((total, step) => total + (step.done ? step.weight : 0), 0)
  );
  const missing = steps.filter((step) => !step.done);

  return { percent, steps, missing, next: missing[0] ?? null };
}
