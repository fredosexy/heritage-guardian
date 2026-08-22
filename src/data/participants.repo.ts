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
