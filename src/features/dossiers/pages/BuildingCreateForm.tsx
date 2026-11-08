import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Building2, ChevronLeft, ChevronRight, Loader2, MapPin } from "lucide-react";
import { AppLayout } from "@/features/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateDossier } from "../hooks/useCreateDossier";

type BuildingKind = "immeuble" | "maison" | "commerce" | "bureau" | "autre";
type SurfaceUnit = "m2" | "are" | "hectare";

export function BuildingCreateForm({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { create, saving } = useCreateDossier();
  const [step, setStep] = useState<1 | 2>(1);
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<BuildingKind>("immeuble");
  const [description, setDescription] = useState("");
  const [locality, setLocality] = useState("");
  const [address, setAddress] = useState("");
  const [surface, setSurface] = useState("");
  const [surfaceUnit, setSurfaceUnit] = useState<SurfaceUnit>("m2");

  const save = async () => {
    if (!title.trim()) return;
    const parsedSurface = surface.trim() ? Number(surface) : null;
    if (parsedSurface !== null && (!Number.isFinite(parsedSurface) || parsedSurface < 0)) {
      toast.error(t("create.buildingSurfaceLabel") + " : valeur invalide");
      return;
    }
    try {
      const result = await create({
        type: "batiment",
        title: title.trim(),
        description,
        location_name: locality.trim() || undefined,
        metadata: {
          building: {
            property_kind: kind,
            locality: locality.trim() || null,
            address_description: address.trim() || null,
            declared_surface: parsedSurface,
            surface_unit: surfaceUnit,
          },
        },
      });
      if (!result) return;
      if (result.mode === "online") {
        toast.success(t("create.created"));
        if (result.journeyStatus === "procedure_unavailable") toast.info(t("create.journeyUnavailable"));
        else if (result.journeyStatus === "attention") toast.warning(t("create.journeyNeedsAttention"));
        navigate("/dossiers/" + result.id);
      } else {
        toast.success(t(result.mode === "local" ? "create.savedLocal" : "create.savedOffline"));
        navigate("/dossiers");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("auth.error"));
    }
  };

  return (
    <AppLayout>
      <button type="button" onClick={onBack} className="mb-4 min-h-11 text-sm text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg">
        <ChevronLeft className="inline size-4 mr-1" />{t("common.back")}
      </button>
      <header className="mb-5 flex items-start gap-3">
        <span className="size-12 rounded-2xl bg-accent text-primary flex items-center justify-center shrink-0">
          <Building2 className="size-6" />
        </span>
        <div>
          <p className="text-xs uppercase tracking-wide text-primary font-medium">{t("modules.label")}</p>
          <h1 className="text-display mt-1">{t("create.buildingFormTitle")}</h1>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{t("create.buildingFormHint")}</p>
        </div>
      </header>

      <div className="mb-5 flex items-center gap-2" aria-label={t(step === 1 ? "create.buildingStepOne" : "create.buildingStepTwo")}>
        <span className="h-1.5 flex-1 rounded-full bg-primary" />
        <span className={"h-1.5 flex-1 rounded-full " + (step === 2 ? "bg-primary" : "bg-muted")} />
        <span className="text-xs text-muted-foreground">{step}/2</span>
      </div>

      {step === 1 ? (
        <section className="rounded-3xl border border-border/60 bg-card/85 p-4 shadow-[var(--shadow-soft)] space-y-4">
          <div>
            <Label htmlFor="building-title">{t("create.titleLabel")}</Label>
            <Input id="building-title" required autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("create.titlePlaceholder")} className="mt-1.5 min-h-12 rounded-2xl" />
          </div>
          <div>
            <Label htmlFor="building-kind">{t("create.buildingKindLabel")}</Label>
            <select id="building-kind" value={kind} onChange={(e) => setKind(e.target.value as BuildingKind)} className="mt-1.5 min-h-12 w-full rounded-2xl border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              {(["immeuble", "maison", "commerce", "bureau", "autre"] as const).map((value) => (
                <option key={value} value={value}>{t("create.buildingKinds." + value)}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="building-description">{t("create.descLabel")}</Label>
            <Textarea id="building-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t("create.descPlaceholder")} rows={3} className="mt-1.5 rounded-2xl" />
          </div>
          <Button type="button" disabled={!title.trim()} onClick={() => setStep(2)} className="w-full min-h-12 rounded-2xl">
            {t("firstStep.continue")} <ChevronRight className="size-4 ml-2" />
          </Button>
        </section>
      ) : (
        <section className="rounded-3xl border border-border/60 bg-card/85 p-4 shadow-[var(--shadow-soft)] space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="size-4 text-primary" />
            <h2 className="text-sm font-semibold">{t("create.buildingLocalityLabel")}</h2>
          </div>
          <div>
            <Label htmlFor="building-locality">{t("create.buildingLocalityLabel")}</Label>
            <Input id="building-locality" autoFocus value={locality} onChange={(e) => setLocality(e.target.value)} placeholder="Ex. Douala, Bonanjo" className="mt-1.5 min-h-12 rounded-2xl" />
          </div>
          <div>
            <Label htmlFor="building-address">{t("create.buildingAddressLabel")}</Label>
            <Textarea id="building-address" value={address} onChange={(e) => setAddress(e.target.value)} rows={2} className="mt-1.5 rounded-2xl" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="building-surface">{t("create.buildingSurfaceLabel")}</Label>
              <Input id="building-surface" type="number" min="0" step="any" value={surface} onChange={(e) => setSurface(e.target.value)} className="mt-1.5 min-h-12 rounded-2xl" />
            </div>
            <div>
              <Label htmlFor="building-surface-unit">{t("create.buildingSurfaceUnit")}</Label>
              <select id="building-surface-unit" value={surfaceUnit} onChange={(e) => setSurfaceUnit(e.target.value as SurfaceUnit)} className="mt-1.5 min-h-12 w-full rounded-2xl border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option value="m2">m²</option>
                <option value="are">Are</option>
                <option value="hectare">Hectare</option>
              </select>
            </div>
          </div>
          <p className="rounded-2xl bg-muted/60 p-4 text-xs leading-relaxed text-muted-foreground">{t("create.buildingScopeNote")}</p>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setStep(1)} className="min-h-12 flex-1 rounded-2xl">
              <ChevronLeft className="size-4 mr-1" />{t("common.back")}
            </Button>
            <Button type="button" disabled={saving} onClick={() => void save()} className="min-h-12 flex-1 rounded-2xl">
              {saving ? <Loader2 className="size-4 mr-2 animate-spin" /> : null}{t("create.saveBuilding")}
            </Button>
          </div>
        </section>
      )}
    </AppLayout>
  );
}
