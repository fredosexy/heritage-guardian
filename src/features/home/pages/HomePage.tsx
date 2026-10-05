import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { AppLayout, NextActionCard } from "@/features/shell";
import { useProfile, ProfileCompletionCard } from "@/features/profile";
import { FirstStepDialog, VisitorBanner, useIdentity } from "@/features/identity";
import { useUnreadAlerts } from "@/features/alerts/hooks/useAlerts";
import { useDossiers } from "@/features/dossiers/hooks/useDossiers";
import { HomeHeader } from "../components/HomeHeader";
import { HomeModuleCard } from "../components/HomeModuleCard";
import { Button } from "@/components/ui/button";
import { ChevronRight, Loader2, MapPin, Scale, ScrollText, Sparkles, Users } from "lucide-react";

const severityClass = (severity: string) =>
  severity === "high" ? "border-l-destructive bg-destructive/5" : severity === "medium" ? "border-l-warning bg-warning/5" : "border-l-primary bg-primary/5";

const modules = [
  { id: "terrain", icon: MapPin },
  { id: "heritage", icon: Users },
  { id: "conflit", icon: Scale },
  { id: "volonte", icon: ScrollText },
] as const;

export default function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { profile, loading: profileLoading } = useProfile();
  const { alerts, loading: alertsLoading } = useUnreadAlerts(5);
  const { dossiers, loading: dossiersLoading } = useDossiers();
  const { isAuthenticated, displayName, guest, needsFirstStep } = useIdentity();
  const [firstStepOpen, setFirstStepOpen] = useState(false);
  const [pendingRoute, setPendingRoute] = useState<string | null>(null);

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
      };
    }),
    [dossiers]
  );

  const firstActiveModule =
    moduleStats.find((module) => module.riskCount > 0) ??
    moduleStats.find((module) => module.dossierCount > 0 && module.secureCount < module.dossierCount) ??
    moduleStats.find((module) => module.dossierCount > 0) ??
    moduleStats[0];

  const openModule = (route: string) => {
    if (!isAuthenticated && needsFirstStep) {
      setPendingRoute(route);
      setFirstStepOpen(true);
      return;
    }
    navigate(route);
  };

  const continueRoute = `/modules/${firstActiveModule.id}`;

  if (profileLoading || alertsLoading || dossiersLoading) {
    return <AppLayout><div className="flex justify-center py-20"><Loader2 className="size-6 animate-spin text-primary" /></div></AppLayout>;
  }

  if (!isAuthenticated) {
    return (
      <AppLayout>
        <VisitorBanner />
        <section className="mb-7">
          <p className="text-xs uppercase tracking-[0.18em] text-primary font-medium">{t("home.visitorEyebrow")}</p>
          <h1 className="text-display mt-2">{t("home.visitorTitle")}</h1>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed max-w-xl">{t("home.visitorVision")}</p>
        </section>
        <section className="mb-7">
          <div className="flex items-end justify-between gap-3 mb-3"><div><h2 className="text-base font-serif">{t("home.modulesTitle")}</h2><p className="text-caption mt-1">{t("home.modulesVisitorHint")}</p></div><Sparkles className="size-5 text-primary" /></div>
          <div className="space-y-3">{moduleStats.map((module) => <HomeModuleCard key={module.id} id={module.id} icon={module.icon} dossierCount={module.dossierCount} secureCount={module.secureCount} riskCount={module.riskCount} bestCompletion={module.bestCompletion} nextDossierTitle={module.nextDossierTitle} onFirstGesture={openModule} />)}</div>
        </section>
        <section className="rounded-3xl bg-gradient-hero p-5 text-primary-foreground shadow-elegant mb-6">
          <div className="flex items-start gap-3"><Sparkles className="size-5 mt-0.5 shrink-0" /><div><p className="font-semibold">{t("home.visitorAssistantTitle")}</p><p className="text-sm opacity-85 mt-1 leading-relaxed">{t("home.visitorAssistantHint")}</p></div></div>
          <Button onClick={() => openModule("/assistant")} variant="secondary" className="w-full mt-4 rounded-2xl justify-between">{t("home.visitorAssistantCta")}<ChevronRight className="size-4" /></Button>
        </section>
        <section className="rounded-3xl border border-border bg-card p-5 mb-4"><p className="text-sm font-semibold">{t("home.visitorIdentityTitle")}</p><p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{t("home.visitorIdentityHint")}</p><Button onClick={() => navigate("/auth")} className="w-full mt-4 rounded-2xl">{t("home.visitorAccountCta")}</Button></section>
        <FirstStepDialog open={firstStepOpen} onClose={() => { setFirstStepOpen(false); if (pendingRoute) { const route = pendingRoute; setPendingRoute(null); navigate(route); } }} />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <HomeHeader firstName={profile?.full_name?.split(" ")[0] || displayName} zone={guest.locationName} alertCount={alerts.length} />
      <ProfileCompletionCard />
      <section className="mb-6">
        <div className="flex items-end justify-between gap-3 mb-3"><div><h2 className="text-base font-serif">{t("home.continueTitle")}</h2><p className="text-caption mt-1">{t("home.continueHint")}</p></div><button onClick={() => navigate(continueRoute)} className="text-xs text-primary font-medium tap focus-ring">{t("home.open")}</button></div>
        <button onClick={() => navigate(continueRoute)} className="w-full rounded-3xl bg-gradient-hero p-5 text-left text-primary-foreground shadow-elegant tap focus-ring">
          <div className="flex items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-wide opacity-75">{t("home.nextModuleLabel")}</p><p className="text-xl font-serif mt-1">{t(`modules.${firstActiveModule.id}.title`)}</p><p className="text-sm opacity-85 mt-2 leading-relaxed">{firstActiveModule.riskCount > 0 ? t("home.continueRisk", { count: firstActiveModule.riskCount }) : firstActiveModule.dossierCount > 0 ? t("home.continueExisting", { count: firstActiveModule.dossierCount }) : t("home.continueNew")}</p></div><ChevronRight className="size-5 shrink-0" /></div>
        </button>
      </section>
      <section className="mb-6">
        <div className="flex items-end justify-between gap-3 mb-3"><div><h2 className="text-base font-serif">{t("home.modulesTitle")}</h2><p className="text-caption mt-1">{t("home.modulesConnectedHint")}</p></div></div>
        <div className="space-y-3">{moduleStats.map((module) => <HomeModuleCard key={module.id} id={module.id} icon={module.icon} dossierCount={module.dossierCount} secureCount={module.secureCount} riskCount={module.riskCount} bestCompletion={module.bestCompletion} nextDossierTitle={module.nextDossierTitle} />)}</div>
      </section>
      <section className="mb-6">
        <h2 className="text-base font-serif mb-3 flex items-center justify-between"><span>{t("home.alerts")}</span>{alerts.length > 0 && <button onClick={() => navigate("/alerts")} className="text-xs text-primary font-sans flex items-center gap-0.5">{alerts.length} <ChevronRight className="size-3" /></button>}</h2>
        {alerts.length === 0 ? <div className="card-soft p-4 text-sm text-muted-foreground text-center">{t("home.noAlerts")}</div> : <div className="space-y-2">{alerts.slice(0, 3).map((a) => <button key={a.id} onClick={() => a.action_route && navigate(a.action_route)} className={`w-full text-left rounded-xl border-l-4 p-3 ${severityClass(a.severity)}`}><p className="text-sm font-medium">{a.title}</p><p className="text-caption mt-0.5">{a.message}</p></button>)}</div>}
      </section>
      <NextActionCard className="mb-6" />
      <Button onClick={() => navigate("/assistant")} variant="outline" className="w-full justify-between rounded-2xl py-6"><span className="flex items-center gap-2"><Sparkles className="size-4 text-primary" /> {t("ai.title")}</span><ChevronRight className="size-4" /></Button>
    </AppLayout>
  );
}
