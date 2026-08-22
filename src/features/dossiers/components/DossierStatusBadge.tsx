import { useTranslation } from "react-i18next";
import type { DossierStatus } from "@/core/types/domain";

const STYLES: Record<DossierStatus, { cls: string; dot: string; key: string }> = {
  secure: { cls: "bg-success/10 text-success", dot: "bg-success", key: "dossiers.statusSecure" },
  incomplete: { cls: "bg-warning/10 text-warning-foreground", dot: "bg-warning", key: "dossiers.statusIncomplete" },
  risk: { cls: "bg-destructive/10 text-destructive", dot: "bg-destructive", key: "dossiers.statusRisk" },
};

export function DossierStatusBadge({ status }: { status: string }) {
  const { t } = useTranslation();
  const style = STYLES[(status as DossierStatus) ?? "incomplete"] ?? STYLES.incomplete;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full font-medium ${style.cls}`}>
      <span className={`size-1.5 rounded-full ${style.dot}`} />
      {t(style.key)}
    </span>
  );
}
