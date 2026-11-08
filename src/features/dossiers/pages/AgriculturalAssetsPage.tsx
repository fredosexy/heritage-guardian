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

const RECOMMENDED_FIELDS: Record<Family, string[]> = {
  exploitation: ["activities", "activeSince"],
  plantation: ["cropType", "declaredArea", "areaUnit"],
  elevage: ["animalType", "declaredQuantity", "inventoryDate"],
  equipement: ["equipmentType", "condition"],
  infrastructure: ["infrastructureType", "use"],
  autre: ["nature", "characteristics"],
};

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
  const [createStep, setCreateStep] = useState<0 | 1 | 2>(0);
  const [query, setQuery] = useState("");
  const [familyFilter, setFamilyFilter] = useState<Family | "all">("all");
  const [family, setFamily] = useState<Family>("exploitation");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [locality, setLocality] = useState("");
  const [specifics, setSpecifics] = useState("");
  const [familyDetails, setFamilyDetails] = useState<Record<string, string>>({});
  const [geoPoint, setGeoPoint] = useState<{ latitude: number; longitude: number; accuracyMeters: number | null; capturedAt: string } | null>(null);
  const [locating, setLocating] = useState(false);

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
    setCreateStep(0);
    setFamily("exploitation");
    setTitle("");
    setDescription("");
    setLocality("");
    setSpecifics("");
    setFamilyDetails({});
    setGeoPoint(null);
  };

  const captureLocation = () => {
    if (!navigator.geolocation) {
      toast.error(t("agricultural.locationUnavailable"));
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeoPoint({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracyMeters: Number.isFinite(position.coords.accuracy) ? position.coords.accuracy : null,
          capturedAt: new Date(position.timestamp).toISOString(),
        });
        setLocating(false);
        toast.success(t("agricultural.locationCaptured"));
      },
      () => {
        setLocating(false);
        toast.error(t("agricultural.locationDenied"));
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    );
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim()) return;
    const numericKeys = ["declaredArea", "declaredQuantity"];
    for (const key of numericKeys) {
      const raw = familyDetails[key]?.trim();
      if (raw && (!Number.isFinite(Number(raw)) || Number(raw) < 0)) {
        toast.error(t("agricultural.invalidNumber"));
        return;
      }
    }
    const normalizedFamilyDetails = Object.fromEntries(
      Object.entries(familyDetails)
        .filter(([, value]) => value.trim() !== "")
        .map(([key, value]) => [key, numericKeys.includes(key) ? Number(value) : value])
    );
    try {
      const result = await create({
        type: "agricole",
        title: title.trim(),
        description: description.trim(),
        location_name: locality.trim() || undefined,
        latitude: geoPoint?.latitude ?? null,
        longitude: geoPoint?.longitude ?? null,
        metadata: {
          agriculturalRural: {
            version: 1,
            family,
            declaredDetails: specifics.trim() || null,
            familyDetails: normalizedFamilyDetails,
            ...(geoPoint ? { geospatial: { point: { ...geoPoint, source: "gps" } } } : {}),
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
        <section className="mb-5 rounded-3xl border border-border/70 bg-card p-4 shadow-[var(--shadow-soft)] sm:p-5" aria-label={t("agricultural.createSteps.title")}>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold">{t("agricultural.createSteps.title")}</p>
            <p className="text-xs tabular-nums text-muted-foreground">{t("agricultural.createSteps.counter", { current: createStep + 1, total: 3 })}</p>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuemin={1} aria-valuemax={3} aria-valuenow={createStep + 1} aria-label={t("agricultural.createSteps.progress")}>
            <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: (((createStep + 1) / 3) * 100) + "%" }} />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[0, 1, 2].map((step) => <div key={step} className={"rounded-xl px-2 py-2 text-center text-xs " + (createStep === step ? "bg-accent font-semibold text-accent-foreground" : createStep > step ? "bg-muted text-foreground" : "text-muted-foreground")}>{t("agricultural.createSteps.steps." + step)}</div>)}
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{t("agricultural.createSteps.hint." + createStep)}</p>
        </section>
        <form onSubmit={(event) => void submit(event)} className="space-y-4">
          <section className="card-soft space-y-4 p-4 sm:p-5">
            {createStep === 0 && <>
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
            </>}
            {createStep === 1 && <>
            <AgriculturalFamilyFields family={family} value={familyDetails} onChange={setFamilyDetails} />
            <div>
              <Label htmlFor="agricultural-specifics">{t("agricultural.specificsLabel")}</Label>
              <Textarea id="agricultural-specifics" rows={3} value={specifics} onChange={(event) => setSpecifics(event.target.value)} placeholder={t("agricultural.specifics." + family)} className="mt-1.5 rounded-2xl" />
              <p className="mt-1.5 text-xs text-muted-foreground">{t("agricultural.specificsHint")}</p>
            </div>
            </>}
            {createStep === 2 && <>
            <div>
              <Label htmlFor="agricultural-locality">{t("agricultural.location")}</Label>
              <Input id="agricultural-locality" value={locality} onChange={(event) => setLocality(event.target.value)} placeholder={t("agricultural.locationPlaceholder")} className="mt-1.5 min-h-12 rounded-2xl" />
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/50 p-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{t("agricultural.gpsTitle")}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{geoPoint ? t("agricultural.gpsCaptured", { accuracy: geoPoint.accuracyMeters === null ? "—" : Math.round(geoPoint.accuracyMeters) }) : t("agricultural.gpsHint")}</p>
                </div>
                <Button type="button" variant="outline" disabled={locating} onClick={captureLocation} className="min-h-11 rounded-xl">
                  {locating ? <Loader2 className="mr-2 size-4 animate-spin" /> : <MapPin className="mr-2 size-4" />}
                  {t("agricultural.captureGps")}
                </Button>
              </div>
              {geoPoint ? <p className="mt-2 break-all text-xs tabular-nums text-muted-foreground">{geoPoint.latitude.toFixed(6)}, {geoPoint.longitude.toFixed(6)}</p> : null}
              <p className="mt-2 text-xs text-muted-foreground">{t("agricultural.gpsDisclaimer")}</p>
            </div>
            </>}
          </section>
          <p className="rounded-2xl border border-accent/60 bg-accent/30 p-4 text-xs leading-relaxed text-muted-foreground">{t("agricultural.declarationNotice")}</p>
          <div className="flex gap-2 pb-4">
            {createStep > 0 ? <Button type="button" variant="outline" onClick={() => setCreateStep((step) => (step - 1) as 0 | 1 | 2)} className="min-h-12 flex-1 rounded-2xl">{t("agricultural.createSteps.back")}</Button> : <Button type="button" variant="outline" onClick={() => setCreating(false)} className="min-h-12 flex-1 rounded-2xl">{t("common.cancel", "Annuler")}</Button>}
            {createStep < 2 ? <Button type="button" disabled={createStep === 0 && !title.trim()} onClick={() => setCreateStep((step) => (step + 1) as 0 | 1 | 2)} className="min-h-12 flex-1 rounded-2xl">{t("agricultural.createSteps.next")}</Button> : <Button type="submit" disabled={saving || !title.trim()} className="min-h-12 flex-1 rounded-2xl">{saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}{t("agricultural.save")}</Button>}
          </div>
        </form>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader title={t("agricultural.title")} subtitle={t("agricultural.subtitle")} parentLabel={t("modules.terrain.title")} showBack
        right={<Button onClick={() => setCreateStep(0); setCreating(true)} className="min-h-11 shrink-0 rounded-2xl px-3 sm:px-4"><Plus className="size-4 sm:mr-2" /><span className="hidden sm:inline">{t("agricultural.create")}</span><span className="sm:hidden">{t("common.add", "Ajouter")}</span></Button>}
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
      {!loading && !loadError && assets.length > 0 ? (() => {
        const needsAttention = assets.filter((asset) => {
          const data = getAssetData(asset.metadata);
          const family = typeof data.family === "string" && FAMILIES.includes(data.family as Family) ? data.family as Family : "autre";
          const details = data.familyDetails && typeof data.familyDetails === "object" && !Array.isArray(data.familyDetails)
            ? data.familyDetails as Record<string, unknown> : {};
          return RECOMMENDED_FIELDS[family].some((key) => !String(details[key] ?? "").trim()) || !asset.locationName;
        });
        const nextAsset = needsAttention[0];
        return (
          <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3" aria-label={t("agricultural.summary.title")}>
            <div className="rounded-3xl border border-border/70 bg-card p-4 shadow-[var(--shadow-soft)]">
              <p className="text-3xl font-semibold tabular-nums sm:text-4xl">{assets.length}</p>
              <p className="mt-1 text-sm leading-snug text-muted-foreground">{t("agricultural.summary.total")}</p>
            </div>
            <div className="rounded-3xl border border-border/70 bg-card p-4 shadow-[var(--shadow-soft)]">
              <p className="text-3xl font-semibold tabular-nums sm:text-4xl">{needsAttention.length}</p>
              <p className="mt-1 text-sm leading-snug text-muted-foreground">{t("agricultural.summary.toComplete")}</p>
            </div>
            <div className="col-span-2 rounded-3xl border border-primary/20 bg-gradient-to-br from-accent/55 to-card p-4 sm:col-span-1">
              <p className="text-sm font-semibold">{t("agricultural.summary.assistantTitle")}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{nextAsset ? t("agricultural.summary.assistantHint") : t("agricultural.summary.allUpToDate")}</p>
              {nextAsset ? <Button variant="outline" size="sm" className="mt-3 min-h-10 rounded-xl" onClick={() => nextAsset.local ? toast.info(t("dossiers.localOnly")) : navigate("/dossiers/" + nextAsset.id + "/edit")}>{t("agricultural.summary.continue")}</Button> : null}
            </div>
          </section>
        );
      })() : null}
      {loading ? <div className="flex justify-center py-12" role="status"><Loader2 className="size-5 animate-spin text-primary" /></div>
        : loadError ? <div role="alert" className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm"><p className="mb-3">{t("auth.error")}</p><Button variant="outline" onClick={reload}>{t("common.retry", "Réessayer")}</Button></div>
        : assets.length === 0 ? <EmptyState icon={Sprout} title={t("agricultural.empty")} description={t("agricultural.emptyHint")} actionLabel={t("agricultural.create")} onAction={() => setCreateStep(0); setCreating(true)} secondaryLabel={t("next.seeDossiers")} onSecondary={() => navigate("/dossiers")} />
        : filtered.length === 0 ? <div className="rounded-3xl border border-border bg-card p-6 text-center"><p className="font-semibold">{t("agricultural.noResults")}</p><p className="mt-1 text-sm text-muted-foreground">{t("agricultural.noResultsHint")}</p><Button variant="outline" className="mt-4" onClick={() => { setQuery(""); setFamilyFilter("all"); }}>{t("buildings.clearFilters")}</Button></div>
        : <section aria-label={t("agricultural.results")} className="space-y-4">
          <div className="flex items-end justify-between gap-3">
            <div><h2 className="text-xl font-semibold sm:text-2xl">{t("agricultural.results")}</h2><p className="mt-1 text-sm text-muted-foreground">{t("agricultural.resultCount", { count: filtered.length })}</p></div>
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {filtered.map((asset) => {
              const data = getAssetData(asset.metadata);
              const itemFamily = typeof data.family === "string" && FAMILIES.includes(data.family as Family) ? data.family as Family : "autre";
              const details = data.familyDetails && typeof data.familyDetails === "object" && !Array.isArray(data.familyDetails)
                ? data.familyDetails as Record<string, unknown> : {};
              const recommended = RECOMMENDED_FIELDS[itemFamily];
              const completed = recommended.filter((key) => String(details[key] ?? "").trim()).length;
              const description = typeof asset.description === "string" ? asset.description.trim() : "";
              return <button key={asset.id} type="button" onClick={() => asset.local ? toast.info(t("dossiers.localOnly")) : navigate("/dossiers/" + asset.id)}
                className="group flex min-h-56 w-full flex-col items-stretch rounded-[1.75rem] border border-border/70 bg-card p-5 text-left shadow-[var(--shadow-soft)] transition duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-[var(--shadow-elegant)] focus-ring sm:min-h-60 sm:p-6">
                <span className="flex items-start justify-between gap-3">
                  <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-accent text-primary sm:size-16"><Sprout className="size-7 sm:size-8" /></span>
                  <span className="flex flex-wrap justify-end gap-2"><DossierStatusBadge status={asset.status} />{asset.local ? <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground"><CloudOff className="mr-1 inline size-3" />{t("dossiers.draftPending")}</span> : null}</span>
                </span>
                <span className="mt-5 block text-xl font-semibold leading-snug sm:text-2xl">{asset.title}</span>
                <span className="mt-2 block text-sm leading-relaxed text-muted-foreground">{description || t("agricultural.cardDescriptionFallback")}</span>
                <span className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
                  <span className="rounded-full bg-accent/70 px-3 py-1.5 font-medium text-accent-foreground">{t("agricultural.families." + itemFamily)}</span>
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground"><MapPin className="size-4" />{asset.locationName || t("agricultural.locationNotSpecified")}</span>
                </span>
                <span className="mt-auto block pt-5">
                  <span className="flex items-center justify-between gap-3 text-xs text-muted-foreground"><span>{t("agricultural.cardInfoProgress")}</span><span className="font-semibold tabular-nums">{completed}/{recommended.length}</span></span>
                  <span className="mt-2 block h-2 overflow-hidden rounded-full bg-muted"><span className="block h-full rounded-full bg-primary transition-all" style={{ width: ((completed / recommended.length) * 100) + "%" }} /></span>
                  <span className="mt-4 flex items-center justify-between text-sm font-semibold text-primary"><span>{t("agricultural.cardOpen")}</span><span aria-hidden="true" className="text-xl transition-transform group-hover:translate-x-1">→</span></span>
                </span>
              </button>;
            })}
          </div>
        </section>}
    </AppLayout>
  );
}
