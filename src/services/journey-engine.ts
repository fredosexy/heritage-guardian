export type TerritorialLevel = "local" | "rural" | "arrondissement" | "departement" | "region" | "national" | "autre";
export type JourneyStepStatus = "a_faire" | "en_cours" | "terminee" | "bloquee" | "a_verifier";

export interface JourneyStepLike {
  id: string;
  step_order: number;
  status: JourneyStepStatus | string;
  territorial_level: TerritorialLevel | string;
}

export interface ProcedureRuleContext { bienType: string; creationContext: string; }
export interface ProcedureRules { bien_type?: string | string[]; creation_context?: string | string[]; }

function matches(value: string, expected?: string | string[]) {
  return expected === undefined || (Array.isArray(expected) ? expected.includes(value) : expected === value);
}

export function stepApplies(rules: ProcedureRules | null, context: ProcedureRuleContext): boolean {
  if (!rules) return true;
  return matches(context.bienType, rules.bien_type) && matches(context.creationContext, rules.creation_context);
}

export function selectProcedure<T extends { version: number; territory: string; status: string; dossier_type: string }>(
  definitions: T[],
  input: { dossierType: string; territory: string },
): T | null {
  return definitions
    .filter((item) => item.status === "publiee" && item.dossier_type === input.dossierType && (item.territory === "*" || item.territory.toLowerCase() === input.territory.toLowerCase()))
    .sort((a, b) => (a.territory === input.territory ? -1 : b.territory === input.territory ? 1 : b.version - a.version))[0] ?? null;
}

export function getJourneySummary<T extends JourneyStepLike>(steps: T[]) {
  const ordered = [...steps].sort((a, b) => a.step_order - b.step_order);
  const completedSteps = ordered.filter((step) => step.status === "terminee");
  const blockedSteps = ordered.filter((step) => step.status === "bloquee");
  const currentStep = ordered.find((step) => step.status === "en_cours" || step.status === "bloquee" || step.status === "a_verifier") ?? null;
  const nextStep = ordered.find((step) => step.step_order > (currentStep?.step_order ?? 0) && step.status === "a_faire") ?? null;
  return {
    orderedSteps: ordered,
    currentStep,
    nextStep,
    completedSteps,
    blockedSteps,
    progressPercent: ordered.length === 0 ? 0 : Math.round((completedSteps.length / ordered.length) * 100),
  };
}

export function canTransition(from: JourneyStepStatus, to: JourneyStepStatus): boolean {
  return (from === "a_faire" && to === "en_cours") ||
    (from === "en_cours" && (to === "terminee" || to === "bloquee")) ||
    (from === "bloquee" && to === "en_cours") ||
    (from === "terminee" && to === "a_verifier") ||
    (from === "a_verifier" && to === "terminee");
}
