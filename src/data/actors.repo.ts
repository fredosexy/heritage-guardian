import { supabase } from "@/integrations/supabase/client";
import type { ActorCompetence, ActorCredential, TerritorialLevel } from "@/core/types/domain";
import { rankActors, type ActorSearchContext, type ActorWithCompetences } from "@/services/actor-recommendation";

export interface ActorFilters {
  query?: string;
  competence?: string;
  territorialLevel?: TerritorialLevel | "";
  verificationStatus?: string;
  location?: string;
}

export async function searchActors(filters: ActorFilters = {}): Promise<ActorWithCompetences[]> {
  let query = supabase.from("actors").select("*, actor_competences(*)").eq("is_published", true);
  if (filters.query) query = query.or(`name.ilike.%${filters.query}%,description.ilike.%${filters.query}%,location.ilike.%${filters.query}%`);
  if (filters.territorialLevel) query = query.eq("territorial_level", filters.territorialLevel);
  if (filters.verificationStatus) query = query.eq("verification_status", filters.verificationStatus);
  const { data, error } = await query.order("name");
  if (error) throw error;
  const actors = (data ?? []) as ActorWithCompetences[];
  return filters.competence ? actors.filter((actor) => actor.actor_competences.some((item) => item.competence_code === filters.competence)) : actors;
}

export async function getActorById(id: string): Promise<ActorWithCompetences | null> {
  const { data, error } = await supabase.from("actors").select("*, actor_competences(*)").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as ActorWithCompetences | null;
}

export const getActorsByCompetence = (competence: string) => searchActors({ competence });

export async function getActorsForStep(step: { required_competence?: string | null; territorial_level?: string | null }, context: Omit<ActorSearchContext, "requiredCompetence" | "territorialLevel"> = {}) {
  const actors = await searchActors({ competence: step.required_competence ?? undefined });
  return rankActors(actors, { ...context, requiredCompetence: step.required_competence, territorialLevel: step.territorial_level });
}

export async function getActorsForDossierStep(procedureStepId: string, context: Omit<ActorSearchContext, "requiredCompetence" | "territorialLevel"> = {}) {
  const { data, error } = await supabase.from("procedure_steps").select("required_competence, territorial_level").eq("id", procedureStepId).maybeSingle();
  if (error) throw error;
  return data ? getActorsForStep(data, context) : [];
}

export async function getActorCompetences(actorId: string): Promise<ActorCompetence[]> {
  const { data, error } = await supabase.from("actor_competences").select("*").eq("actor_id", actorId).order("label");
  if (error) throw error;
  return data ?? [];
}

export async function getActorCredentials(actorId: string): Promise<ActorCredential[]> {
  const { data, error } = await supabase.from("actor_credentials").select("*").eq("actor_id", actorId).order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
