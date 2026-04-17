import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Users, ScrollText, Scale, BookOpen, Loader2, FolderOpen, CloudOff, RefreshCw } from "lucide-react";
import { usePendingSync, useUnsyncedDrafts, useTriggerSync } from "@/hooks/useOfflineSync";

const TYPE_ICONS: Record<string, any> = {
  terrain: MapPin, heritage: Users, volonte: ScrollText, conflit: Scale, savoir: BookOpen,
};

export default function Dossiers() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from("dossiers").select("*").eq("user_id", user.id).order("updated_at", { ascending: false })
      .then(({ data }) => { setItems(data || []); setLoading(false); });
  }, [user]);

  const filtered = items.filter(d => d.title.toLowerCase().includes(q.toLowerCase()));

  const statusBadge = (s: string) => {
    const map: Record<string, { label: string; cls: string; dot: string }> = {
      secure: { label: t("dossiers.statusSecure"), cls: "bg-success/10 text-success", dot: "bg-success" },
      incomplete: { label: t("dossiers.statusIncomplete"), cls: "bg-warning/10 text-warning-foreground", dot: "bg-warning" },
      risk: { label: t("dossiers.statusRisk"), cls: "bg-destructive/10 text-destructive", dot: "bg-destructive" },
    };
    const v = map[s] || map.incomplete;
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full font-medium ${v.cls}`}>
        <span className={`size-1.5 rounded-full ${v.dot}`} />{v.label}
      </span>
    );
  };

  return (
    <AppLayout>
      <h1 className="text-2xl font-serif mb-4">{t("dossiers.title")}</h1>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input className="pl-9 rounded-xl" placeholder={t("dossiers.search")} value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="size-5 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="card-soft p-8 text-center">
          <FolderOpen className="size-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">{t("dossiers.empty")}</p>
          <Button onClick={() => navigate("/create")} className="bg-gradient-warm">
            {t("dossiers.createFirst")}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((d) => {
            const Icon = TYPE_ICONS[d.type] || FolderOpen;
            return (
              <button
                key={d.id}
                onClick={() => navigate(`/dossiers/${d.id}`)}
                className="w-full card-soft p-4 text-left hover:shadow-warm transition flex items-center gap-3"
              >
                <div className="size-11 rounded-xl bg-accent flex items-center justify-center text-primary shrink-0">
                  <Icon className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="font-medium truncate">{d.title}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {statusBadge(d.status)}
                    <span className="text-xs text-muted-foreground">{t(`dossiers.type${d.type.charAt(0).toUpperCase() + d.type.slice(1)}`)}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}
