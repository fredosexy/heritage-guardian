import type { Dossier } from "@/core/types/domain";

export type DossierAttention =
  | { kind: "proof"; label: string }
  | { kind: "location"; label: string }
  | { kind: "description"; label: string }
  | { kind: "participant"; label: string }
  | { kind: "complete"; label: string };

export function getNextDossierAttention(
  dossier: Pick<Dossier, "location_name" | "description" | "completion_score">,
  proofsCount: number,
  participantsCount: number
): DossierAttention {
  if (proofsCount === 0) return { kind: "proof", label: "Ajouter une première preuve" };
  if (!dossier.location_name) return { kind: "location", label: "Préciser la localisation" };
  if (!dossier.description) return { kind: "description", label: "Décrire le bien ou la situation" };
  if (participantsCount === 0) return { kind: "participant", label: "Ajouter une personne concernée" };
  if (dossier.completion_score < 75) return { kind: "proof", label: "Renforcer les preuves du dossier" };
  return { kind: "complete", label: "Dossier bien avancé — préparer la suite" };
}
