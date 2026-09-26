import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Archive, Loader2, UserRound } from "lucide-react";
import { toast } from "sonner";
import { AppLayout, EmptyState, PageHeader } from "@/features/shell";
import { Button } from "@/components/ui/button";
import { useDossierDetail } from "../hooks/useDossierDetail";
import { JourneySection } from "../components/JourneySection";
import { DocumentsSection } from "../components/DocumentsSection";

export default function DossierDetailPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { dossier, participants, loading, archive } = useDossierDetail(id);
  if (loading) return <AppLayout><div className="flex justify-center py-12"><Loader2 className="size-5 animate-spin" /></div></AppLayout>;
  if (!dossier) return <AppLayout><EmptyState icon={Archive} title={t("dossier.notFound")} description={t("dossier.notFoundHint")} actionLabel={t("next.seeDossiers")} onAction={() => navigate("/dossiers")} /></AppLayout>;
  const doArchive = async () => { if (!confirm(t("dossier.archiveConfirm"))) return; try { await archive(); toast.success(t("dossier.archived")); navigate("/dossiers"); } catch (error) { toast.error(error instanceof Error ? error.message : t("auth.error")); } };
  return <AppLayout>
    <PageHeader title={dossier.title} parentLabel={t("dossiers.title")} showBack />
    <section className="card-soft p-5 mb-4 space-y-2">
      <p className="text-sm"><span className="text-muted-foreground">{t("create.asset")} : </span><Link className="text-primary underline" to={`/biens/${dossier.bien_id}`}>{dossier.bien.title}</Link></p>
      <p className="text-sm">{t(`dossiers.types.${dossier.type}`, dossier.type)}</p>
      <div className="grid grid-cols-2 gap-2 text-caption"><span>{t(`dossier.statuses.${dossier.status}`, dossier.status)}</span><span>{t(`dossier.completionLevels.${dossier.completion_level}`, dossier.completion_level)}</span><span>{t(`dossier.visibilities.${dossier.visibility}`, dossier.visibility)}</span></div>
      {dossier.description && <p className="text-sm pt-2 whitespace-pre-wrap">{dossier.description}</p>}
    </section>
    <section className="card-soft p-5 mb-4 space-y-3">
      <h2 className="font-medium flex items-center gap-2"><UserRound className="size-4" />{t("dossier.concernedPeople")}</h2>
      {participants.length === 0 ? <p className="text-caption">{t("dossier.noParticipants")}</p> : participants.map((participant) => <div key={participant.id} className="rounded-xl border p-3"><p className="text-sm font-medium">{participant.person.display_name}</p><p className="text-caption">{t(`dossier.roles.${participant.role}`, participant.role)} · {t(`dossier.participantStatuses.${participant.status}`, participant.status)}</p></div>)}
    </section>
    <DocumentsSection dossierId={dossier.id} bienId={dossier.bien_id} />
    <JourneySection dossierId={dossier.id} hasProcedure={Boolean(dossier.procedure_definition_id)} />
    <Button variant="outline" className="w-full" onClick={doArchive}><Archive className="size-4" />{t("dossier.archive")}</Button>
  </AppLayout>;
}
