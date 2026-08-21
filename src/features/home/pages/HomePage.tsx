import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/features/shell";
import { useAuth } from "@/features/identity";
import { useProfile } from "@/features/profile";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, MapPin, Users, ScrollText, Scale, Bell, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface Alert {
  id: string;
  type: string;
  severity: string;
  title: string;
  message: string;
  action_label: string | null;
  action_route: string | null;
  read: boolean;
}

export default function Home() {
  const { t } = useTranslation();
  const { profile, loading: profileLoading } = useProfile();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profileLoading) return;
    if (profile && !profile.onboarding_completed) {
      navigate("/onboarding", { replace: true });
      return;
    }
    if (!user) return;
    supabase.from("alerts")
      .select("*").eq("user_id", user.id).eq("read", false)
      .order("created_at", { ascending: false }).limit(5)
      .then(({ data }) => {
        setAlerts((data || []) as Alert[]);
        setLoading(false);
      });
  }, [user, profile, profileLoading, navigate]);

  const quickActions = [
    { icon: MapPin, label: t("home.quickSecure"), route: "/create?type=terrain", color: "bg-gradient-warm" },
    { icon: Users, label: t("home.quickHeritage"), route: "/create?type=heritage", color: "bg-secondary" },
    { icon: ScrollText, label: t("home.quickWill"), route: "/create?type=volonte", color: "bg-secondary" },
    { icon: Scale, label: t("home.quickConflict"), route: "/create?type=conflit", color: "bg-secondary" },
  ];

  const severityColor = (s: string) =>
    s === "high" ? "border-l-destructive bg-destructive/5"
    : s === "medium" ? "border-l-warning bg-warning/5"
    : "border-l-primary bg-primary/5";

  if (profileLoading || loading) {
    return <AppLayout><div className="flex justify-center py-20"><Loader2 className="size-6 animate-spin text-primary" /></div></AppLayout>;
  }

  return (
    <AppLayout>
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-muted-foreground">{t("home.greeting")}</p>
          <h1 className="text-xl font-serif">{profile?.full_name || "👋"}</h1>
        </div>
        <button
          onClick={() => navigate("/alerts")}
          className="relative size-11 rounded-full bg-card border flex items-center justify-center shadow-soft"
          aria-label={t("nav.alerts")}
        >
          <Bell className="size-5" />
          {alerts.length > 0 && (
            <span className="absolute -top-1 -right-1 size-5 text-[10px] rounded-full bg-destructive text-destructive-foreground flex items-center justify-center font-bold">
              {alerts.length}
            </span>
          )}
        </button>
      </header>

      {/* AI block */}
      <section className="rounded-3xl bg-gradient-hero p-6 text-primary-foreground shadow-elegant mb-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="size-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
            <Sparkles className="size-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide opacity-80">{t("ai.title")}</p>
            <p className="text-lg font-serif leading-tight">{t("home.aiPrompt")}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map(({ icon: Icon, label, route }) => (
            <button
              key={label}
              onClick={() => navigate(route)}
              className="rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur p-3 text-left transition flex flex-col gap-1.5"
            >
              <Icon className="size-5" />
              <span className="text-sm font-medium leading-tight">{label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Alerts */}
      <section className="mb-6">
        <h2 className="text-base font-serif mb-3 flex items-center justify-between">
          <span>{t("home.alerts")}</span>
          {alerts.length > 0 && (
            <button onClick={() => navigate("/alerts")} className="text-xs text-primary font-sans flex items-center gap-0.5">
              {alerts.length} <ChevronRight className="size-3" />
            </button>
          )}
        </h2>
        {alerts.length === 0 ? (
          <div className="card-soft p-4 text-sm text-muted-foreground text-center">
            {t("home.noAlerts")}
          </div>
        ) : (
          <div className="space-y-2">
            {alerts.slice(0, 3).map((a) => (
              <button
                key={a.id}
                onClick={() => a.action_route && navigate(a.action_route)}
                className={`w-full text-left rounded-xl border-l-4 p-3 ${severityColor(a.severity)}`}
              >
                <p className="text-sm font-medium">{a.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{a.message}</p>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* AI Chat shortcut */}
      <Button
        onClick={() => navigate("/assistant")}
        variant="outline"
        className="w-full justify-between rounded-2xl py-6"
      >
        <span className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" /> {t("ai.title")}
        </span>
        <ChevronRight className="size-4" />
      </Button>
    </AppLayout>
  );
}
