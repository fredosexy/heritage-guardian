import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppLayout } from "@/features/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/features/identity";
import { MapPin, Users, ScrollText, Scale, BookOpen, ChevronRight, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

const TYPES = [
  { id: "terrain", icon: MapPin, descKey: "create.terrainDesc", available: true },
  { id: "heritage", icon: Users, descKey: "create.heritageDesc", available: false },
  { id: "volonte", icon: ScrollText, descKey: "create.volonteDesc", available: false },
  { id: "conflit", icon: Scale, descKey: "create.conflitDesc", available: false },
  { id: "savoir", icon: BookOpen, descKey: "create.savoirDesc", available: false },
];

export default function Create() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [params] = useSearchParams();
  const initialType = params.get("type");
  const [type, setType] = useState<string | null>(initialType && ["terrain"].includes(initialType) ? initialType : null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // If a "soon" type was passed, ignore
    if (initialType && initialType !== "terrain") {
      setType(null);
    }
  }, [initialType]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !type) return;
    setSaving(true);
    try {
      const online = typeof navigator !== "undefined" ? navigator.onLine : true;
      if (online) {
        const { data, error } = await supabase.from("dossiers").insert({
          user_id: user.id,
          type: type as any,
          title,
          description: description || null,
          location_name: location || null,
          status: "incomplete",
        }).select().single();
        if (error) throw error;
        toast.success(t("create.created"));
        navigate(`/dossiers/${data.id}`);
      } else {
        const { enqueueCreateDossier } = await import("@/data/offline/sync");
        const localId = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        await enqueueCreateDossier({
          localId,
          user_id: user.id,
          type,
          title,
          description: description || null,
          location_name: location || null,
        });
        toast.success(t("create.savedOffline"));
        navigate("/dossiers");
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (!type) {
    return (
      <AppLayout>
        <h1 className="text-2xl font-serif mb-2">{t("create.title")}</h1>
        <p className="text-sm text-muted-foreground mb-6">{t("create.chooseType")}</p>
        <div className="space-y-3">
          {TYPES.map(({ id, icon: Icon, descKey, available }) => (
            <button
              key={id}
              onClick={() => available ? setType(id) : toast.info(t("create.comingSoon"))}
              className={`w-full card-soft p-4 text-left flex items-center gap-3 transition ${available ? "hover:shadow-warm" : "opacity-70"}`}
            >
              <div className={`size-11 rounded-xl flex items-center justify-center shrink-0 ${available ? "bg-gradient-warm text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                <Icon className="size-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{t(`dossiers.type${id.charAt(0).toUpperCase() + id.slice(1)}`)}</span>
                  {!available && <Badge variant="secondary" className="text-[10px]">{t("create.comingSoon")}</Badge>}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{t(descKey)}</p>
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
      <button onClick={() => setType(null)} className="text-sm text-muted-foreground mb-4">← {t("common.back")}</button>
      <h1 className="text-2xl font-serif mb-1">{t(`dossiers.type${type.charAt(0).toUpperCase() + type.slice(1)}`)}</h1>
      <p className="text-sm text-muted-foreground mb-6 flex items-center gap-1.5">
        <Sparkles className="size-3.5 text-primary" />
        {t("create.terrainDesc")}
      </p>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label htmlFor="title">Titre</Label>
          <Input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("create.titlePlaceholder")} className="rounded-xl" />
        </div>
        <div>
          <Label htmlFor="loc">{t("dossier.location")}</Label>
          <Input id="loc" value={location} onChange={(e) => setLocation(e.target.value)} placeholder={t("create.locationPlaceholder")} className="rounded-xl" />
        </div>
        <div>
          <Label htmlFor="desc">Description</Label>
          <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t("create.descPlaceholder")} rows={3} className="rounded-xl" />
        </div>
        <div className="flex gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex-1">{t("create.cancel")}</Button>
          <Button type="submit" disabled={saving || !title} className="flex-1 bg-gradient-warm">
            {saving && <Loader2 className="size-4 animate-spin" />} {t("create.create")}
          </Button>
        </div>
      </form>
    </AppLayout>
  );
}
