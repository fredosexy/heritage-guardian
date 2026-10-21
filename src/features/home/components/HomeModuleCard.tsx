import { ChevronRight, CircleAlert, CircleCheck, LockKeyhole, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export type HomeModuleState = "new" | "progress" | "risk" | "secure";

interface Props {
  id: string; icon: LucideIcon; dossierCount: number; secureCount: number;
  riskCount?: number; bestCompletion?: number; nextDossierTitle?: string;
  nextAttention?: string; journeyProgress?: number; currentStepTitle?: string | null; nextStepTitle?: string | null; blockedStepTitle?: string | null; participantsCount?: number; proofsCount?: number;
  className?: string; onFirstGesture?: (route: string) => void;
}

export function HomeModuleCard({ id, icon: Icon, dossierCount, secureCount, riskCount = 0, bestCompletion = 0, nextDossierTitle, nextAttention, journeyProgress = 0, currentStepTitle, nextStepTitle, blockedStepTitle, participantsCount = 0, proofsCount = 0, className, onFirstGesture }: Props) {
  const { t } = useTranslation(); const navigate = useNavigate();
  const state: HomeModuleState = riskCount > 0 ? "risk" : secureCount > 0 && secureCount === dossierCount ? "secure" : dossierCount > 0 ? "progress" : "new";
  const route = `/modules/${id}`;
  const handleOpen = () => onFirstGesture ? onFirstGesture(route) : navigate(route);
  return (
    <button type="button" onClick={handleOpen} className={`group w-full rounded-3xl border border-border bg-card p-5 text-left shadow-soft transition hover:-translate-y-0.5 hover:shadow-elegant focus-ring tap ${className ?? ""}`}>
      <div className="flex items-start gap-4">
        <span className="size-11 rounded-2xl bg-accent text-primary flex items-center justify-center shrink-0"><Icon className="size-5" /></span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3"><div><p className="text-base font-semibold">{t(`modules.${id}.title`)}</p><p className="text-sm text-muted-foreground mt-1 leading-relaxed">{t(`modules.${id}.description`)}</p></div><ChevronRight className="size-5 text-muted-foreground shrink-0" /></div>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-muted px-2.5 py-1 font-medium">{t(`modules.state.${state}`)}</span>
            {dossierCount > 0 && <span className="rounded-full border border-border px-2.5 py-1 text-muted-foreground">{t("modules.dossiersCount", { count: dossierCount })}</span>}
            {bestCompletion >= 75 && bestCompletion < 100 && <span className="rounded-full border border-border px-2.5 py-1">{t("modules.completionHintAdvanced")}</span>}{bestCompletion > 0 && bestCompletion < 75 && <span className="rounded-full border border-border px-2.5 py-1">{t("modules.completionHintToComplete")}</span>}
            {participantsCount > 0 && <span className="rounded-full border border-border px-2.5 py-1 text-muted-foreground">{participantsCount} {t("modules.people")}</span>}
            {proofsCount > 0 && <span className="rounded-full border border-border px-2.5 py-1 text-muted-foreground">{proofsCount} {t("modules.proofs")}</span>}
            {riskCount > 0 && <span className="inline-flex items-center gap-1 font-medium text-destructive"><CircleAlert className="size-3.5" />{t("modules.riskCount", { count: riskCount })}</span>}
            {secureCount > 0 && <span className="inline-flex items-center gap-1 text-primary font-medium"><CircleCheck className="size-3.5" />{t("modules.secureCount", { count: secureCount })}</span>}
          </div>
          {nextDossierTitle && state !== "secure" && <div className="mt-3 rounded-2xl bg-muted/60 px-3 py-2"><p className="text-[11px] uppercase tracking-wide text-muted-foreground">{t("modules.nextAttention")}</p><p className="text-sm font-medium truncate">{nextDossierTitle}</p>{blockedStepTitle ? <p className="text-xs text-destructive mt-0.5">{t("modules.journeyBlocked")}: {blockedStepTitle}</p> : currentStepTitle ? <p className="text-xs text-muted-foreground mt-0.5">{t("modules.journeyCurrent")}: {currentStepTitle}{nextStepTitle ? ` · ${t("modules.journeyNext")}: ${nextStepTitle}` : ""}</p> : nextAttention && <p className="text-xs text-muted-foreground mt-0.5">{nextAttention}</p>}</div>}
          <div className="mt-4 flex items-center justify-between gap-3"><span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">{state === "new" ? <Sparkles className="size-4" /> : <LockKeyhole className="size-4" />}{t(`modules.cta.${state}`)}</span><span className="text-xs text-muted-foreground">{t("modules.openPath")}</span></div>
        </div>
      </div>
    </button>
  );
}