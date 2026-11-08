import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ChevronRight, CircleCheck, Loader2, LockKeyhole, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/features/shell";
import { useDossiers } from "@/features/dossiers/hooks/useDossiers";
import { useIdentity } from "@/features/identity";
import { DOSSIER_TYPES, typeLabelKey } from "@/features/dossiers/components/dossierTypeMeta";
import { PUBLIC_ASSET_CATEGORIES, PUBLIC_DOMAINS_V1 } from "../data/publicDomains";

const moduleIds = DOSSIER_TYPES.map(({ id }) => id);

export default function ModulePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { moduleId } = useParams();
  const { dossiers, loading } = useDossiers();
  const { isGuest, isAuthenticated, loading: identityLoading } = useIdentity();

  const id = moduleId && moduleIds.includes(moduleId) ? moduleId : "terrain";
  const moduleMeta = DOSSIER_TYPES.find((item) => item.id === id);
  const publicDomain = PUBLIC_DOMAINS_V1.find((domain) => domain.previewModuleId === id);
  const isPublicAssetPreview = isGuest && id === "terrain";
  const available = moduleMeta?.available ?? false;
  const translatedSteps = t(`modules.${id}.steps`, { returnObjects: true });
  const steps = Array.isArray(translatedSteps) ? translatedSteps as string[] : [];
  const related = useMemo(() => dossiers.filter((d) => d.type === id), [dossiers, id]);
  const secure = related.filter((d) => d.status === "secure").length;
  const inProgress = related.filter((d) => d.status !== "secure").length;

  const startRoute = id === "terrain" ? "/create?type=terrain" : "/assistant?module=" + encodeURIComponent(id);
  const nextStep = related.find((d) => d.status !== "secure");

  if (identityLoading) {
    return <AppLayout><div className="flex justify-center py-20"><Loader2 className="size-6 animate-spin text-primary" /></div></AppLayout>;
  }

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
            <h1 className="text-display mt-1">{id === "savoir" ? t(typeLabelKey(id)) : isGuest && publicDomain ? t(publicDomain.titleKey) : t(`modules.${id}.title`)}</h1>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{id === "savoir" ? t(moduleMeta?.descKey ?? "create.savoirDesc") : isGuest && publicDomain ? t(publicDomain.descriptionKey) : t(`modules.${id}.longDescription`)}</p>
            {!available && <p className="mt-3 inline-flex rounded-full bg-muted px-3 py-1.5 text-xs text-muted-foreground">{t("create.comingSoon")}</p>}
          </div>
        </div>
      </header>

      {isPublicAssetPreview && (
        <section className="mb-7">
          <h2 className="mb-4 text-lg font-semibold">{t("home.assetCategoriesTitle")}</h2>
          <ul className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {PUBLIC_ASSET_CATEGORIES.map((category) => (
              <li key={category.id} className="border-l-2 border-primary/30 pl-4">
                <h3 className="text-base font-semibold leading-snug">{t(category.titleKey)}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t(category.descriptionKey)}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {available && isAuthenticated ? <section className="rounded-3xl border border-border bg-card p-5 mb-5">
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
      </section> : !available ? <p className="text-sm text-muted-foreground mb-5">{t("modules.preparationHint")}</p> : null}
      {available && <p className="text-caption mb-5">{t("modules.legalNotice")}</p>}

      <section className="mb-5">
        <h2 className="text-base font-serif mb-3">{isPublicAssetPreview ? t("home.assetAvailableJourneyTitle") : available ? t("modules.stepsTitle") : t("modules.plannedSteps")}</h2>
        <ol className="divide-y divide-border/70">
          {steps.map((step, index) => (
            <li key={step} className="flex items-start gap-4 py-4">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-primary text-sm font-semibold">
                {index + 1}
              </span>
              <span className="flex-1 pt-1 text-base leading-relaxed">{step}</span>
              {isAuthenticated && index === 0 && secure > 0 ? <CircleCheck className="mt-1 size-5 shrink-0 text-primary" /> : null}
            </li>
          ))}
        </ol>
      </section>

      <Button variant="default"
        onClick={() => navigate(isGuest ? "/auth" : startRoute)}
        className="block h-auto whitespace-normal w-full rounded-2xl bg-primary text-primary-foreground p-4 text-left shadow-soft tap focus-ring"
      >
        <span className="flex items-center justify-between gap-3">
          <span>
            <span className="block font-semibold">
              {isGuest ? t("home.createAccountToContinue") : !available ? t("home.visitorAssistantCta") : t(`modules.cta.${secure > 0 ? "progress" : "new"}`)}
            </span>
            <span className="block text-sm opacity-85 mt-1">{isGuest ? t("home.previewOnlyHint") : !available ? t("modules.preparationHint") : nextStep ? nextStep.title : t("modules.guidedHint")}</span>
          </span>
          <ChevronRight className="size-5 shrink-0" />
        </span>
      </Button>
    </AppLayout>
  );
}
