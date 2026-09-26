import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { BookOpen, Loader2, Search, Users } from "lucide-react";
import { AppLayout, PageHeader } from "@/features/shell";
import { actorsRepo, proceduresRepo } from "@/data";
import type { ProcedureDefinitionWithSteps } from "@/data/procedures.repo";
import type { ActorWithCompetences } from "@/services/actor-recommendation";
import { ActorCard } from "../components/ActorCard";

const competenceCodes = ["", "geometre", "notaire", "chef_traditionnel", "cadastre", "conservation_fonciere", "sous_prefecture", "mindcaf", "mediation", "autre"];
const territoryLevels = ["", "rural", "arrondissement", "departement", "region", "national", "local", "autre"];

export default function ProceduresPage() {
  const { t } = useTranslation();
  const [procedures, setProcedures] = useState<ProcedureDefinitionWithSteps[]>([]);
  const [actors, setActors] = useState<ActorWithCompetences[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [competence, setCompetence] = useState("");
  const [territory, setTerritory] = useState("");

  useEffect(() => {
    void Promise.all([proceduresRepo.getPublishedProcedures(), actorsRepo.searchActors()])
      .then(([procedureItems, actorItems]) => { setProcedures(procedureItems); setActors(actorItems); })
      .finally(() => setLoading(false));
  }, []);

  const filteredActors = useMemo(() => actors.filter((actor) => {
    const text = `${actor.name} ${actor.description ?? ""} ${actor.location}`.toLocaleLowerCase();
    return (!query || text.includes(query.toLocaleLowerCase())) &&
      (!competence || actor.actor_competences.some((item) => item.competence_code === competence)) &&
      (!territory || actor.territorial_level === territory);
  }), [actors, query, competence, territory]);

  return <AppLayout>
    <PageHeader title={t("procedures.title")} subtitle={t("procedures.subtitle")} />
    {loading ? <Loader2 className="size-5 animate-spin mx-auto my-12" /> : <>
      <section className="mb-8 space-y-4">
        <div><h2 className="font-medium flex items-center gap-2"><BookOpen className="size-5" />{t("procedures.guidesTitle")}</h2><p className="text-caption">{t("procedures.guidesHint")}</p></div>
        {procedures.length === 0 ? <div className="card-soft p-6 text-center"><p>{t("procedures.empty")}</p><p className="text-caption mt-2">{t("procedures.emptyHint")}</p></div> :
          procedures.map((procedure) => <article key={procedure.id} className="card-soft p-5 mb-4">
            <div className="flex justify-between gap-3"><div><h3 className="font-medium">{t(`dossiers.types.${procedure.dossier_type}`, procedure.dossier_type)}</h3><p className="text-caption">{procedure.territory} · v{procedure.version}</p></div><span className="text-xs text-success">{t("procedures.published")}</span></div>
            <ol className="mt-4 space-y-2">{procedure.procedure_steps.map((step) => <li key={step.id} className="text-sm"><span className="text-muted-foreground mr-2">{step.step_order}.</span>{step.title}<span className="text-caption ml-2">{t(`journey.levels.${step.territorial_level}`)}</span></li>)}</ol>
            {procedure.source_reference && <p className="text-caption mt-4">{t("procedures.source")}: {procedure.source_reference}</p>}
          </article>)}
      </section>
      <section className="space-y-4">
        <div><h2 className="font-medium flex items-center gap-2"><Users className="size-5" />{t("actors.directoryTitle")}</h2><p className="text-caption">{t("actors.directoryHint")}</p></div>
        <div className="card-soft p-4 grid gap-3 md:grid-cols-3">
          <label className="relative"><Search className="absolute left-3 top-3 size-4 text-muted-foreground" /><input className="w-full rounded-md border bg-background py-2 pl-9 pr-3 text-sm" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("actors.search")} /></label>
          <select className="rounded-md border bg-background px-3 py-2 text-sm" value={competence} onChange={(event) => setCompetence(event.target.value)} aria-label={t("actors.filterCompetence")}>{competenceCodes.map((code) => <option key={code} value={code}>{code ? t(`actors.competences.${code}`) : t("actors.allCompetences")}</option>)}</select>
          <select className="rounded-md border bg-background px-3 py-2 text-sm" value={territory} onChange={(event) => setTerritory(event.target.value)} aria-label={t("actors.filterTerritory")}>{territoryLevels.map((level) => <option key={level} value={level}>{level ? t(`journey.levels.${level}`) : t("actors.allTerritories")}</option>)}</select>
        </div>
        {filteredActors.length === 0 ? <div className="card-soft p-6 text-center text-caption">{t("actors.empty")}</div> : <div className="grid gap-4 md:grid-cols-2">{filteredActors.map((actor) => <ActorCard key={actor.id} actor={actor} />)}</div>}
      </section>
    </>}
  </AppLayout>;
}

