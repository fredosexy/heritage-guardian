import { supabase } from "@/integrations/supabase/client";
import { createCorrelationId } from "@/core/observability";
import type {
  FamilyRelation,
  FamilyRelationRevision,
  FamilyRelationSource,
  FamilyRelationStatus,
  FamilyRelationType,
} from "@/core/types/domain";

export interface CreateFamilyRelationInput {
  from_person_id: string;
  to_person_id: string;
  relation_type: FamilyRelationType;
  source_type: FamilyRelationSource;
  source_document_id?: string | null;
  note?: string | null;
}

export interface ReviseFamilyRelationInput {
  relation_type: FamilyRelationType;
  status: FamilyRelationStatus;
  source_type: FamilyRelationSource;
  source_document_id?: string | null;
  note?: string | null;
}

export async function listFamilyRelations(personId: string): Promise<FamilyRelation[]> {
  const { data, error } = await supabase
    .from("family_relations")
    .select("*")
    .or(`from_person_id.eq.${personId},to_person_id.eq.${personId}`)
    .neq("status", "REVOKED")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function listFamilyRelationRevisions(
  relationId: string,
): Promise<FamilyRelationRevision[]> {
  const { data, error } = await supabase
    .from("family_relation_revisions")
    .select("*")
    .eq("relation_id", relationId)
    .order("version_number", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createFamilyRelation(
  input: CreateFamilyRelationInput,
  correlationId = createCorrelationId(),
): Promise<string> {
  const { data, error } = await supabase.rpc("create_family_relation", {
    p_from_person_id: input.from_person_id,
    p_to_person_id: input.to_person_id,
    p_relation_type: input.relation_type,
    p_source_type: input.source_type,
    p_source_document_id: input.source_document_id ?? null,
    p_note: input.note ?? null,
    p_correlation_id: correlationId,
  });
  if (error) throw error;
  return data;
}

export async function reviseFamilyRelation(
  relationId: string,
  input: ReviseFamilyRelationInput,
  correlationId = createCorrelationId(),
): Promise<number> {
  const { data, error } = await supabase.rpc("revise_family_relation", {
    p_relation_id: relationId,
    p_relation_type: input.relation_type,
    p_status: input.status,
    p_source_type: input.source_type,
    p_source_document_id: input.source_document_id ?? null,
    p_note: input.note ?? null,
    p_correlation_id: correlationId,
  });
  if (error) throw error;
  return data;
}
