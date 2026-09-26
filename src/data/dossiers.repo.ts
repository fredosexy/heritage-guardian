import { supabase } from "@/integrations/supabase/client";
import type { Bien, Dossier, DossierStatus, DossierType } from "@/core/types/domain";
import type { Enums } from "@/integrations/supabase/types";

export interface NewDossierInput {
  bien_id: string;
  type: DossierType;
  title: string;
  visibility?: Enums<"dossier_visibility">;
  description?: string | null;
  include_bien_holders?: boolean;
  client_operation_id?: string | null;
}

export interface DossierWithBien extends Dossier { bien: Pick<Bien, "id" | "title" | "location_label">; }

export async function getDossiersForUser(): Promise<DossierWithBien[]> {
  const { data, error } = await supabase.from("dossiers").select("*, bien:biens(id,title,location_label)").neq("status", "archive").order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as DossierWithBien[];
}

/** @deprecated RLS determines owner and participant visibility. */
export async function listDossiers(_userId?: string): Promise<DossierWithBien[]> { return getDossiersForUser(); }

export async function getDossierById(id: string): Promise<DossierWithBien | null> {
  const { data, error } = await supabase.from("dossiers").select("*, bien:biens(id,title,location_label)").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as DossierWithBien | null) ?? null;
}
export const getDossier = getDossierById;

export async function createDossier(input: NewDossierInput): Promise<Dossier> {
  const { data: id, error } = await supabase.rpc("create_dossier", {
    p_bien_id: input.bien_id, p_type: input.type, p_title: input.title,
    p_visibility: input.visibility ?? "prive", p_description: input.description ?? null,
    p_include_bien_holders: input.include_bien_holders ?? true,
    p_client_operation_id: input.client_operation_id ?? null,
  });
  if (error) throw error;
  const dossier = await getDossierById(id);
  if (!dossier) throw new Error("dossier_creation_failed");
  return dossier;
}

export async function updateDossier(id: string, patch: Partial<Pick<Dossier, "title" | "description" | "visibility" | "status" | "completion_level" | "closed_at">>): Promise<Dossier> {
  const { data, error } = await supabase.from("dossiers").update(patch).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function archiveDossier(id: string): Promise<void> {
  const { error } = await supabase.from("dossiers").update({ status: "archive", archived_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
}

export async function updateDossierScore(id: string, score: number, status: DossierStatus): Promise<void> {
  const { error } = await supabase.from("dossiers").update({ completion_score: score, status }).eq("id", id);
  if (error) throw error;
}
