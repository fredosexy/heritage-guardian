import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Sparkles, X } from "lucide-react";
import { useScreenTip } from "../hooks/useScreenTip";

interface Props {
  className?: string;
  /** Nombre de fichiers, quand l'écran le connaît déjà. */
  fileCount?: number;
}

/** Assistant d'accueil : une phrase contextuelle, discrète, qui ouvre la conversation. */
export function AssistantTip({ className, fileCount }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { tip, hidden, dismiss } = useScreenTip({ fileCount });

  if (hidden) return null;

  const ask = () => navigate(`/assistant?q=${encodeURIComponent(t(tip.askKey))}`);

  return (
    <div
      className={`flex items-start gap-2 rounded-3xl border border-white/70 bg-gradient-to-r from-accent/70 via-card/85 to-secondary/60 px-4 py-3 shadow-[var(--shadow-soft)] backdrop-blur-sm ${className ?? ""}`}
    >
      <Sparkles className="size-4 text-primary shrink-0 mt-1" />
      <div className="flex-1 min-w-0">
        <p className="text-sm leading-snug">{t(tip.messageKey, tip.messageParams)}</p>
        <button onClick={ask} className="mt-2 inline-flex items-center rounded-full bg-card/80 px-3 text-xs font-medium text-primary tap focus-ring">
          {t("tip.ask")}
        </button>
      </div>
      <button onClick={dismiss} aria-label={t("tip.hide")} className="p-1 text-muted-foreground tap focus-ring">
        <X className="size-3.5" />
      </button>
    </div>
  );
}
