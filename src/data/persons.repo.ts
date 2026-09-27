import { supabase } from "@/integrations/supabase/client";
import { createCorrelationId } from "@/core/observability";
import type {
  DeathStatus,
  IdentityStatus,
  Person,
  PersonAlias,
} from "@/core/types/domain";

export interface CreatePersonInput {
  display_name: string;
  phone?: string | null;
  email?: string | null;
  identity_status?: Exclude<IdentityStatus, "VERIFIED">;
}

export interface UpdatePersonInput {
  display_name: string;
  phone?: string | null;
  email?: string | null;
  identity_status: IdentityStatus;
  death_status: DeathStatus;
  birth_date?: string | null;
  death_date?: string | null;
}

export async function getPerson(personId: string): Promise<Person | null> {
  const { data, error } = await supabase
    .from("persons")
    .select("*")
    .eq("id", personId)
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
}

export async function ensureCurrentUserPerson(correlationId = createCorrelationId()): Promise<string> {
  const { data, error } = await supabase.rpc("ensure_current_user_person", {
    p_correlation_id: correlationId,
  });
  if (error) throw error;
  return data;
}

export async function createPerson(
  input: CreatePersonInput,
  correlationId = createCorrelationId(),
): Promise<string> {
  const { data, error } = await supabase.rpc("create_person_record", {
    p_display_name: input.display_name,
    p_phone: input.phone ?? null,
    p_email: input.email ?? null,
    p_identity_status: input.identity_status ?? "DECLARED",
    p_correlation_id: correlationId,
  });
  if (error) throw error;
  return data;
}

export async function claimPerson(
  personId: string,
  correlationId = createCorrelationId(),
): Promise<string> {
  const { data, error } = await supabase.rpc("claim_person_record", {
    p_person_id: personId,
    p_correlation_id: correlationId,
  });
  if (error) throw error;
  return data;
}

export async function updatePerson(
  personId: string,
  input: UpdatePersonInput,
  correlationId = createCorrelationId(),
): Promise<void> {
  const { error } = await supabase.rpc("update_person_record", {
    p_person_id: personId,
    p_display_name: input.display_name,
    p_phone: input.phone ?? null,
    p_email: input.email ?? null,
    p_identity_status: input.identity_status,
    p_death_status: input.death_status,
    p_birth_date: input.birth_date ?? null,
    p_death_date: input.death_date ?? null,
    p_correlation_id: correlationId,
  });
  if (error) throw error;
}

export async function mergePerson(
  sourcePersonId: string,
  targetPersonId: string,
  correlationId = createCorrelationId(),
): Promise<string> {
  const { data, error } = await supabase.rpc("merge_person_records", {
    p_source_person_id: sourcePersonId,
    p_target_person_id: targetPersonId,
    p_correlation_id: correlationId,
  });
  if (error) throw error;
  return data;
}

export async function listPersonAliases(personId: string): Promise<PersonAlias[]> {
  const { data, error } = await supabase
    .from("person_aliases")
    .select("*")
    .eq("person_id", personId)
    .is("revoked_at", null)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}
