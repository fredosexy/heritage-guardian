import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Building2, ChevronRight, CircleCheck, LockKeyhole, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/features/shell";
import { useDossiers } from "@/features/dossiers/hooks/useDossiers";
import { useIdentity } from "@/features/identity";
import { DOSSIER_TYPES, typeLabelKey } from "@/features/dossiers/components/dossierTypeMeta";

const moduleIds = DOSSIER_TYPES.filter(({ id }) => id !== "batiment").map(({ id }) => id);

export default function ModulePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { moduleId } = useParams();
  const { dossiers, loading } = useDossiers();
  const { isGuest } = useIdentity();

  const id = moduleId && moduleIds.includes(moduleId) ? moduleId : "terrain";
  const moduleMeta = DOSSIER_TYPES.find((item) => item.id === id);
  const available = moduleMeta?.available ?? false;
  const translatedSteps = t(`modules.${id}.steps`, { returnObjects: true });
  const steps = Array.isArray(translatedSteps) ? translatedSteps as string[] : [];
  const related = useMemo(() => dossiers.filter((d) => d.type === id), [dossiers, id]);
  const secure = related.filter((d) => d.status === "secure").length;
  const inProgress = related.filter((d) => d.status !== "secure").length;

  const startRoute = id === "terrain" ? "/create?type=terrain" : "/assistant?module=" + encodeURIComponent(id);
  const nextStep = related.find((d) => d.status !== "secure");

  return (
    <AppLayout>
      <button onClick={() => navigate("/")} className="mb-5 inline-flex items-center gap-2 text-sm text-muted-foreground tap focus-ring">
        <ArrowLeft className="size-4" /> {t("common.back")}
      </button>

      <header className="mb-6">
        <div className="flex items-start gap-4">
          <span className="size-12 rounded-2xl bg-accent text-primary flex items-center justify-center shrink-0">
            <Sparkles className="size-6" />
          </span>
          <div>
            <p className="text-xs uppercase tracking-wide text-primary font-medium">{t("modules.label")}</p>
            <h1 className="text-display mt-1">{id === "savoir" ? t(typeLabelKey(id)) : t(`modules.${id}.title`)}</h1>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{id === "savoir" ? t(moduleMeta?.descKey ?? "create.savoirDesc") : t(`modules.${id}.longDescription`)}</p>
            {!available && <p className="mt-3 inline-flex rounded-full bg-muted px-3 py-1.5 text-xs text-muted-foreground">{t("create.comingSoon")}</p>}
          </div>
        </div>
      </header>

      {available ? <section className="rounded-3xl border border-border bg-card p-5 mb-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <p className="text-sm font-semibold">{t("modules.progressTitle")}</p>
            <p className="text-xs text-muted-foreground mt-1">{t("modules.progressHint")}</p>
          </div>
          {loading ? null : (
            <span className="text-sm font-medium text-primary">
              {related.length === 0 ? t("modules.state.new") : secure > 0 ? t("modules.state.secure") : t("modules.state.progress")}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-2xl bg-muted p-3">
            <p className="text-2xl font-semibold">{related.length}</p>
            <p className="text-xs text-muted-foreground">{t("modules.dossiersCount", { count: related.length })}</p>
          </div>
          <div className="rounded-2xl bg-muted p-3">
            <p className="text-2xl font-semibold">{secure}</p>
            <p className="text-xs text-muted-foreground">{t("modules.secureCount", { count: secure })}</p>
          </div>
        </div>

        {inProgress > 0 && (
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <LockKeyhole className="size-4 text-primary" />
            {t("modules.inProgressHint", { count: inProgress })}
          </div>
        )}
      </section> : <p className="text-sm text-muted-foreground mb-5">{t("modules.preparationHint")}</p>}
      {available && <p className="text-caption mb-5">{t("modules.legalNotice")}</p>}

      <section className="mb-5">
        <h2 className="text-base font-serif mb-3">{available ? t("modules.stepsTitle") : t("modules.plannedSteps")}</h2>
        <div className="space-y-2">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
              <span className="size-7 rounded-full bg-accent text-primary flex items-center justify-center text-xs font-semibold">
                {index + 1}
              </span>
              <span className="text-sm">{step}</span>
              {index === 0 && secure > 0 ? <CircleCheck className="ml-auto size-4 text-primary" /> : null}
            </div>
          ))}
        </div>
      </section>

      {id === "terrain" && (
        <section className="mb-5 rounded-3xl border border-border/60 bg-card/85 p-5 shadow-[var(--shadow-soft)]">
          <div className="flex items-start gap-3">
            <span className="size-11 rounded-2xl bg-accent text-primary flex items-center justify-center shrink-0">
              <Building2 className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-semibold">{t(typeLabelKey("batiment"))}</h2>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{t("create.buildingDesc")}</p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <Button variant="outline" onClick={() => navigate(isGuest ? "/auth" : "/buildings")} className="min-h-11 rounded-2xl">
                  {t(isGuest ? "home.visitorAccountCta" : "buildings.viewAll")} <ChevronRight className="size-4 ml-2" />
                </Button>
                <Button onClick={() => navigate(isGuest ? "/auth" : "/create?type=batiment")} className="min-h-11 rounded-2xl">
                  {t(isGuest ? "home.visitorAccountCta" : "create.buildingFormTitle")} <ChevronRight className="size-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      <Button variant="default"
        onClick={() => navigate(startRoute)}
        className="block h-auto whitespace-normal w-full rounded-2xl bg-gradient-warm text-primary-foreground p-4 text-left shadow-warm tap focus-ring"
      >
        <span className="flex items-center justify-between gap-3">
          <span>
            <span className="block font-semibold">
              {!available ? t("home.visitorAssistantCta") : isGuest ? t("modules.visitorStart") : t(`modules.cta.${secure > 0 ? "progress" : "new"}`)}
            </span>
            <span className="block text-sm opacity-85 mt-1">{!available ? t("modules.preparationHint") : nextStep ? nextStep.title : t("modules.guidedHint")}</span>
          </span>
          <ChevronRight className="size-5 shrink-0" />
        </span>
      </Button>
    </AppLayout>
  );
}
