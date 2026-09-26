import type { Dossier, DossierStatus } from "@/core/types/domain";

export interface ScoringInput {
  proofsCount: number;
  hasLocation: boolean;
  hasDescription: boolean;
  participantsCount?: number;
}

/** Completion score 0-100 for a dossier, based on what has actually been provided. */
export function computeCompletionScore(input: ScoringInput): number {
  const proofPoints = Math.min(60, input.proofsCount * 25);
  const locationPoints = input.hasLocation ? 20 : 0;
  const descriptionPoints = input.hasDescription ? 15 : 0;
  const participantPoints = Math.min(10, (input.participantsCount ?? 0) * 10);
  return Math.min(100, proofPoints + locationPoints + descriptionPoints + participantPoints);
}

export function statusFromScore(score: number): DossierStatus {
  if (score >= 75) return "actif";
  if (score >= 40) return "a_verifier";
  return "a_completer";
}

export function scoreDossier(dossier: Dossier, proofsCount: number, participantsCount = 0) {
  const score = computeCompletionScore({
    proofsCount,
    hasLocation: Boolean(dossier.location_name),
    hasDescription: Boolean(dossier.description),
    participantsCount,
  });
  return { score, status: statusFromScore(score) };
}
