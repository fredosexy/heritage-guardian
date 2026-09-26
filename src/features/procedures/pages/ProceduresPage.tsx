import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { BookOpen, Loader2 } from "lucide-react";
import { AppLayout, PageHeader } from "@/features/shell";
import { proceduresRepo } from "@/data";
import type { ProcedureDefinitionWithSteps } from "@/data/procedures.repo";

export default function ProceduresPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState<ProcedureDefinitionWithSteps[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { void proceduresRepo.getPublishedProcedures().then(setItems).finally(() => setLoading(false)); }, []);
  return <AppLayout>
    <PageHeader title={t("procedures.title")} subtitle={t("procedures.subtitle")} />
    {loading ? <Loader2 className="size-5 animate-spin mx-auto my-12" /> : items.length === 0 ?
      <div className="card-soft p-8 text-center"><BookOpen className="size-8 mx-auto text-muted-foreground mb-3" /><h2 className="font-medium">{t("procedures.empty")}</h2><p className="text-caption mt-2">{t("procedures.emptyHint")}</p></div> :
      <div className="space-y-4">{items.map((procedure) => <article key={procedure.id} className="card-soft p-5">
        <div className="flex justify-between gap-3"><div><h2 className="font-medium">{t(`dossiers.types.${procedure.dossier_type}`, procedure.dossier_type)}</h2><p className="text-caption">{procedure.territory} · v{procedure.version}</p></div><span className="text-xs text-success">{t("procedures.published")}</span></div>
        <ol className="mt-4 space-y-2">{procedure.procedure_steps.map((step) => <li key={step.id} className="text-sm"><span className="text-muted-foreground mr-2">{step.step_order}.</span>{step.title}<span className="text-caption ml-2">{t(`journey.levels.${step.territorial_level}`)}</span></li>)}</ol>
        {procedure.source_reference && <p className="text-caption mt-4">{t("procedures.source")}: {procedure.source_reference}</p>}
      </article>)}</div>}
  </AppLayout>;
}
