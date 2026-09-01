import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppLayout } from "@/features/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { FirstStepDialog, useIdentity } from "@/features/identity";
import { useCreateDossier } from "../hooks/useCreateDossier";
import { DOSSIER_TYPES, typeLabelKey } from "../components/dossierTypeMeta";

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
  const [location, setLocation] = useState("");
  const { create, saving } = useCreateDossier();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!type) return;
    try {
      const result = await create({ type, title, description, location_name: location });
      if (!result) return;
      if (result.mode === "online") {
        toast.success(t("create.created"));
        navigate(`/dossiers/${result.id}`);
      } else {
        toast.success(t("create.savedOffline"));
        navigate("/dossiers");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("auth.error"));
    }
  };

  if (!type) {
    return (
      <AppLayout>
        <h1 className="text-display mb-2">{t("create.title")}</h1>
        <p className="text-sm text-muted-foreground mb-6">{t("create.chooseType")}</p>
        <div className="space-y-3">
          {DOSSIER_TYPES.map(({ id, icon: Icon, descKey, available }) => (
            <button
              key={id}
              onClick={() => (available ? setType(id) : toast.info(t("create.comingSoon")))}
              className={`w-full card-soft p-4 text-left flex items-center gap-3 transition ${
                available ? "hover:shadow-warm" : "opacity-70"
              }`}
            >
              <div
                className={`size-11 rounded-xl flex items-center justify-center shrink-0 ${
                  available ? "bg-gradient-warm text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                <Icon className="size-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{t(typeLabelKey(id))}</span>
                  {!available && (
                    <Badge variant="secondary" className="text-[10px]">
                      {t("create.comingSoon")}
                    </Badge>
                  )}
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

  return (
    <AppLayout>
      <button onClick={() => setType(null)} className="text-sm text-muted-foreground mb-4">
        ← {t("common.back")}
      </button>
      <h1 className="text-display mb-1">{t(typeLabelKey(type))}</h1>
      <p className="text-sm text-muted-foreground mb-6 flex items-center gap-1.5">
        <Sparkles className="size-3.5 text-primary" />
        {t("create.terrainDesc")}
      </p>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label htmlFor="title">{t("create.titleLabel")}</Label>
          <Input
            id="title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("create.titlePlaceholder")}
            className="rounded-xl"
          />
        </div>
        <div>
          <Label htmlFor="loc">{t("dossier.location")}</Label>
          <Input
            id="loc"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder={t("create.locationPlaceholder")}
            className="rounded-xl"
          />
        </div>
        <div>
          <Label htmlFor="desc">{t("create.descLabel")}</Label>
          <Textarea
            id="desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t("create.descPlaceholder")}
            rows={3}
            className="rounded-xl"
          />
        </div>
        <div className="flex gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex-1">
            {t("create.cancel")}
          </Button>
          <Button type="submit" disabled={saving || !title} className="flex-1 bg-gradient-warm">
            {saving && <Loader2 className="size-4 animate-spin" />} {t("create.create")}
          </Button>
        </div>
      </form>
    </AppLayout>
  );
}
