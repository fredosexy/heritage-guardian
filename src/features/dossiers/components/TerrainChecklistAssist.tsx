import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { CircleAlert, CircleCheck, Loader2, ShieldAlert, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { enqueueUpdateDossierMetadata } from "@/data";
import type { Dossier, Proof } from "@/core/types/domain";
import {
  buildConfirmedReviewPatch,
  buildTerrainChecklist,
  confirmedReviewFromMetadata,
  requestTerrainChecklistReview,
  terrainSectionsFromMetadata,
  type TerrainChecklistReview,
} from "@/services/terrain-checklist";

interface Props {
  dossier: Dossier;
  proofs: Proof[];
  canEdit: boolean;
  onSaved?: () => void;
}

export function TerrainChecklistAssist({ dossier, proofs, canEdit, onSaved }: Props) {
  const { t, i18n } = useTranslation();
  const [draft, setDraft] = useState<TerrainChecklistReview | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);

  const checklist = useMemo(
    () => buildTerrainChecklist(terrainSectionsFromMetadata(dossier.metadata), proofs),
    [dossier.metadata, proofs],
  );
  const gaps = checklist.filter((item) => item.gap);
  const confirmed = confirmedReviewFromMetadata(dossier.metadata);

  const analyse = async () => {
    setLoading(true);
    setFailed(false);
    try {
      setDraft(await requestTerrainChecklistReview(dossier.id, i18n.language));
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  const confirm = async () => {
    if (!draft || !canEdit) return;
    setSaving(true);
    try {
      await enqueueUpdateDossierMetadata(dossier.id, buildConfirmedReviewPatch(draft));
      setDraft(null);
      toast.success(t("checklist.saved"));
      onSaved?.();
    } catch {
      toast.error(t("checklist.saveError"));
    } finally {
      setSaving(false);
    }
  };

  const shown = draft ?? confirmed;

  return (
    <section className="card-soft p-5 mb-4" aria-labelledby="checklist-title">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p id="checklist-title" className="text-sm font-semibold">{t("checklist.title")}</p>
          <p className="text-caption mt-1">
            {gaps.length === 0 ? t("checklist.allFilled") : t("checklist.gapCount", { count: gaps.length })}
          </p>
        </div>
        <Sparkles className="size-4 text-primary shrink-0" />
      </div>

      {gaps.length > 0 && (
        <ul className="space-y-1.5 mb-4">
          {gaps.map((item) => (
            <li key={item.key} className="flex items-start gap-2 text-sm">
              <CircleAlert className="size-4 text-warning mt-0.5 shrink-0" />
              <span>
                <span className="font-medium">{t(`create.terrainSections.${item.key}.title`)}</span>
                <span className="text-muted-foreground"> — {t(`checklist.gap_${item.gap}`)}</span>
              </span>
            </li>
          ))}
        </ul>
      )}

      {shown && (
        <div className="rounded-2xl border border-border/70 bg-card/70 p-3 mb-3">
          <p className="text-xs font-medium text-primary mb-1">
            {draft ? t("checklist.proposal") : t("checklist.confirmedOn", { date: new Date(confirmed!.confirmedAt).toLocaleDateString(i18n.language) })}
          </p>
          <p className="text-sm">{shown.summary}</p>
          {shown.toComplete.length > 0 && (
            <ul className="mt-2 space-y-1">
              {shown.toComplete.map((line, i) => (
                <li key={i} className="flex gap-2 text-sm"><CircleCheck className="size-4 text-muted-foreground mt-0.5 shrink-0" />{line}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <p className="flex gap-2 text-xs text-muted-foreground mb-3">
        <ShieldAlert className="size-4 shrink-0" />{t("checklist.disclaimer")}
      </p>

      {failed && <p role="alert" className="text-xs text-destructive mb-2">{t("checklist.aiError")}</p>}

      {!canEdit ? (
        <p className="text-xs text-muted-foreground">{t("checklist.ownerOnly")}</p>
      ) : draft ? (
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" className="rounded-2xl" onClick={() => setDraft(null)} disabled={saving}>{t("checklist.discard")}</Button>
          <Button className="rounded-2xl" onClick={() => void confirm()} disabled={saving}>
            {saving && <Loader2 className="size-4 mr-2 animate-spin" />}{t("checklist.confirm")}
          </Button>
        </div>
      ) : (
        <Button variant="outline" className="w-full rounded-2xl" onClick={() => void analyse()} disabled={loading}>
          {loading ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Sparkles className="size-4 mr-2" />}
          {t("checklist.analyse")}
        </Button>
      )}
    </section>
  );
}
