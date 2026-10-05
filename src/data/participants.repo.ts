import { supabase } from "@/integrations/supabase/client";
import type { Participant } from "@/core/types/domain";

export async function listParticipants(dossierId: string): Promise<Participant[]> {
  const { data, error } = await supabase
    .from("participants")
    .select("*")
    .eq("dossier_id", dossierId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/** Nombre de participants par dossier (dossiers fournis). */
export async function countParticipantsByDossier(dossierIds: string[]): Promise<Record<string, number>> {
  if (dossierIds.length === 0) return {};
  const { data, error } = await supabase.from("participants").select("dossier_id").in("dossier_id", dossierIds);
  if (error) throw error;
  const out: Record<string, number> = {};
  for (const row of data ?? []) out[row.dossier_id] = (out[row.dossier_id] ?? 0) + 1;
  return out;
}
