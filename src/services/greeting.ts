/**
 * Accueil humain : salutation et phrase de contexte (heure + zone).
 * Service pur — aucune dépendance UI, testable.
 */

export type DayPart = "morning" | "afternoon" | "evening" | "night";

export interface GreetingInput {
  /** Prénom affichable, si connu. */
  firstName?: string | null;
  /** Zone ou ville détectée, si connue. */
  zone?: string | null;
  /** Nombre d'urgences actives autour de l'utilisateur. */
  urgentCount?: number;
  /** Heure locale (0-23). Injectée pour rester testable. */
  hour: number;
}

export interface Greeting {
  /** Clé i18n de la salutation. */
  titleKey: string;
  titleParams: Record<string, string>;
  /** Clé i18n de la phrase de contexte. */
  contextKey: string;
  contextParams: Record<string, string>;
  /** Clé i18n de la ligne d'urgences, si pertinente. */
  urgencyKey: string | null;
  urgencyParams: Record<string, number>;
  dayPart: DayPart;
}

export function dayPartFor(hour: number): DayPart {
  if (hour >= 6 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "afternoon";
  if (hour >= 18 && hour < 22) return "evening";
  return "night";
}

export function buildGreeting({ firstName, zone, urgentCount = 0, hour }: GreetingInput): Greeting {
  const dayPart = dayPartFor(hour);
  const hasZone = !!zone && zone.trim().length > 0;

  return {
    titleKey: firstName ? "greeting.helloName" : "greeting.hello",
    titleParams: firstName ? { name: firstName } : {},
    contextKey: hasZone ? `greeting.context.${dayPart}` : `greeting.contextNoZone.${dayPart}`,
    contextParams: hasZone ? { zone: zone!.trim() } : {},
    urgencyKey: urgentCount > 0 ? "greeting.urgencies" : null,
    urgencyParams: { count: urgentCount },
    dayPart,
  };
}
