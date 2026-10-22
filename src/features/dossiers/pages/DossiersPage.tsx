import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { AppLayout, AssistantTip, EmptyState, NextActionCard, PageHeader } from "@/features/shell";
import { useAuth, useIdentity } from "@/features/identity";
import { usePendingSync, useTriggerSync, useUnsyncedDrafts } from "@/features/offline";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { CloudOff, FolderOpen, Loader2, RefreshCw, Search } from "lucide-react";
import { useDossiers } from "../hooks/useDossiers";
import { DossierStatusBadge } from "../components/DossierStatusBadge";
import { iconForType, typeLabelKey } from "../components/dossierTypeMeta";

export default function DossiersPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { dossiers, loading, loadError, reload } = useDossiers();
  const [query, setQuery] = useState("");
  const { isGuest } = useIdentity();
  const pendingCount = usePendingSync();
  const pending = isGuest ? 0 : pendingCount;
  const allDrafts = useUnsyncedDrafts(user?.id);
  const drafts = isGuest ? [] : allDrafts;
  const triggerSync = useTriggerSync();

  const filtered = useMemo(
    () => dossiers.filter((d) => d.title.toLowerCase().includes(query.toLowerCase())),
    [dossiers, query]
  );

  return (
    <AppLayout>
      <PageHeader title={t("dossiers.title")} subtitle={t("dossiers.subtitle")} />

      <AssistantTip className="mb-4" />

      {pending > 0 && (
        <div className="mb-3 flex items-center gap-2 rounded-2xl border border-warning/30 bg-warning/10 px-3 py-3 text-sm text-warning-foreground">
          <CloudOff className="size-4 shrink-0" />
          <span className="flex-1">{t("dossiers.pendingSync", { count: pending })}</span>
          <button onClick={() => triggerSync()} className="text-xs font-medium inline-flex items-center gap-1 hover:underline">
            <RefreshCw className="size-3" /> {t("dossiers.syncNow")}
          </button>
          <button onClick={() => navigate("/sync")} className="text-xs font-medium hover:underline">{t("sync.open")}</button>
        </div>
      )}

      {drafts.length > 0 && (
        <div className="mb-3 space-y-2">
          {drafts.map((d) => (
            <div key={d.localId} className="rounded-2xl border border-border/60 bg-card/80 p-3 flex items-center gap-3 shadow-[var(--shadow-soft)] opacity-90">
              <div className="size-10 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                <CloudOff className="size-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{d.title}</p>
                <p className="text-caption">{t("dossiers.draftPending")}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          className="pl-9 rounded-2xl border-border/70 bg-card/80 focus-visible:ring-2 focus-visible:ring-ring"
          placeholder={t("dossiers.search")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="size-5 animate-spin text-primary" />
        </div>
      ) : loadError ? (
        <div role="alert" className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
          <p className="mb-3">{t("auth.error")}</p>
          <button onClick={reload} className="tap focus-ring min-h-11 rounded-xl border border-border px-4 font-medium">
            {t("common.retry", "Réessayer")}
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title={t("dossiers.empty")}
          description={t("dossiers.emptyHint")}
          actionLabel={t("dossiers.createFirst")}
          onAction={() => navigate("/create")}
          secondaryLabel={t("next.askAssistant")}
          onSecondary={() => navigate("/assistant")}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((d) => {
            const Icon = iconForType(d.type);
            return (
              <button
                key={d.id}
                onClick={() =>
                  d.local ? toast.info(t("dossiers.localOnly")) : navigate(`/dossiers/${d.id}`)
                }
                className="group w-full rounded-3xl border border-border/60 bg-gradient-to-br from-card via-card to-accent/20 p-4 text-left shadow-[var(--shadow-soft)] hover:border-primary/20 hover:shadow-[var(--shadow-elegant)] transition flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="size-11 rounded-2xl bg-gradient-to-br from-accent to-secondary/70 flex items-center justify-center text-primary shrink-0 shadow-[var(--shadow-soft)]">
                  <Icon className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate mb-1">{d.title}</h3>
                  <div className="flex items-center gap-2">
                    <DossierStatusBadge status={d.status} />
                    <span className="text-caption">{t(typeLabelKey(d.type))}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <NextActionCard className="mt-4" />
    </AppLayout>
  );
}
