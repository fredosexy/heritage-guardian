import { useTranslation } from "react-i18next";
import type { DossierStatus } from "@/core/types/domain";

const STYLES: Partial<Record<DossierStatus, { cls: string; dot: string; key: string }>> = {
  secure: { cls: "bg-status-secure-soft text-status-secure", dot: "bg-status-secure", key: "dossiers.statusSecure" },
  incomplete: { cls: "bg-status-incomplete-soft text-status-incomplete", dot: "bg-status-incomplete", key: "dossiers.statusIncomplete" },
  risk: { cls: "bg-status-risk-soft text-status-risk", dot: "bg-status-risk", key: "dossiers.statusRisk" },
  brouillon: { cls: "bg-muted text-muted-foreground", dot: "bg-muted-foreground", key: "dossier.statuses.brouillon" },
  actif: { cls: "bg-status-secure-soft text-status-secure", dot: "bg-status-secure", key: "dossier.statuses.actif" },
  en_attente: { cls: "bg-status-incomplete-soft text-status-incomplete", dot: "bg-status-incomplete", key: "dossier.statuses.en_attente" },
  bloque: { cls: "bg-status-risk-soft text-status-risk", dot: "bg-status-risk", key: "dossier.statuses.bloque" },
  a_verifier: { cls: "bg-status-incomplete-soft text-status-incomplete", dot: "bg-status-incomplete", key: "dossier.statuses.a_verifier" },
  a_completer: { cls: "bg-status-incomplete-soft text-status-incomplete", dot: "bg-status-incomplete", key: "dossier.statuses.a_completer" },
  en_traitement: { cls: "bg-accent text-primary", dot: "bg-primary", key: "dossier.statuses.en_traitement" },
  a_finaliser: { cls: "bg-accent text-primary", dot: "bg-primary", key: "dossier.statuses.a_finaliser" },
  clos: { cls: "bg-status-secure-soft text-status-secure", dot: "bg-status-secure", key: "dossier.statuses.clos" },
  archive: { cls: "bg-muted text-muted-foreground", dot: "bg-muted-foreground", key: "dossier.statuses.archive" },
};

export function DossierStatusBadge({ status }: { status: string }) {
  const { t } = useTranslation();
  const style = STYLES[status as DossierStatus] ?? STYLES.brouillon!;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full font-medium ${style.cls}`}>
      <span className={`size-1.5 rounded-full ${style.dot}`} />
      {t(style.key)}
    </span>
  );
}
