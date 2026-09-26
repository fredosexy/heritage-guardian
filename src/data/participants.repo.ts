import { supabase } from "@/integrations/supabase/client";
import type { DossierParticipant, Person } from "@/core/types/domain";

export interface DossierParticipantWithPerson extends DossierParticipant { person: Person; }

export async function getParticipants(dossierId: string): Promise<DossierParticipantWithPerson[]> {
  const { data, error } = await supabase.from("dossier_participants").select("*, person:persons(*)").eq("dossier_id", dossierId).neq("status", "revoque").order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as DossierParticipantWithPerson[];
}
export const listParticipants = getParticipants;

export async function addParticipant(dossierId: string, personId: string, role: string): Promise<string> {
  const { data, error } = await supabase.rpc("add_dossier_participant", { p_dossier_id: dossierId, p_person_id: personId, p_role: role });
  if (error) throw error;
  return data;
}

export async function revokeParticipant(participantId: string): Promise<void> {
  const { error } = await supabase.rpc("revoke_dossier_participant", { p_participant_id: participantId });
  if (error) throw error;
}

export async function countParticipantsByDossier(dossierIds: string[]): Promise<Record<string, number>> {
  if (dossierIds.length === 0) return {};
  const { data, error } = await supabase.from("dossier_participants").select("dossier_id").in("dossier_id", dossierIds).eq("status", "actif");
  if (error) throw error;
  const out: Record<string, number> = {};
  for (const row of data ?? []) out[row.dossier_id] = (out[row.dossier_id] ?? 0) + 1;
  return out;
}
