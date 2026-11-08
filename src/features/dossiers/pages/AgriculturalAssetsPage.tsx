import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, CloudOff, Loader2, MapPin, Plus, Search, Sprout } from "lucide-react";
import { toast } from "sonner";
import { AppLayout, EmptyState, PageHeader } from "@/features/shell";
import { useIdentity } from "@/features/identity";
import { useDossiers } from "../hooks/useDossiers";
import { useCreateDossier } from "../hooks/useCreateDossier";
import { DossierStatusBadge } from "../components/DossierStatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AgriculturalFamilyFields } from "./AgriculturalFamilyFields";

const FAMILIES = ["exploitation", "plantation", "elevage", "equipement", "infrastructure", "autre"] as const;
type Family = typeof FAMILIES[number];

function getAssetData(metadata: unknown): Record<string, unknown> {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return {};
  const value = (metadata as Record<string, unknown>).agriculturalRural;
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

export default function AgriculturalAssetsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isGuest } = useIdentity();
  const { dossiers, loading, loadError, reload } = useDossiers();
  const { create, saving } = useCreateDossier();
  const [creating, setCreating] = useState(false);
  const [query, setQuery] = useState("");
  const [familyFilter, setFamilyFilter] = useState<Family | "all">("all");
  const [family, setFamily] = useState<Family>("exploitation");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [locality, setLocality] = useState("");
  const [specifics, setSpecifics] = useState("");
  const [familyDetails, setFamilyDetails] = useState<Record<string, string>>({});

  const assets = useMemo(() => dossiers.filter((item) => item.type === "agricole"), [dossiers]);
  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    return assets.filter((item) => {
      const data = getAssetData(item.metadata);
      const itemFamily = typeof data.family === "string" ? data.family : "autre";
      const matchesQuery = !normalized ||
        item.title.toLocaleLowerCase().includes(normalized) ||
        (item.locationName ?? "").toLocaleLowerCase().includes(normalized);
      return matchesQuery && (familyFilter === "all" || itemFamily === familyFilter);
    });
  }, [assets, familyFilter, query]);

  const resetForm = () => {
    setFamily("exploitation");
    setTitle("");
    setDescription("");
    setLocality("");
    setSpecifics("");
    setFamilyDetails({});
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim()) return;
    try {
      const result = await create({
        type: "agricole",
        title: title.trim(),
        description: description.trim(),
        location_name: locality.trim() || undefined,
        metadata: {
          agriculturalRural: {
            version: 1,
            family,
            declaredDetails: specifics.trim() || null,
            familyDetails: Object.fromEntries(Object.entries(familyDetails).filter(([, value]) => value.trim() !== "")),
            declarationStatus: "declare",
            source: "declarant",
          },
        },
      });
      if (!result) return;
      if (result.mode === "online") {
        toast.success(t("agricultural.saved"));
        resetForm();
        navigate("/dossiers/" + result.id);
      } else {
        toast.success(t(result.mode === "local" ? "create.savedLocal" : "create.savedOffline"));
        resetForm();
        setCreating(false);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("auth.error"));
    }
  };

  if (creating) {
    return (
      <AppLayout>
        <button type="button" onClick={() => setCreating(false)} className="mb-4 inline-flex min-h-11 items-center gap-2 rounded-lg text-sm text-muted-foreground focus-ring">
          <ArrowLeft className="size-4" />{t("common.back")}
        </button>
        <header className="mb-6 flex items-start gap-4">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-accent text-primary"><Sprout className="size-7" /></span>
          <div>
            <p className="text-overline text-primary">{t("modules.label")}</p>
            <h1 className="text-display mt-1">{t("agricultural.createTitle")}</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t("agricultural.createHint")}</p>
          </div>
        </header>
        <form onSubmit={(event) => void submit(event)} className="space-y-4">
          <section className="card-soft space-y-4 p-4 sm:p-5">
            <div>
              <Label htmlFor="agricultural-family">{t("agricultural.family")}</Label>
              <select id="agricultural-family" value={family} onChange={(event) => { setFamily(event.target.value as Family); setSpecifics(""); setFamilyDetails({}); }} className="mt-1.5 min-h-12 w-full rounded-2xl border border-input bg-background px-3 text-sm">
                {FAMILIES.map((value) => <option key={value} value={value}>{t("agricultural.families." + value)}</option>)}
              </select>
            </div>
            <div>
              <Label htmlFor="agricultural-title">{t("agricultural.designation")}</Label>
              <Input id="agricultural-title" required maxLength={160} value={title} onChange={(event) => setTitle(event.target.value)} placeholder={t("agricultural.designationPlaceholder")} className="mt-1.5 min-h-12 rounded-2xl" />
            </div>
            <div>
              <Label htmlFor="agricultural-description">{t("agricultural.description")}</Label>
              <Textarea id="agricultural-description" rows={3} value={description} onChange={(event) => setDescription(event.target.value)} placeholder={t("agricultural.descriptionPlaceholder")} className="mt-1.5 rounded-2xl" />
            </div>
            <AgriculturalFamilyFields family={family} value={familyDetails} onChange={setFamilyDetails} />
            <div>
              <Label htmlFor="agricultural-specifics">{t("agricultural.specificsLabel")}</Label>
              <Textarea id="agricultural-specifics" rows={3} value={specifics} onChange={(event) => setSpecifics(event.target.value)} placeholder={t("agricultural.specifics." + family)} className="mt-1.5 rounded-2xl" />
              <p className="mt-1.5 text-xs text-muted-foreground">{t("agricultural.specificsHint")}</p>
            </div>
            <div>
              <Label htmlFor="agricultural-locality">{t("agricultural.location")}</Label>
              <Input id="agricultural-locality" value={locality} onChange={(event) => setLocality(event.target.value)} placeholder={t("agricultural.locationPlaceholder")} className="mt-1.5 min-h-12 rounded-2xl" />
            </div>
          </section>
          <p className="rounded-2xl border border-accent/60 bg-accent/30 p-4 text-xs leading-relaxed text-muted-foreground">{t("agricultural.declarationNotice")}</p>
          <div className="flex gap-2 pb-4">
            <Button type="button" variant="outline" onClick={() => setCreating(false)} className="min-h-12 flex-1 rounded-2xl">{t("common.cancel", "Annuler")}</Button>
            <Button type="submit" disabled={saving || !title.trim()} className="min-h-12 flex-1 rounded-2xl">
              {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}{t("agricultural.save")}
            </Button>
          </div>
        </form>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader title={t("agricultural.title")} subtitle={t("agricultural.subtitle")} parentLabel={t("modules.terrain.title")} showBack
        right={<Button onClick={() => setCreating(true)} className="min-h-11 shrink-0 rounded-2xl px-3 sm:px-4"><Plus className="size-4 sm:mr-2" /><span className="hidden sm:inline">{t("agricultural.create")}</span><span className="sm:hidden">{t("common.add", "Ajouter")}</span></Button>}
      />
      {isGuest ? <p className="mb-4 rounded-2xl border border-border bg-muted/50 p-3 text-sm">{t("home.previewOnlyHint")}</p> : null}
      <div className="relative mb-4">
        <Search aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("agricultural.search")} aria-label={t("agricultural.search")} className="min-h-12 rounded-2xl bg-card pl-9" />
      </div>
      <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label={t("agricultural.familyFilter")}>
        {(["all", ...FAMILIES] as const).map((value) => (
          <button key={value} type="button" aria-pressed={familyFilter === value} onClick={() => setFamilyFilter(value)}
            className={familyFilter === value ? "min-h-11 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground focus-ring" : "min-h-11 rounded-full border border-border bg-card px-4 text-sm text-muted-foreground focus-ring"}>
            {value === "all" ? t("common.all", "Tout") : t("agricultural.families." + value)}
          </button>
        ))}
      </div>
      {loading ? <div className="flex justify-center py-12" role="status"><Loader2 className="size-5 animate-spin text-primary" /></div>
        : loadError ? <div role="alert" className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm"><p className="mb-3">{t("auth.error")}</p><Button variant="outline" onClick={reload}>{t("common.retry", "Réessayer")}</Button></div>
        : assets.length === 0 ? <EmptyState icon={Sprout} title={t("agricultural.empty")} description={t("agricultural.emptyHint")} actionLabel={t("agricultural.create")} onAction={() => setCreating(true)} secondaryLabel={t("next.seeDossiers")} onSecondary={() => navigate("/dossiers")} />
        : filtered.length === 0 ? <div className="rounded-3xl border border-border bg-card p-6 text-center"><p className="font-semibold">{t("agricultural.noResults")}</p><p className="mt-1 text-sm text-muted-foreground">{t("agricultural.noResultsHint")}</p><Button variant="outline" className="mt-4" onClick={() => { setQuery(""); setFamilyFilter("all"); }}>{t("buildings.clearFilters")}</Button></div>
        : <section aria-label={t("agricultural.results")} className="space-y-3">
          <p className="text-xs text-muted-foreground">{t("agricultural.resultCount", { count: filtered.length })}</p>
          {filtered.map((asset) => {
            const data = getAssetData(asset.metadata);
            const itemFamily = typeof data.family === "string" && FAMILIES.includes(data.family as Family) ? data.family as Family : "autre";
            return <button key={asset.id} type="button" onClick={() => asset.local ? toast.info(t("dossiers.localOnly")) : navigate("/dossiers/" + asset.id)}
              className="group flex min-h-24 w-full items-center gap-3 rounded-3xl border border-border/70 bg-card p-4 text-left shadow-[var(--shadow-soft)] transition hover:border-primary/30 hover:shadow-[var(--shadow-elegant)] focus-ring">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-accent text-primary"><Sprout className="size-5" /></span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-base font-semibold">{asset.title}</span>
                <span className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="size-3.5 shrink-0" /><span className="truncate">{asset.locationName || t("agricultural.locationNotSpecified")}</span></span>
                <span className="mt-2 flex flex-wrap items-center gap-2"><span className="text-xs text-primary">{t("agricultural.families." + itemFamily)}</span><DossierStatusBadge status={asset.status} />{asset.local ? <span className="text-xs text-muted-foreground"><CloudOff className="mr-1 inline size-3" />{t("dossiers.draftPending")}</span> : null}</span>
              </span>
              <span aria-hidden="true" className="text-lg text-muted-foreground">›</span>
            </button>;
          })}
        </section>}
    </AppLayout>
  );
}
