import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { actorsRepo } from "@/data";
import { ActorCard } from "@/features/procedures/components/ActorCard";
import type { ActorWithCompetences } from "@/services/actor-recommendation";

export function StepActorRecommendations({ procedureStepId }: { procedureStepId?: string | null }) {
  const { t } = useTranslation();
  const [actors, setActors] = useState<ActorWithCompetences[]>([]);
  useEffect(() => {
    if (!procedureStepId) { setActors([]); return; }
    void actorsRepo.getActorsForDossierStep(procedureStepId).then((items) => setActors(items.slice(0, 3)));
  }, [procedureStepId]);
  if (actors.length === 0) return null;
  return <div className="space-y-3"><h3 className="text-sm font-medium">{t("actors.helpNow")}</h3>{actors.map((actor) => <ActorCard key={actor.id} actor={actor} />)}</div>;
}
