import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppLayout } from "@/features/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, CircleCheck, Loader2, MapPin, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { FirstStepDialog, useIdentity } from "@/features/identity";
import { useCreateDossier } from "../hooks/useCreateDossier";
import { DOSSIER_TYPES, typeLabelKey } from "../components/dossierTypeMeta";

type TerrainSections = {
  histoire: string;
  provenance: string;
  proprietaires: string;
  ayantsDroit: string;
  documentation: string;
  localisation: string;
  dimensions: string;
  etat: string;
  miseEnValeur: string;
};

const emptyTerrain: TerrainSections = {
  histoire: "",
  provenance: "",
  proprietaires: "",
  ayantsDroit: "",
  documentation: "",
  localisation: "",
  dimensions: "",
  etat: "",
  miseEnValeur: "",
};

const sectionKeys = [
  "histoire",
  "provenance",
  "proprietaires",
  "ayantsDroit",
  "documentation",
  "localisation",
  "dimensions",
  "etat",
  "miseEnValeur",
] as const;

export default function CreateDossierPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const requestedType = params.get("type");
  const availableIds = DOSSIER_TYPES.filter((d) => d.available).map((d) => d.id);
  const [type, setType] = useState<string | null>(
    requestedType && availableIds.includes(requestedType) ? requestedType : null
  );
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sections, setSections] = useState<TerrainSections>(emptyTerrain);
  const [openSection, setOpenSection] = useState<(typeof sectionKeys)[number]>("histoire");
  const { create, saving } = useCreateDossier();
  const { needsFirstStep } = useIdentity();
  const [firstStepOpen, setFirstStepOpen] = useState(false);

  useEffect(() => {
    if (needsFirstStep) setFirstStepOpen(true);
  }, [needsFirstStep]);

  const completedSections = useMemo(
    () => sectionKeys.filter((key) => sections[key].trim().length > 0).length,
    [sections]
  );

  const updateSection = (key: (typeof sectionKeys)[number], value: string) =>
    setSections((current) => ({ ...current, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!type || !title.trim()) return;
    try {
      const result = await create({
        type,
        title: title.trim(),
        description,
        location_name: sections.localisation || undefined,
        metadata:
          type === "terrain"
            ? {
                terrain: {
                  version: 1,
                  sections,
                },
              }
            : {},
      });
      if (!result) return;
      if (result.mode === "online") {
        toast.success(t("create.created"));
        navigate(`/dossiers/${result.id}`);
      } else {
        toast.success(t(result.mode === "local" ? "create.savedLocal" : "create.savedOffline"));
        navigate("/dossiers");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("auth.error"));
    }
  };

  if (!type) {
    return (
      <AppLayout>
        <FirstStepDialog open={firstStepOpen} onClose={() => setFirstStepOpen(false)} />
        <h1 className="text-display mb-2">{t("create.title")}</h1>
        <p className="text-sm text-muted-foreground mb-6">{t("create.chooseType")}</p>
        <div className="space-y-3">
          {DOSSIER_TYPES.map(({ id, icon: Icon, descKey, available }) => (
            <button
              key={id}
              onClick={() => (available ? setType(id) : toast.info(t("create.comingSoon")))}
              className={`w-full card-soft p-4 text-left flex items-center gap-3 transition ${available ? "hover:shadow-warm" : "opacity-70"}`}
            >
              <div className={`size-11 rounded-xl flex items-center justify-center shrink-0 ${available ? "bg-gradient-warm text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                <Icon className="size-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{t(typeLabelKey(id))}</span>
                  {!available && <Badge variant="secondary" className="text-[10px]">{t("create.comingSoon")}</Badge>}
                </div>
                <p className="text-caption mt-0.5">{t(descKey)}</p>
              </div>
              {available && <ChevronRight className="size-4 text-muted-foreground" />}
            </button>
          ))}
        </div>
      </AppLayout>
    );
  }

  if (type !== "terrain") {
    return (
      <AppLayout>
        <p className="text-sm text-muted-foreground">{t("create.comingSoon")}</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <FirstStepDialog open={firstStepOpen} onClose={() => setFirstStepOpen(false)} />
      <button onClick={() => setType(null)} className="text-sm text-muted-foreground mb-4">← {t("common.back")}</button>

      <header className="mb-5">
        <div className="flex items-start gap-3">
          <span className="size-11 rounded-2xl bg-accent text-primary flex items-center justify-center shrink-0">
            <MapPin className="size-5" />
          </span>
          <div>
            <p className="text-xs uppercase tracking-wide text-primary font-medium">{t("modules.label")}</p>
            <h1 className="text-display mt-1">{t("create.terrainFormTitle")}</h1>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{t("create.terrainFormHint")}</p>
          </div>
        </div>
      </header>

      <section className="card-soft p-4 mb-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">{t("create.terrainProgressTitle")}</p>
            <p className="text-xs text-muted-foreground mt-1">{t("create.terrainProgressHint", { completed: completedSections, total: sectionKeys.length })}</p>
          </div>
          <span className="text-sm font-semibold text-primary">{Math.round((completedSections / sectionKeys.length) * 100)}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden mt-3">
          <div className="h-full bg-primary transition-all" style={{ width: `${(completedSections / sectionKeys.length) * 100}%` }} />
        </div>
      </section>

      <form onSubmit={submit} className="space-y-4">
        <section className="card-soft p-4">
          <Label htmlFor="title">{t("create.titleLabel")}</Label>
          <Input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("create.titlePlaceholder")} className="rounded-xl mt-1.5" />
          <Label htmlFor="desc" className="block mt-4">{t("create.descLabel")}</Label>
          <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t("create.descPlaceholder")} rows={3} className="rounded-xl mt-1.5" />
        </section>

        <div className="space-y-2">
          {sectionKeys.map((key, index) => {
            const open = openSection === key;
            const done = sections[key].trim().length > 0;
            return (
              <section key={key} className={`rounded-2xl border bg-card overflow-hidden ${open ? "border-primary/40" : "border-border"}`}>
                <button type="button" onClick={() => setOpenSection(open ? key : key)} className="w-full p-4 flex items-center gap-3 text-left">
                  <span className={`size-8 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold ${done ? "bg-accent text-primary" : "bg-muted text-muted-foreground"}`}>
                    {done ? <CircleCheck className="size-4" /> : index + 1}
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-semibold">{t(`create.terrainSections.${key}.title`)}</span>
                    <span className="block text-xs text-muted-foreground mt-0.5">{t(`create.terrainSections.${key}.hint`)}</span>
                  </span>
                  <ChevronRight className={`size-4 text-muted-foreground transition-transform ${open ? "rotate-90" : ""}`} />
                </button>
                {open && (
                  <div className="px-4 pb-4">
                    <Textarea
                      value={sections[key]}
                      onChange={(e) => updateSection(key, e.target.value)}
                      placeholder={t(`create.terrainSections.${key}.placeholder`)}
                      rows={4}
                      className="rounded-xl"
                    />
                    {key === "documentation" && <p className="text-xs text-muted-foreground mt-2">{t("create.terrainDocumentationHint")}</p>}
                  </div>
                )}
              </section>
            );
          })}
        </div>

        <section className="rounded-2xl border border-primary/20 bg-accent/40 p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <p className="text-sm font-semibold">{t("create.terrainValidationTitle")}</p>
          </div>
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{t("create.terrainValidationHint")}</p>
        </section>

        <div className="flex gap-2 pt-1 pb-4">
          <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex-1">{t("create.cancel")}</Button>
          <Button type="submit" disabled={saving || !title.trim()} className="flex-1 bg-gradient-warm">
            {saving && <Loader2 className="size-4 animate-spin" />}
            {t("create.saveTerrain")}
          </Button>
        </div>
      </form>
    </AppLayout>
  );
}
