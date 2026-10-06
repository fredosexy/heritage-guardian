import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { AppLayout, EmptyState, PageHeader } from "@/features/shell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ChevronRight, CircleCheck, CircleDot, Loader2, MapPin, Pencil, Save, Sparkles, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { useDossierDetail } from "../hooks/useDossierDetail";
import { dossiersRepo, proceduresRepo } from "@/data";
import type { DossierStep } from "@/core/types/domain";
import { ProofsTab } from "../components/ProofsTab";
import { typeLabelKey } from "../components/dossierTypeMeta";

export default function DossierDetailPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { dossier, proofs, participants, suggestions, loading, uploading, addProof, remove } =
    useDossierDetail(id);
  const [journey, setJourney] = useState<DossierStep[]>([]);
  const [transitioning, setTransitioning] = useState(false);
  const [editingTerrain, setEditingTerrain] = useState(false);
  const [savingTerrain, setSavingTerrain] = useState(false);
  const [terrainSections, setTerrainSections] = useState<Record<string, string>>({});

  useEffect(() => {
    if (id) void proceduresRepo.getDossierSteps(id).then(setJourney).catch(() => setJourney([]));
  }, [id]);

  useEffect(() => {
    if (!dossier || dossier.type !== "terrain") return;
    const metadata = dossier.metadata && typeof dossier.metadata === "object" && !Array.isArray(dossier.metadata)
      ? dossier.metadata as { terrain?: { sections?: Record<string, string> } }
      : {};
    setTerrainSections(metadata.terrain?.sections ?? {});
  }, [dossier?.id, dossier?.metadata, dossier?.type]);

  const saveTerrainSections = async () => {
    if (!dossier) return;
    setSavingTerrain(true);
    try {
      const metadata = dossier.metadata && typeof dossier.metadata === "object" && !Array.isArray(dossier.metadata)
        ? dossier.metadata as Record<string, unknown>
        : {};
      await dossiersRepo.updateDossierMetadata(dossier.id, {
        ...metadata,
        terrain: { version: 1, sections: terrainSections },
      });
      setEditingTerrain(false);
      toast.success(t("create.terrainSaved"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("auth.error"));
    } finally {
      setSavingTerrain(false);
    }
  };

  const transitionStep = async (step: DossierStep, target: "en_cours" | "terminee") => {
    setTransitioning(true);
    try {
      await proceduresRepo.transitionStep(step.id, target);
      setJourney(await proceduresRepo.getDossierSteps(step.dossier_id));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("auth.error"));
    } finally {
      setTransitioning(false);
    }
  };

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
        <div className="py-10">
          <EmptyState
            icon={ArrowLeft}
            title={t("dossier.notFound")}
            description={t("dossier.notFoundHint")}
            actionLabel={t("next.seeDossiers")}
            onAction={() => navigate("/dossiers", { replace: true })}
          />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader title={dossier.title} parentLabel={t("dossiers.title")} showBack />

      <div className="card-soft p-5 mb-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <p className="text-sm text-muted-foreground">{t(typeLabelKey(dossier.type))}</p>
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
        <p className="text-sm text-muted-foreground">{t(`dossier.state.${dossier.status}`)}</p>
      </div>

      {dossier.type === "terrain" && (
        <section className="card-soft p-5 mb-4">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <p className="text-sm font-semibold">{t("create.terrainFormTitle")}</p>
              <p className="text-xs text-muted-foreground mt-1">{t("create.terrainFormHint")}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setEditingTerrain((value) => !value)} className="rounded-xl">
              <Pencil className="size-3.5 mr-1.5" />{editingTerrain ? t("create.cancel") : t("create.editTerrain")}
            </Button>
          </div>
          <div className="grid gap-2">
            {(["histoire","provenance","proprietaires","ayantsDroit","documentation","localisation","dimensions","etat","miseEnValeur"] as const).map((key, index) => {
              const value = terrainSections[key] ?? "";
              return (
                <div key={key} className="rounded-2xl border border-border p-3">
                  <div className="flex items-center gap-3">
                    <span className="size-7 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-semibold">{index + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{t("create.terrainSections." + key + ".title")}</p>
                      {!editingTerrain && <p className="text-xs text-muted-foreground mt-0.5">{value || t("create.terrainSections." + key + ".hint")}</p>}
                    </div>
                    {!editingTerrain && value ? <CircleCheck className="size-4 text-primary shrink-0" /> : null}
                  </div>
                  {editingTerrain && (
                    <Textarea
                      value={value}
                      onChange={(e) => setTerrainSections((current) => ({ ...current, [key]: e.target.value }))}
                      placeholder={t("create.terrainSections." + key + ".placeholder")}
                      rows={3}
                      className="rounded-xl mt-3"
                    />
                  )}
                </div>
              );
            })}
          </div>
          {editingTerrain && (
            <Button onClick={() => void saveTerrainSections()} disabled={savingTerrain} className="w-full rounded-xl mt-4">
              {savingTerrain ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Save className="size-4 mr-2" />}
              {t("create.saveTerrainChanges")}
            </Button>
          )}
        </section>
      )}

      {journey.length > 0 && (
        <section className="card-soft p-5 mb-4">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <p className="text-sm font-semibold">{t("modules.stepsTitle")}</p>
              <p className="text-caption mt-1">{journey.some((step) => step.status === "bloquee") ? t("modules.journeyBlocked") : journey.some((step) => step.status === "en_cours") ? t("modules.journeyCurrent") : t("modules.journeyCompleteHint")}</p>
            </div>
            <Sparkles className="size-4 text-primary" />
          </div>
          <div className="space-y-2">
            {journey.map((step, index) => {
              const active = step.status === "en_cours";
              const done = step.status === "terminee";
              const blocked = step.status === "bloquee";
              return (
                <div key={step.id} className="rounded-2xl border border-border p-3">
                  <div className="flex items-start gap-3">
                    <span className="size-7 rounded-full bg-accent text-primary flex items-center justify-center shrink-0">
                      {done ? <CircleCheck className="size-4" /> : active ? <CircleDot className="size-4" /> : index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{step.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{step.short_description}</p>{step.procedure_step?.territorial_level && <p className="text-[11px] text-primary mt-1">{t("modules.territorialLevel")}: {t("modules.territorialLevels." + step.procedure_step.territorial_level)}</p>}{step.procedure_step?.required_competence && <p className="text-[11px] text-muted-foreground mt-0.5">{t("modules.requiredCompetence")}: {step.procedure_step.required_competence}</p>}
                      {blocked && step.blocked_reason && <p className="text-xs text-destructive mt-1">{step.blocked_reason}</p>}
                    </div>
                  </div>
                  {active && <Button onClick={() => void transitionStep(step, "terminee")} disabled={transitioning} size="sm" className="mt-3 w-full rounded-xl">{t("modules.journeyCompleteStep")}<ChevronRight className="size-4 ml-auto" /></Button>}
                </div>
              );
            })}
          </div>
        </section>
      )}
      <Tabs defaultValue="proofs">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="proofs">{t("dossier.proofs")}</TabsTrigger>
          <TabsTrigger value="participants">{t("dossier.participants")}</TabsTrigger>
          <TabsTrigger value="summary">{t("dossier.summary")}</TabsTrigger>
        </TabsList>

        <TabsContent value="proofs" className="mt-4" id="proofs">
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
