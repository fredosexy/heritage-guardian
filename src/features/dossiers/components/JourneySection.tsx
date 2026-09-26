import { Check, Circle, CircleAlert, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useDossierJourney } from "../hooks/useDossierJourney";
import { StepActorRecommendations } from "./StepActorRecommendations";

export function JourneySection({ dossierId, hasProcedure }: { dossierId: string; hasProcedure: boolean }) {
  const { t } = useTranslation();
  const { summary, loading, initialize, completeCurrent } = useDossierJourney(dossierId);
  if (loading) return <section className="card-soft p-5 mb-4"><Loader2 className="size-5 animate-spin" /></section>;
  if (!hasProcedure && summary.orderedSteps.length === 0) return <section className="card-soft p-5 mb-4 space-y-3"><h2 className="font-medium">{t("journey.title")}</h2><p className="text-caption">{t("journey.notInitialized")}</p><Button variant="outline" onClick={() => void initialize()}>{t("journey.initialize")}</Button></section>;
  return <section className="card-soft p-5 mb-4 space-y-4">
    <div><h2 className="font-medium">{t("journey.title")}</h2><p className="text-caption">{t("journey.progress", { percent: summary.progressPercent })}</p></div>
    <div className="space-y-3">{summary.orderedSteps.map((step) => <div key={step.id} className="flex gap-3">
      {step.status === "terminee" ? <Check className="size-5 text-success" /> : step.status === "bloquee" ? <CircleAlert className="size-5 text-destructive" /> : <Circle className={`size-5 ${step.status === "en_cours" ? "text-primary fill-primary/20" : "text-muted-foreground"}`} />}
      <div><p className={`text-sm ${step.status === "en_cours" ? "font-semibold" : ""}`}>{step.title}</p><p className="text-caption">{t(`journey.levels.${step.territorial_level}`)} · {t(`journey.statuses.${step.status}`)}</p>{step.status === "bloquee" && <p className="text-xs text-destructive mt-1">{step.blocked_reason}</p>}</div>
    </div>)}</div>
    {summary.currentStep?.status === "en_cours" && <Button className="w-full" onClick={() => void completeCurrent()}>{t("journey.completeCurrent")}</Button>}
    <StepActorRecommendations procedureStepId={summary.currentStep?.procedure_step_id} />
  </section>;
}
