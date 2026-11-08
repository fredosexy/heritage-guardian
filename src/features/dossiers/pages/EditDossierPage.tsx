import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, CloudOff } from "lucide-react";
import { AppLayout, EmptyState, PageHeader } from "@/features/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useEditDossier } from "../hooks/useEditDossier";
import { AgriculturalFamilyFields } from "./AgriculturalFamilyFields";

type Family = "exploitation" | "plantation" | "elevage" | "equipement" | "infrastructure" | "autre";
const FAMILIES: Family[] = ["exploitation", "plantation", "elevage", "equipement", "infrastructure", "autre"];

export default function EditDossierPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { dossier, loading, save, saveAgricultural, canEdit } = useEditDossier(id);
  const [form, setForm] = useState({ title: "", description: "", location_name: "" });
  const [family, setFamily] = useState<Family>("exploitation");
  const [specifics, setSpecifics] = useState("");
  const [familyDetails, setFamilyDetails] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!dossier) return;
    setForm({ title: dossier.title, description: dossier.description ?? "", location_name: dossier.location_name ?? "" });
    if (dossier.type === "agricole") {
      const metadata = dossier.metadata && typeof dossier.metadata === "object" && !Array.isArray(dossier.metadata)
        ? dossier.metadata as Record<string, unknown>
        : {};
      const raw = metadata.agriculturalRural;
      const asset = raw && typeof raw === "object" && !Array.isArray(raw) ? raw as Record<string, unknown> : {};
      setFamily(FAMILIES.includes(asset.family as Family) ? asset.family as Family : "autre");
      setSpecifics(typeof asset.declaredDetails === "string" ? asset.declaredDetails : "");
      const details = asset.familyDetails && typeof asset.familyDetails === "object" && !Array.isArray(asset.familyDetails)
        ? asset.familyDetails as Record<string, unknown>
        : {};
      setFamilyDetails(Object.fromEntries(Object.entries(details).map(([key, value]) => [key, String(value)])));
    }
  }, [dossier]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const numericKeys = ["declaredArea", "declaredQuantity"];
    for (const key of numericKeys) {
      const raw = familyDetails[key]?.trim();
      if (raw && (!Number.isFinite(Number(raw)) || Number(raw) < 0)) {
        toast.error(t("agricultural.invalidNumber"));
        return;
      }
    }
    setBusy(true);
    try {
      const mainChanged = await save(form);
      let agriculturalChanged = false;
      if (dossier?.type === "agricole") {
        const familyDetailsNormalized = Object.fromEntries(
          Object.entries(familyDetails)
            .filter(([, value]) => value.trim() !== "")
            .map(([key, value]) => [key, numericKeys.includes(key) ? Number(value) : value])
        );
        agriculturalChanged = await saveAgricultural({
          family,
          declaredDetails: specifics.trim() || null,
          familyDetails: familyDetailsNormalized,
        });
      }
      if (!mainChanged && !agriculturalChanged) {
        toast.info(t("sync.noChange"));
        return;
      }
      toast.success(t("sync.savedOffline"), { action: { label: t("sync.open"), onClick: () => navigate("/sync") } });
      navigate(`/dossiers/${id}`, { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("sync.error"));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <AppLayout><div className="flex justify-center py-12"><Loader2 className="size-5 animate-spin text-primary" /></div></AppLayout>;
  if (!dossier) return (
    <AppLayout>
      <PageHeader title={t("sync.editTitle")} showBack />
      <EmptyState icon={CloudOff} title={t("sync.unavailable")} actionLabel={t("dossiers.title")} onAction={() => navigate("/dossiers")} />
    </AppLayout>
  );

  return (
    <AppLayout>
      <PageHeader title={t("sync.editTitle")} showBack />
      {!canEdit && <p className="mb-4 text-sm text-muted-foreground">{t("sync.ownerOnly")}</p>}
      <form onSubmit={(event) => void submit(event)} className="card-soft space-y-4 p-4">
        <fieldset disabled={!canEdit || busy} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="title">{t("sync.field_title")}</Label>
            <Input id="title" required maxLength={160} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="desc">{t("sync.field_description")}</Label>
            <Textarea id="desc" rows={4} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="loc">{t("sync.field_location_name")}</Label>
            <Input id="loc" value={form.location_name} onChange={(event) => setForm({ ...form, location_name: event.target.value })} />
          </div>
          {dossier.type === "agricole" && (
            <section className="space-y-4 border-t border-border pt-4">
              <div>
                <h2 className="text-base font-semibold">{t("agricultural.structuredTitle")}</h2>
                <p className="mt-1 text-xs text-muted-foreground">{t("agricultural.declarationNotice")}</p>
              </div>
              <div>
                <Label htmlFor="agricultural-edit-family">{t("agricultural.family")}</Label>
                <select id="agricultural-edit-family" value={family} onChange={(event) => { setFamily(event.target.value as Family); setFamilyDetails({}); }} className="mt-1.5 min-h-12 w-full rounded-2xl border border-input bg-background px-3 text-sm">
                  {FAMILIES.map((value) => <option key={value} value={value}>{t("agricultural.families." + value)}</option>)}
                </select>
              </div>
              <AgriculturalFamilyFields family={family} value={familyDetails} onChange={setFamilyDetails} />
              <div className="space-y-1">
                <Label htmlFor="agricultural-edit-specifics">{t("agricultural.specificsLabel")}</Label>
                <Textarea id="agricultural-edit-specifics" rows={3} value={specifics} onChange={(event) => setSpecifics(event.target.value)} />
              </div>
            </section>
          )}
          <Button type="submit" className="w-full" disabled={busy || !form.title.trim()}>
            {busy ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}{t("sync.save")}
          </Button>
        </fieldset>
      </form>
    </AppLayout>
  );
}
