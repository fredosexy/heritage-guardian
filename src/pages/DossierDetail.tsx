import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, MapPin, FileText, Image as ImageIcon, Trash2, Plus, Loader2, Sparkles, Users } from "lucide-react";
import { toast } from "sonner";

export default function DossierDetail() {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dossier, setDossier] = useState<any>(null);
  const [proofs, setProofs] = useState<any[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    if (!id || !user) return;
    const [d, p, pr] = await Promise.all([
      supabase.from("dossiers").select("*").eq("id", id).maybeSingle(),
      supabase.from("proofs").select("*").eq("dossier_id", id).order("created_at", { ascending: false }),
      supabase.from("participants").select("*").eq("dossier_id", id),
    ]);
    setDossier(d.data);
    setProofs(p.data || []);
    setParticipants(pr.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [id, user]);

  // Fetch AI contextual suggestions
  useEffect(() => {
    if (!dossier) return;
    supabase.functions.invoke("ai-context", {
      body: { dossier, proofs_count: proofs.length, participants_count: participants.length },
    }).then(({ data }) => {
      if (data?.suggestions) setAiSuggestions(data.suggestions);
    }).catch(() => {});
  }, [dossier?.id, proofs.length, participants.length]);

  const upload = async (file: File) => {
    if (!user || !dossier) return;
    setUploading(true);
    try {
      const path = `${user.id}/${dossier.id}/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from("dossier-proofs").upload(path, file);
      if (upErr) throw upErr;
      const type = file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : "document";
      const { error: insErr } = await supabase.from("proofs").insert({
        dossier_id: dossier.id, uploaded_by: user.id, type: type as any,
        title: file.name, storage_path: path, mime_type: file.type, size_bytes: file.size,
      });
      if (insErr) throw insErr;

      // Recompute completion + status
      const newCount = proofs.length + 1;
      const score = Math.min(100, newCount * 25 + (dossier.location_name ? 20 : 0) + (dossier.description ? 15 : 0));
      const status = score >= 75 ? "secure" : score >= 40 ? "incomplete" : "risk";
      await supabase.from("dossiers").update({ completion_score: score, status }).eq("id", dossier.id);

      toast.success("Preuve ajoutée");
      load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setUploading(false);
    }
  };

  const remove = async () => {
    if (!confirm(t("dossier.deleteConfirm"))) return;
    await supabase.from("dossiers").delete().eq("id", dossier.id);
    toast.success(t("dossier.deleted"));
    navigate("/dossiers");
  };

  if (loading) return <AppLayout><div className="flex justify-center py-12"><Loader2 className="size-5 animate-spin text-primary" /></div></AppLayout>;
  if (!dossier) return <AppLayout><p>Introuvable</p></AppLayout>;

  const statusColor = dossier.status === "secure" ? "bg-success" : dossier.status === "incomplete" ? "bg-warning" : "bg-destructive";

  return (
    <AppLayout>
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
        <ArrowLeft className="size-4" /> {t("common.back")}
      </button>

      <div className="card-soft p-5 mb-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h1 className="text-xl font-serif">{dossier.title}</h1>
          <button onClick={remove} className="text-muted-foreground hover:text-destructive p-1"><Trash2 className="size-4" /></button>
        </div>
        {dossier.location_name && (
          <p className="text-sm text-muted-foreground flex items-center gap-1.5 mb-3"><MapPin className="size-3.5" />{dossier.location_name}</p>
        )}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{t("dossier.completion")}</span>
            <span className="font-medium">{dossier.completion_score}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className={`h-full ${statusColor} transition-all`} style={{ width: `${dossier.completion_score}%` }} />
          </div>
        </div>
      </div>

      <Tabs defaultValue="proofs">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="proofs">{t("dossier.proofs")}</TabsTrigger>
          <TabsTrigger value="participants">{t("dossier.participants")}</TabsTrigger>
          <TabsTrigger value="summary">{t("dossier.summary")}</TabsTrigger>
        </TabsList>

        <TabsContent value="proofs" className="space-y-3 mt-4">
          <input ref={fileRef} type="file" accept="image/*,application/pdf,video/*" hidden
            onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
          <Button onClick={() => fileRef.current?.click()} disabled={uploading} className="w-full bg-gradient-warm">
            {uploading ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            {t("dossier.addProof")}
          </Button>
          {proofs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">{t("dossier.noProofs")}</p>
          ) : (
            <div className="space-y-2">
              {proofs.map((p) => (
                <div key={p.id} className="card-soft p-3 flex items-center gap-3">
                  <div className="size-9 rounded-lg bg-accent flex items-center justify-center text-primary">
                    {p.type === "image" ? <ImageIcon className="size-4" /> : <FileText className="size-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.title}</p>
                    <p className="text-xs text-muted-foreground">{(p.size_bytes / 1024).toFixed(0)} Ko</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="participants" className="space-y-3 mt-4">
          <div className="card-soft p-4 text-center">
            <Users className="size-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">{t("dossier.noParticipants")}</p>
            <p className="text-xs text-muted-foreground mt-2">Bientôt : invitez héritiers, témoins, experts.</p>
          </div>
        </TabsContent>

        <TabsContent value="summary" className="space-y-3 mt-4">
          <div className="card-soft p-4 space-y-2 text-sm">
            <p><span className="text-muted-foreground">Type :</span> {t(`dossiers.type${dossier.type.charAt(0).toUpperCase() + dossier.type.slice(1)}`)}</p>
            {dossier.description && <p>{dossier.description}</p>}
            <p className="text-xs text-muted-foreground">Créé le {new Date(dossier.created_at).toLocaleDateString()}</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* AI fixed suggestions */}
      {aiSuggestions.length > 0 && (
        <div className="fixed bottom-24 inset-x-0 px-4 z-30">
          <div className="mx-auto max-w-md bg-gradient-hero text-primary-foreground rounded-2xl p-4 shadow-elegant">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="size-4" />
              <p className="text-xs font-medium uppercase tracking-wide opacity-90">{t("ai.title")}</p>
            </div>
            <p className="text-sm">{aiSuggestions[0]}</p>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
