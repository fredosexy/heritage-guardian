import { supabase } from "@/integrations/supabase/client";
import { createCorrelationId } from "@/core/observability";
import type { DossierParticipant, Person } from "@/core/types/domain";
import { runOrQueueId, runOrQueueVoid } from "./offline/command-client";

export interface DossierParticipantWithPerson extends DossierParticipant { person: Person; }

export async function getParticipants(dossierId: string): Promise<DossierParticipantWithPerson[]> {
  const { data, error } = await supabase.from("dossier_participants").select("*, person:persons(*)").eq("dossier_id", dossierId).neq("status", "revoque").order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as DossierParticipantWithPerson[];
}
export const listParticipants = getParticipants;

export async function addParticipant(dossierId: string, personId: string, role: string): Promise<string> {
  return runOrQueueId({
    targetDomain: "DOSSIER",
    commandName: "ADD_PARTICIPANT",
    aggregateId: dossierId,
    payload: { dossier_id: dossierId, person_id: personId, role },
  }, async () => {
    const { data, error } = await supabase.rpc("add_dossier_participant", { p_dossier_id: dossierId, p_person_id: personId, p_role: role });
    if (error) throw error;
    return data;
  });
}

export async function revokeParticipant(participantId: string): Promise<void> {
  await runOrQueueVoid({
    targetDomain: "DOSSIER",
    commandName: "REVOKE_PARTICIPANT",
    aggregateId: participantId,
    payload: { participant_id: participantId },
  }, async () => {
    const { error } = await supabase.rpc("revoke_dossier_participant", { p_participant_id: participantId });
    if (error) throw error;
  });
}

export async function countParticipantsByDossier(dossierIds: string[]): Promise<Record<string, number>> {
  if (dossierIds.length === 0) return {};
  const { data, error } = await supabase.from("dossier_participants").select("dossier_id").in("dossier_id", dossierIds).eq("status", "actif");
  if (error) throw error;
  const out: Record<string, number> = {};
  for (const row of data ?? []) out[row.dossier_id] = (out[row.dossier_id] ?? 0) + 1;
  return out;
}

export async function acceptParticipation(
  participantId: string,
  correlationId = createCorrelationId(),
): Promise<void> {
  const { error } = await supabase.rpc("accept_dossier_participation", {
    p_participant_id: participantId,
    p_correlation_id: correlationId,
  });
  if (error) throw error;
}
