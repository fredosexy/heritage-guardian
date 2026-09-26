import { supabase } from "@/integrations/supabase/client";
import type { Bien, BienRightHolder, Person } from "@/core/types/domain";

export type BienType = "terrain" | "parcelle" | "maison" | "propriete_familiale" | "autre";
export type BienCreationContext = "propre_bien" | "proche_accompagne" | "bien_familial";
export type BienHolderRole = "titulaire" | "co_titulaire" | "ayant_droit" | "representant_autorise" | "autre";

export interface CreateBienInput {
  type: BienType;
  title: string;
  location_label: string;
  creation_context: BienCreationContext;
  description?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  origin_declared?: string | null;
  holder_name?: string | null;
  holder_phone?: string | null;
  holder_email?: string | null;
  holder_role?: BienHolderRole;
}

export interface BienRightHolderWithPerson extends BienRightHolder {
  person: Person;
}

export async function createBien(input: CreateBienInput): Promise<string> {
  const { data, error } = await supabase.rpc("create_bien_with_holder", {
    p_type: input.type,
    p_title: input.title,
    p_location_label: input.location_label,
    p_creation_context: input.creation_context,
    p_description: input.description ?? null,
    p_latitude: input.latitude ?? null,
    p_longitude: input.longitude ?? null,
    p_origin_declared: input.origin_declared ?? null,
    p_holder_name: input.holder_name ?? null,
    p_holder_phone: input.holder_phone ?? null,
    p_holder_email: input.holder_email ?? null,
    p_holder_role: input.holder_role ?? "titulaire",
  });
  if (error) throw error;
  return data;
}

export async function getBiensForUser(): Promise<Bien[]> {
  const { data, error } = await supabase
    .from("biens")
    .select("*")
    .neq("status", "archive")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getBienById(id: string): Promise<Bien | null> {
  const { data, error } = await supabase.from("biens").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ?? null;
}

export async function getRightHolders(bienId: string): Promise<BienRightHolderWithPerson[]> {
  const { data, error } = await supabase
    .from("bien_right_holders")
    .select("*, person:persons(*)")
    .eq("bien_id", bienId)
    .neq("status", "revoque")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as BienRightHolderWithPerson[];
}

export async function updateBien(
  id: string,
  patch: Partial<Pick<Bien, "type" | "title" | "description" | "location_label" | "latitude" | "longitude" | "origin_declared">>,
): Promise<Bien> {
  const { data, error } = await supabase.from("biens").update(patch).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function archiveBien(id: string): Promise<void> {
  const { error } = await supabase
    .from("biens")
    .update({ status: "archive", archived_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}


export async function addRightHolder(
  bienId: string,
  input: { display_name: string; role: BienHolderRole; phone?: string | null; email?: string | null },
): Promise<string> {
  const { data, error } = await supabase.rpc("add_declared_right_holder", {
    p_bien_id: bienId,
    p_display_name: input.display_name,
    p_role: input.role,
    p_phone: input.phone ?? null,
    p_email: input.email ?? null,
  });
  if (error) throw error;
  return data;
}

export async function revokeRightHolder(relationId: string): Promise<void> {
  const { error } = await supabase.rpc("revoke_declared_right_holder", {
    p_relation_id: relationId,
  });
  if (error) throw error;
}
