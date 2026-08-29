import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { AppLayout } from "@/features/shell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Loader2, MapPin, Sparkles, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { useDossierDetail } from "../hooks/useDossierDetail";
import { ProofsTab } from "../components/ProofsTab";
import { typeLabelKey } from "../components/dossierTypeMeta";

export default function DossierDetailPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { dossier, proofs, participants, suggestions, loading, uploading, addProof, remove } =
    useDossierDetail(id);

  const handleUpload = async (file: File) => {
    try {
      await addProof(file);
      toast.success(t("dossier.proofAdded"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("auth.error"));
    }
  };

  const handleRemove = async () => {
    if (!confirm(t("dossier.deleteConfirm"))) return;
    try {
      await remove();
      toast.success(t("dossier.deleted"));
      navigate("/dossiers");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("auth.error"));
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center py-12">
          <Loader2 className="size-5 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }
  if (!dossier) {
    return (
      <AppLayout>
        <p className="text-muted-foreground text-center py-12">{t("dossier.notFound")}</p>
      </AppLayout>
    );
  }

  const barColor =
    dossier.status === "secure" ? "bg-success" : dossier.status === "incomplete" ? "bg-warning" : "bg-destructive";

  return (
    <AppLayout>
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
        <ArrowLeft className="size-4" /> {t("common.back")}
      </button>

      <div className="card-soft p-5 mb-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h1 className="text-title text-xl">{dossier.title}</h1>
          <button
            onClick={handleRemove}
            aria-label={t("dossier.delete")}
            className="text-muted-foreground hover:text-destructive p-1"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
        {dossier.location_name && (
          <p className="text-sm text-muted-foreground flex items-center gap-1.5 mb-3">
            <MapPin className="size-3.5" />
            {dossier.location_name}
          </p>
        )}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{t("dossier.completion")}</span>
            <span className="font-medium">{dossier.completion_score}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className={`h-full ${barColor} transition-all`} style={{ width: `${dossier.completion_score}%` }} />
          </div>
        </div>
      </div>

      <Tabs defaultValue="proofs">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="proofs">{t("dossier.proofs")}</TabsTrigger>
          <TabsTrigger value="participants">{t("dossier.participants")}</TabsTrigger>
          <TabsTrigger value="summary">{t("dossier.summary")}</TabsTrigger>
        </TabsList>

        <TabsContent value="proofs" className="mt-4">
          <ProofsTab proofs={proofs} uploading={uploading} onUpload={handleUpload} />
        </TabsContent>

        <TabsContent value="participants" className="mt-4">
          <div className="card-soft p-4 text-center">
            <Users className="size-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              {participants.length === 0 ? t("dossier.noParticipants") : `${participants.length}`}
            </p>
            <p className="text-caption mt-2">{t("dossier.participantsSoon")}</p>
          </div>
        </TabsContent>

        <TabsContent value="summary" className="mt-4">
          <div className="card-soft p-4 space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">{t("dossier.typeLabel")} </span>
              {t(typeLabelKey(dossier.type))}
            </p>
            {dossier.description && <p>{dossier.description}</p>}
            <p className="text-caption">
              {t("dossier.createdOn")} {new Date(dossier.created_at).toLocaleDateString()}
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {suggestions.length > 0 && (
        <div className="fixed bottom-24 inset-x-0 px-4 z-30">
          <div className="mx-auto max-w-md bg-gradient-hero text-primary-foreground rounded-2xl p-4 shadow-elegant">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="size-4" />
              <p className="text-xs font-medium uppercase tracking-wide opacity-90">{t("ai.title")}</p>
            </div>
            <p className="text-sm">{suggestions[0]}</p>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
