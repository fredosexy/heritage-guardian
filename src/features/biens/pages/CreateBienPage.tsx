import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/features/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { biensRepo } from "@/data";
import type { BienCreationContext, BienType } from "@/data/biens.repo";

export default function CreateBienPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [type, setType] = useState<BienType>("terrain");
  const [context, setContext] = useState<BienCreationContext>("propre_bien");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [origin, setOrigin] = useState("");
  const [holderName, setHolderName] = useState("");
  const [holderPhone, setHolderPhone] = useState("");
  const [saving, setSaving] = useState(false);

  const needsExternalHolder = context !== "propre_bien";

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const id = await biensRepo.createBien({
        type,
        title,
        location_label: location,
        creation_context: context,
        description: description || null,
        origin_declared: origin || null,
        holder_name: needsExternalHolder ? holderName : null,
        holder_phone: needsExternalHolder ? holderPhone || null : null,
        holder_role: "titulaire",
      });
      toast.success(t("biens.created"));
      navigate(`/biens/${id}`, { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("auth.error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <h1 className="text-display mb-2">{t("biens.createTitle")}</h1>
      <p className="text-caption mb-6">{t("biens.declarationNotice")}</p>

      <form onSubmit={submit} className="card-soft p-5 space-y-4">
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">{t("biens.whoConcerned")}</legend>
          {(["propre_bien", "proche_accompagne", "bien_familial"] as const).map((value) => (
            <label key={value} className="flex items-start gap-3 rounded-xl border p-3 cursor-pointer">
              <input type="radio" name="context" value={value} checked={context === value} onChange={() => setContext(value)} className="mt-1" />
              <span>
                <span className="block text-sm font-medium">{t(`biens.contexts.${value}`)}</span>
                <span className="block text-caption">{t(`biens.contextHints.${value}`)}</span>
              </span>
            </label>
          ))}
        </fieldset>

        <div>
          <Label htmlFor="bien-type">{t("biens.type")}</Label>
          <select id="bien-type" value={type} onChange={(e) => setType(e.target.value as BienType)} className="flex h-11 w-full rounded-xl border border-input bg-background px-3">
            {(["terrain", "parcelle", "maison", "propriete_familiale", "autre"] as const).map((value) => (
              <option key={value} value={value}>{t(`biens.types.${value}`)}</option>
            ))}
          </select>
        </div>
        <div><Label htmlFor="bien-title">{t("biens.name")}</Label><Input id="bien-title" value={title} onChange={(e) => setTitle(e.target.value)} required minLength={2} /></div>
        <div><Label htmlFor="bien-location">{t("biens.location")}</Label><Input id="bien-location" value={location} onChange={(e) => setLocation(e.target.value)} required minLength={2} /></div>
        <div><Label htmlFor="bien-description">{t("biens.description")}</Label><textarea id="bien-description" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={4000} className="min-h-24 w-full rounded-xl border border-input bg-background p-3 text-sm" /></div>
        <div><Label htmlFor="bien-origin">{t("biens.origin")}</Label><textarea id="bien-origin" value={origin} onChange={(e) => setOrigin(e.target.value)} maxLength={1000} className="min-h-20 w-full rounded-xl border border-input bg-background p-3 text-sm" /></div>

        {needsExternalHolder && (
          <section className="rounded-xl border p-4 space-y-3">
            <h2 className="font-medium">{t("biens.holder")}</h2>
            <p className="text-caption">{t("biens.holderNotice")}</p>
            <div><Label htmlFor="holder-name">{t("biens.holderName")}</Label><Input id="holder-name" value={holderName} onChange={(e) => setHolderName(e.target.value)} required minLength={2} /></div>
            <div><Label htmlFor="holder-phone">{t("biens.holderPhone")}</Label><Input id="holder-phone" type="tel" value={holderPhone} onChange={(e) => setHolderPhone(e.target.value)} /></div>
          </section>
        )}

        <Button type="submit" disabled={saving} className="w-full bg-gradient-warm">
          {saving && <Loader2 className="size-4 animate-spin" />} {t("biens.save")}
        </Button>
      </form>
    </AppLayout>
  );
}
