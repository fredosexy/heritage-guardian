import { supabase } from "@/integrations/supabase/client";
export * from "../../supabase/functions/_shared/terrain-checklist";

export interface TerrainChecklistReview {
  summary: string;
  toComplete: string[];
}

export interface ConfirmedChecklistReview extends TerrainChecklistReview {
  confirmedAt: string;
}

export async function requestTerrainChecklistReview(dossierId: string, language: string): Promise<TerrainChecklistReview> {
  const { data, error } = await supabase.functions.invoke("terrain-checklist-assist", {
    body: { dossierId, language: language.startsWith("en") ? "en" : "fr" },
  });
  if (error) throw error;
  if (!data || typeof data.summary !== "string" || !data.summary) throw new Error("ai_unavailable");
  return { summary: data.summary, toComplete: Array.isArray(data.toComplete) ? data.toComplete : [] };
}

/** Builds the metadata patch saved only after the owner confirms the review. */
export function buildConfirmedReviewMetadata(
  metadata: unknown,
  review: TerrainChecklistReview,
  now: Date = new Date(),
): Record<string, unknown> {
  const base = metadata && typeof metadata === "object" && !Array.isArray(metadata) ? metadata as Record<string, unknown> : {};
  const terrain = base.terrain && typeof base.terrain === "object" && !Array.isArray(base.terrain) ? base.terrain as Record<string, unknown> : {};
  const checklistReview: ConfirmedChecklistReview = { ...review, confirmedAt: now.toISOString() };
  return { ...base, terrain: { ...terrain, checklistReview } };
}

export function confirmedReviewFromMetadata(metadata: unknown): ConfirmedChecklistReview | null {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return null;
  const terrain = (metadata as { terrain?: { checklistReview?: unknown } }).terrain;
  const r = terrain?.checklistReview as ConfirmedChecklistReview | undefined;
  return r && typeof r.summary === "string" && typeof r.confirmedAt === "string" ? r : null;
}
