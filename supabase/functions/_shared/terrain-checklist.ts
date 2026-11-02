// Pure checklist logic shared by the app and the server function (no Deno/DOM APIs).
export const TERRAIN_SECTION_KEYS = [
  "histoire", "provenance", "proprietaires", "ayantsDroit", "documentation",
  "localisation", "dimensions", "etat", "miseEnValeur",
] as const;

export type TerrainSectionKey = (typeof TERRAIN_SECTION_KEYS)[number];
export type ChecklistGap = "info" | "proof" | "both";

export interface TerrainChecklistItem {
  key: TerrainSectionKey;
  hasInfo: boolean;
  proofCount: number;
  gap: ChecklistGap | null;
}

export interface ProofSectionLike {
  metadata?: unknown;
}

const MIN_INFO_LENGTH = 3;

export function proofSectionKey(proof: ProofSectionLike): string | null {
  const m = proof.metadata;
  if (!m || typeof m !== "object" || Array.isArray(m)) return null;
  const key = (m as { terrainSectionKey?: unknown }).terrainSectionKey;
  return typeof key === "string" ? key : null;
}

export function buildTerrainChecklist(
  sections: Record<string, unknown> | null | undefined,
  proofs: ProofSectionLike[],
): TerrainChecklistItem[] {
  return TERRAIN_SECTION_KEYS.map((key) => {
    const text = sections?.[key];
    const hasInfo = typeof text === "string" && text.trim().length >= MIN_INFO_LENGTH;
    const proofCount = proofs.filter((p) => proofSectionKey(p) === key).length;
    const gap: ChecklistGap | null = !hasInfo && proofCount === 0 ? "both" : !hasInfo ? "info" : proofCount === 0 ? "proof" : null;
    return { key, hasInfo, proofCount, gap };
  });
}

export function terrainSectionsFromMetadata(metadata: unknown): Record<string, unknown> {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return {};
  const terrain = (metadata as { terrain?: unknown }).terrain;
  if (!terrain || typeof terrain !== "object" || Array.isArray(terrain)) return {};
  const sections = (terrain as { sections?: unknown }).sections;
  return sections && typeof sections === "object" && !Array.isArray(sections) ? sections as Record<string, unknown> : {};
}
