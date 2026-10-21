import { supabase } from "@/integrations/supabase/client";
import type { Dossier, DossierStatus, DossierType } from "@/core/types/domain";
import { assertDossierOwner } from "@/services/dossier-ownership";
import type { Json } from "@/integrations/supabase/types";

export interface NewDossierInput {
  user_id: string;
  type: DossierType | string;
  title: string;
  description?: string | null;
  location_name?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  metadata?: Record<string, unknown>;
}

export async function listDossiers(userId: string): Promise<Dossier[]> {
  const { data, error } = await supabase
    .from("dossiers")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getDossier(id: string): Promise<Dossier | null> {
  const { data, error } = await supabase.from("dossiers").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ?? null;
}

export async function createDossier(input: NewDossierInput): Promise<Dossier> {
  const { data, error } = await supabase
    .from("dossiers")
    .insert({
      user_id: input.user_id,
      type: input.type as DossierType,
      title: input.title,
      description: input.description ?? null,
      location_name: input.location_name ?? null,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
      metadata: JSON.parse(JSON.stringify(input.metadata ?? {})) as Json,
      status: "incomplete",
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateDossierScore(
  id: string,
  score: number,
  status: DossierStatus
): Promise<void> {
  const { error } = await supabase
    .from("dossiers")
    .update({ completion_score: score, status })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteDossier(id: string): Promise<void> {
  const { error } = await supabase.from("dossiers").delete().eq("id", id);
  if (error) throw error;
}


export async function updateDossierMetadata(
  id: string,
  metadata: Record<string, unknown>
): Promise<Dossier> {
  const { data: { user }, error: sessionError } = await supabase.auth.getUser();
  if (sessionError) throw sessionError;
  const dossier = await getDossier(id);
  assertDossierOwner(dossier, user?.id);
  if (!user) throw new Error("Session required");
  const { data, error } = await supabase
    .from("dossiers")
    .update({ metadata: JSON.parse(JSON.stringify(metadata)) as Json })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
