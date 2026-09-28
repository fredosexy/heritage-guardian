import type { DossierType } from "@/core/types/domain";

const DOSSIER_TYPES = new Set<DossierType>([
  "acquisition","achat","succession","heritage","protection",
  "regularisation","partage","transmission","vente","autre",
]);

const LEGACY_INTENTS: Record<string,DossierType> = {
  terrain: "protection",
  volonte: "transmission",
  conflit: "regularisation",
};

export function resolveRequestedDossierType(value: string | null): DossierType | null {
  if (!value) return null;
  if (value in LEGACY_INTENTS) return LEGACY_INTENTS[value];
  return DOSSIER_TYPES.has(value as DossierType) ? value as DossierType : null;
}
