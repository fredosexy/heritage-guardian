import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/features/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { biensRepo } from "@/data";
import type { Bien, DossierType } from "@/core/types/domain";
import { useCreateDossier } from "../hooks/useCreateDossier";

const TYPES: DossierType[] = ["acquisition", "achat", "succession", "heritage", "protection", "regularisation", "partage", "transmission", "vente", "autre"];

export default function CreateDossierPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { create, saving } = useCreateDossier();
  const [biens, setBiens] = useState<Bien[]>([]);
  const [bienId, setBienId] = useState("");
  const [type, setType] = useState<DossierType>("protection");
  const [visibility, setVisibility] = useState<"prive" | "public">("prive");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => { void biensRepo.getBiensForUser().then((rows) => { setBiens(rows); if (rows[0]) setBienId(rows[0].id); }); }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const result = await create({ bien_id: bienId, type, title, description, visibility });
      if (result?.mode === "online") navigate(`/dossiers/${result.id}`);
      else navigate("/dossiers");
      toast.success(t("create.created"));
    } catch (error) { toast.error(error instanceof Error ? error.message : t("auth.error")); }
  };

  return <AppLayout>
    <h1 className="text-display mb-2">{t("create.title")}</h1>
    <p className="text-sm text-muted-foreground mb-6">{t("create.b3Hint")}</p>
    {biens.length === 0 ? <div className="card-soft p-5 space-y-3"><p>{t("create.assetRequired")}</p><Button onClick={() => navigate("/biens/new")}>{t("create.createAsset")}</Button></div> :
    <form onSubmit={submit} className="space-y-4">
      <div><Label htmlFor="bien">{t("create.asset")}</Label><select id="bien" className="w-full h-10 rounded-xl border bg-background px-3" value={bienId} onChange={(e) => setBienId(e.target.value)}>{biens.map((bien) => <option key={bien.id} value={bien.id}>{bien.title}</option>)}</select></div>
      <div><Label htmlFor="type">{t("dossier.typeLabel")}</Label><select id="type" className="w-full h-10 rounded-xl border bg-background px-3" value={type} onChange={(e) => setType(e.target.value as DossierType)}>{TYPES.map((value) => <option key={value} value={value}>{t(`dossiers.types.${value}`, value)}</option>)}</select></div>
      <div><Label htmlFor="title">{t("create.titleLabel")}</Label><Input id="title" required minLength={2} maxLength={160} value={title} onChange={(e) => setTitle(e.target.value)} /></div>
      <div><Label htmlFor="description">{t("create.descLabel")}</Label><Textarea id="description" maxLength={4000} value={description} onChange={(e) => setDescription(e.target.value)} /></div>
      <div><Label htmlFor="visibility">{t("dossier.visibility")}</Label><select id="visibility" className="w-full h-10 rounded-xl border bg-background px-3" value={visibility} onChange={(e) => setVisibility(e.target.value as "prive" | "public")}><option value="prive">{t("dossier.visibilityPrivate")}</option><option value="public">{t("dossier.visibilityPublic")}</option></select><p className="text-caption mt-1">{t("dossier.publicNotice")}</p></div>
      <Button type="submit" disabled={saving || !bienId || title.trim().length < 2} className="w-full">{saving && <Loader2 className="size-4 animate-spin" />}{t("create.create")}</Button>
    </form>}
  </AppLayout>;
}
