import type { Actor, ActorCompetence, TerritorialLevel } from "@/core/types/domain";

export interface ActorWithCompetences extends Actor {
  actor_competences: ActorCompetence[];
}

export interface ActorSearchContext {
  requiredCompetence?: string | null;
  territorialLevel?: TerritorialLevel | string | null;
  location?: string | null;
  includeUnavailable?: boolean;
}

const LEVEL_DISTANCE: Record<TerritorialLevel, number> = {
  local: 0, rural: 1, arrondissement: 2, departement: 3, region: 4, national: 5, autre: 6,
};

export function hasUsableCompetence(actor: ActorWithCompetences, code?: string | null): boolean {
  if (!code) return true;
  return actor.actor_competences.some((item) => item.competence_code === code &&
    !["expire", "suspendu", "revoque"].includes(item.status) &&
    (!item.expires_at || new Date(item.expires_at).getTime() > Date.now()));
}

export function rankActors(actors: ActorWithCompetences[], context: ActorSearchContext): ActorWithCompetences[] {
  const targetLevel = context.territorialLevel as TerritorialLevel | undefined;
  const targetLocation = context.location?.trim().toLocaleLowerCase();
  return actors.filter((actor) => actor.verification_status !== "suspendu" && actor.verification_status !== "revoque")
    .filter((actor) => context.includeUnavailable || actor.availability_status !== "indisponible")
    .filter((actor) => hasUsableCompetence(actor, context.requiredCompetence))
    .sort((a, b) => {
      const competenceVerified = (actor: ActorWithCompetences) => actor.actor_competences.some((item) => item.competence_code === context.requiredCompetence && item.status === "verifie") ? 1 : 0;
      const verified = (actor: ActorWithCompetences) => actor.verification_status === "verifie" ? 1 : 0;
      const levelScore = (actor: ActorWithCompetences) => targetLevel ? Math.abs((LEVEL_DISTANCE[actor.territorial_level as TerritorialLevel] ?? 6) - (LEVEL_DISTANCE[targetLevel] ?? 6)) : 0;
      const local = (actor: ActorWithCompetences) => targetLocation && actor.location.toLocaleLowerCase().includes(targetLocation) ? 1 : 0;
      return competenceVerified(b) - competenceVerified(a) || verified(b) - verified(a) || levelScore(a) - levelScore(b) || local(b) - local(a) || a.name.localeCompare(b.name);
    });
}

export function actorsForEssentialMode(actors: ActorWithCompetences[], context: ActorSearchContext) {
  return rankActors(actors, context).slice(0, 3);
}
