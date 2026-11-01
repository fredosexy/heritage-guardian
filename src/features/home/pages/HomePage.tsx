import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/features/shell";
import { useProfile, ProfileCompletionCard } from "@/features/profile";
import { useIdentity, FirstStepDialog } from "@/features/identity";
import { useUnreadAlerts } from "@/features/alerts/hooks/useAlerts";
import { useDossiers } from "@/features/dossiers/hooks/useDossiers";
import { HomeHeader } from "../components/HomeHeader";
import { HomeModuleCard } from "../components/HomeModuleCard";
import { DOSSIER_TYPES } from "@/features/dossiers/components/dossierTypeMeta";
import { Button } from "@/components/ui/button";
import { ChevronRight, Loader2, Sparkles } from "lucide-react";

const severityClass = (severity: string) =>
  severity === "high" ? "border-l-destructive bg-destructive/5" : severity === "medium" ? "border-l-warning bg-warning/5" : "border-l-primary bg-primary/5";

const modules = DOSSIER_TYPES.map(({ id, icon, available }) => ({ id, icon, available }));

export default function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { profile, loading: profileLoading } = useProfile();
  const { alerts, loading: alertsLoading } = useUnreadAlerts(5);
  const { dossiers, loading: dossiersLoading } = useDossiers();
  const { isAuthenticated, displayName, guest } = useIdentity();
  const [personalizationOpen, setPersonalizationOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !profileLoading && profile && !profile.onboarding_completed) navigate("/onboarding", { replace: true });
  }, [profile, profileLoading, navigate, isAuthenticated]);

  const moduleStats = useMemo(
    () => modules.map((module) => {
      const related = dossiers.filter((dossier) => dossier.type === module.id);
      const attention = [...related].filter((d) => d.status !== "secure").sort((a, b) => b.completionScore - a.completionScore)[0];
      return {
        ...module,
        dossierCount: related.length,
        secureCount: related.filter((d) => d.status === "secure").length,
        riskCount: related.filter((d) => d.status === "risk").length,
        bestCompletion: Math.max(0, ...related.map((d) => d.completionScore)),
        nextDossierTitle: attention?.title,
        nextAttention: attention?.nextAttention,
        participantsCount: related.reduce((sum, dossier) => sum + dossier.participantsCount, 0),
        proofsCount: related.reduce((sum, dossier) => sum + dossier.proofsCount, 0),
        journeyProgress: Math.max(0, ...related.map((d) => d.journeyProgress ?? 0)),
        currentStepTitle: attention?.currentStepTitle ?? null,
        nextStepTitle: attention?.nextStepTitle ?? null,
        blockedStepTitle: attention?.blockedStepTitle ?? null,
      };
    }),
    [dossiers]
  );

  const firstActiveModule =
    moduleStats.find((module) => module.riskCount > 0) ??
    moduleStats.find((module) => module.dossierCount > 0 && module.secureCount < module.dossierCount) ??
    moduleStats.find((module) => module.dossierCount > 0) ??
    moduleStats[0];

  const openModule = (route: string) => navigate(route);
  const continueRoute = `/modules/${firstActiveModule.id}`;

  if (profileLoading || alertsLoading || dossiersLoading) {
    return <AppLayout><div className="flex justify-center py-20"><Loader2 className="size-6 animate-spin text-primary" /></div></AppLayout>;
  }

  if (!isAuthenticated) {
    return (
      <AppLayout>
        <section className="mb-7">
          <p className="text-xs uppercase tracking-[0.18em] text-primary font-medium">{t("home.visitorEyebrow")}</p>
          <h1 className="text-display mt-2 max-w-sm">{t("home.visitorTitle")}</h1>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed max-w-xl">{t("home.visitorVision")}</p>
          <Button className="mt-4" onClick={() => navigate("/create?type=terrain")}>{t("modules.visitorStart")}<ChevronRight className="size-4" /></Button>
          <p className="text-caption mt-3 max-w-xl">{t("modules.legalNotice")}</p>
        </section>
        <section className="mb-7 rounded-3xl border border-border/60 bg-card/80 p-4 shadow-[var(--shadow-soft)] backdrop-blur-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-medium">{guest.firstName ? t("firstStep.title") : t("firstStep.subtitle")}</p>
              <p className="text-sm text-muted-foreground mt-1">{guest.firstName ? guest.firstName : t("firstStep.namePlaceholder")}</p>
            </div>
            <Button variant="outline" className="shrink-0 rounded-xl" onClick={() => setPersonalizationOpen(true)}>{t("firstStep.continue")}</Button>
          </div>
        </section>
        <FirstStepDialog open={personalizationOpen} onClose={() => setPersonalizationOpen(false)} />
        <section className="mb-7">
          <div className="flex items-end justify-between gap-3 mb-3"><div><h2 className="text-base font-serif">{t("home.modulesTitle")}</h2><p className="text-caption mt-1">{t("home.modulesVisitorHint")}</p></div><Sparkles className="size-5 text-primary" /></div>
          <div className="space-y-3">{moduleStats.map((module) => <HomeModuleCard key={module.id} id={module.id} icon={module.icon} dossierCount={module.dossierCount} secureCount={module.secureCount} riskCount={module.riskCount} bestCompletion={module.bestCompletion} nextDossierTitle={module.nextDossierTitle} nextAttention={module.nextAttention} journeyProgress={module.journeyProgress} currentStepTitle={module.currentStepTitle} nextStepTitle={module.nextStepTitle} blockedStepTitle={module.blockedStepTitle} participantsCount={module.participantsCount} proofsCount={module.proofsCount} onFirstGesture={openModule} available={module.available} />)}</div>
        </section>
        <section className="rounded-[2rem] border border-white/70 bg-gradient-hero p-5 text-foreground shadow-[var(--shadow-elegant)] mb-6">
          <div className="flex items-start gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-card/75 text-primary shadow-[var(--shadow-soft)]"><Sparkles className="size-5" /></span><div><p className="font-semibold">{t("home.visitorAssistantTitle")}</p><p className="text-sm text-muted-foreground mt-1 leading-relaxed">{t("home.visitorAssistantHint")}</p></div></div>
          <Button onClick={() => navigate("/assistant")} variant="secondary" className="w-full mt-4 rounded-2xl justify-between shadow-[var(--shadow-soft)]">{t("home.visitorAssistantCta")}<ChevronRight className="size-4" /></Button>
        </section>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <HomeHeader firstName={profile?.full_name?.split(" ")[0] || displayName} zone={guest.locationName} alertCount={alerts.length} />
      <p className="text-caption mb-5">{t("app.name")} · {t("modules.legalNotice")}</p>
      <ProfileCompletionCard />
      <section className="mb-6">
        <div className="flex items-end justify-between gap-3 mb-3"><div><h2 className="text-base font-serif">{t("home.continueTitle")}</h2><p className="text-caption mt-1">{t("home.continueHint")}</p></div><button onClick={() => navigate(continueRoute)} className="text-xs text-primary font-medium tap focus-ring">{t("home.open")}</button></div>
        <button onClick={() => navigate(continueRoute)} className="w-full rounded-3xl bg-gradient-hero p-5 text-left text-primary-foreground shadow-elegant tap focus-ring">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wide opacity-75">{t("home.nextModuleLabel")}</p>
              <p className="text-xl font-serif mt-1">{t(`modules.${firstActiveModule.id}.title`)}</p>
              <p className="text-sm opacity-85 mt-2 leading-relaxed">
                {firstActiveModule.blockedStepTitle
                  ? t("modules.journeyBlocked") + ": " + firstActiveModule.blockedStepTitle
                  : firstActiveModule.currentStepTitle
                    ? t("modules.journeyCurrent") + ": " + firstActiveModule.currentStepTitle
                    : firstActiveModule.riskCount > 0
                      ? t("home.continueRisk", { count: firstActiveModule.riskCount })
                      : firstActiveModule.dossierCount > 0
                        ? t("home.continueExisting", { count: firstActiveModule.dossierCount })
                        : t("home.continueNew")}
              </p>
              {firstActiveModule.nextStepTitle && !firstActiveModule.blockedStepTitle && (
                <p className="text-xs opacity-75 mt-2">
                  {t("modules.journeyNext")}: {firstActiveModule.nextStepTitle}
                </p>
              )}
            </div>
            <ChevronRight className="size-5 shrink-0" />
          </div>
        </button>
      </section>
      <section className="mb-6">
        <div className="flex items-end justify-between gap-3 mb-3"><div><h2 className="text-base font-serif">{t("home.modulesTitle")}</h2><p className="text-caption mt-1">{t("home.modulesConnectedHint")}</p></div></div>
        <div className="space-y-3">{moduleStats.map((module) => <HomeModuleCard key={module.id} id={module.id} icon={module.icon} dossierCount={module.dossierCount} secureCount={module.secureCount} riskCount={module.riskCount} bestCompletion={module.bestCompletion} nextDossierTitle={module.nextDossierTitle} nextAttention={module.nextAttention} journeyProgress={module.journeyProgress} currentStepTitle={module.currentStepTitle} nextStepTitle={module.nextStepTitle} blockedStepTitle={module.blockedStepTitle} participantsCount={module.participantsCount} proofsCount={module.proofsCount} available={module.available} />)}</div>
      </section>
      <section className="mb-6">
        <h2 className="text-base font-serif mb-3 flex items-center justify-between"><span>{t("home.alerts")}</span>{alerts.length > 0 && <button onClick={() => navigate("/alerts")} className="text-xs text-primary font-sans flex items-center gap-0.5">{alerts.length} <ChevronRight className="size-3" /></button>}</h2>
        {alerts.length === 0 ? <div className="card-soft p-4 text-sm text-muted-foreground text-center">{t("home.noAlerts")}</div> : <div className="space-y-2">{alerts.slice(0, 3).map((a) => <button key={a.id} onClick={() => a.action_route && navigate(a.action_route)} className={`w-full text-left rounded-xl border-l-4 p-3 ${severityClass(a.severity)}`}><p className="text-sm font-medium">{a.title}</p><p className="text-caption mt-0.5">{a.message}</p></button>)}</div>}
      </section>
      <Button onClick={() => navigate("/assistant")} variant="outline" className="w-full justify-between rounded-2xl py-6"><span className="flex items-center gap-2"><Sparkles className="size-4 text-primary" /> {t("ai.title")}</span><ChevronRight className="size-4" /></Button>
    </AppLayout>
  );
}
