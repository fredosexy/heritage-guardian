import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Building2, CloudOff, FolderOpen, Loader2, MapPin, Plus, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";
import { AppLayout, EmptyState, PageHeader } from "@/features/shell";
import { useIdentity } from "@/features/identity";
import { usePendingSync, useTriggerSync } from "@/features/offline";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDossiers } from "../hooks/useDossiers";
import { DossierStatusBadge } from "../components/DossierStatusBadge";

type BuildingFilter = "all" | "incomplete" | "secure" | "risk";

const FILTERS: BuildingFilter[] = ["all", "incomplete", "secure", "risk"];

export default function BuildingsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isGuest } = useIdentity();
  const { dossiers, loading, loadError, reload } = useDossiers();
  const pendingCount = usePendingSync();
  const triggerSync = useTriggerSync();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<BuildingFilter>("all");

  const buildings = useMemo(() => dossiers.filter((dossier) => dossier.type === "batiment"), [dossiers]);
  const counts = useMemo(() => ({
    all: buildings.length,
    incomplete: buildings.filter((item) => item.status === "incomplete").length,
    secure: buildings.filter((item) => item.status === "secure").length,
    risk: buildings.filter((item) => item.status === "risk").length,
  }), [buildings]);
  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    return buildings.filter((item) => {
      const matchesQuery = !normalized ||
        item.title.toLocaleLowerCase().includes(normalized) ||
        (item.locationName ?? "").toLocaleLowerCase().includes(normalized);
      return matchesQuery && (filter === "all" || item.status === filter);
    });
  }, [buildings, filter, query]);

  return (
    <AppLayout>
      <PageHeader
        title={t("buildings.title")}
        subtitle={t("buildings.subtitle")}
        parentLabel={t("modules.terrain.title")}
        showBack
        right={
          <Button onClick={() => navigate("/create?type=batiment")} className="min-h-11 shrink-0 rounded-2xl px-3 sm:px-4">
            <Plus className="size-4 sm:mr-2" />
            <span className="hidden sm:inline">{t("buildings.create")}</span>
            <span className="sm:hidden">{t("common.add", "Ajouter")}</span>
          </Button>
        }
      />

      {pendingCount > 0 && !isGuest && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-warning/30 bg-warning/10 px-3 py-3 text-sm text-warning-foreground">
          <CloudOff className="size-4 shrink-0" />
          <span className="min-w-0 flex-1">{t("dossiers.pendingSync", { count: pendingCount })}</span>
          <button type="button" onClick={() => triggerSync()} className="inline-flex min-h-10 items-center gap-1 rounded-lg px-2 text-xs font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <RefreshCw className="size-3" />{t("dossiers.syncNow")}
          </button>
          <button type="button" onClick={() => navigate("/sync")} className="min-h-10 rounded-lg px-2 text-xs font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{t("sync.open")}</button>
        </div>
      )}

      <div className="relative mb-4">
        <Search aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("buildings.search")}
          aria-label={t("buildings.search")}
          className="min-h-12 rounded-2xl border-border/70 bg-card/80 pl-9 focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label={t("buildings.filterLabel")}>
        {FILTERS.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={filter === item}
            onClick={() => setFilter(item)}
            className={filter === item
              ? "min-h-11 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              : "min-h-11 rounded-full border border-border bg-card px-4 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"}
          >
            {t("buildings.filters." + item)} <span className="ml-1 tabular-nums opacity-80">{counts[item]}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12" role="status" aria-label={t("common.loading")}>
          <Loader2 className="size-5 animate-spin text-primary" />
        </div>
      ) : loadError ? (
        <div role="alert" className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
          <p className="mb-3">{t("auth.error")}</p>
          <Button variant="outline" onClick={reload} className="min-h-11 rounded-xl">{t("common.retry", "Réessayer")}</Button>
        </div>
      ) : buildings.length === 0 ? (
        <EmptyState
          icon={Building2}
          title={t("buildings.empty")}
          description={t("buildings.emptyHint")}
          actionLabel={t("buildings.create")}
          onAction={() => navigate("/create?type=batiment")}
          secondaryLabel={t("next.seeDossiers")}
          onSecondary={() => navigate("/dossiers")}
        />
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-border/60 bg-card/80 p-6 text-center">
          <FolderOpen className="mx-auto size-7 text-muted-foreground" />
          <h2 className="mt-3 text-base font-semibold">{t("buildings.noResults")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("buildings.noResultsHint")}</p>
          <Button variant="outline" onClick={() => { setQuery(""); setFilter("all"); }} className="mt-4 min-h-11 rounded-xl">{t("buildings.clearFilters")}</Button>
        </div>
      ) : (
        <section aria-label={t("buildings.resultsLabel")} className="space-y-3">
          <p className="text-xs text-muted-foreground">{t("buildings.resultCount", { count: filtered.length })}</p>
          {filtered.map((building) => (
            <button
              key={building.id}
              type="button"
              onClick={() => building.local
                ? toast.info(t("dossiers.localOnly"))
                : navigate("/dossiers/" + building.id)}
              className="group flex min-h-24 w-full items-center gap-3 rounded-3xl border border-border/60 bg-card/85 p-4 text-left shadow-[var(--shadow-soft)] transition hover:border-primary/30 hover:shadow-[var(--shadow-elegant)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-accent text-primary">
                <Building2 className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-base font-semibold">{building.title}</span>
                <span className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="size-3.5 shrink-0" />
                  <span className="truncate">{building.locationName || t("buildings.locationNotSpecified")}</span>
                </span>
                <span className="mt-2 flex flex-wrap items-center gap-2">
                  <DossierStatusBadge status={building.status} />
                  {building.local && <span className="text-xs text-muted-foreground">{t("dossiers.draftPending")}</span>}
                </span>
              </span>
              <span aria-hidden="true" className="text-lg text-muted-foreground transition-transform group-hover:translate-x-0.5">›</span>
            </button>
          ))}
        </section>
      )}
    </AppLayout>
  );
}
