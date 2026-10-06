import type { TerritorialLevel } from "@/core/types/domain";

export type { TerritorialLevel } from "@/core/types/domain";
export type JourneyStepStatus = "a_faire" | "en_cours" | "terminee" | "bloquee" | "a_verifier";

export interface JourneyStepLike {
  id: string;
  step_order: number;
  status: JourneyStepStatus | string;
  territorial_level: TerritorialLevel | string;
}

export function getJourneySummary<T extends JourneyStepLike>(steps: T[]) {
  const ordered = [...steps].sort((a, b) => a.step_order - b.step_order);
  const completedSteps = ordered.filter((step) => step.status === "terminee");
  const blockedSteps = ordered.filter((step) => step.status === "bloquee");
  const currentStep =
    ordered.find((step) => step.status === "en_cours" || step.status === "bloquee" || step.status === "a_verifier") ?? null;
  const nextStep =
    ordered.find((step) => step.status === "a_faire" && step.step_order > (currentStep?.step_order ?? 0)) ??
    ordered.find((step) => step.status === "a_faire") ??
    null;

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
  return (
    (from === "a_faire" && to === "en_cours") ||
    (from === "en_cours" && (to === "terminee" || to === "bloquee")) ||
    (from === "bloquee" && to === "en_cours") ||
    (from === "terminee" && to === "a_verifier") ||
    (from === "a_verifier" && to === "terminee")
  );
}
