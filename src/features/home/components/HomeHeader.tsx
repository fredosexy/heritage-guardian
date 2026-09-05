import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Search, ShieldAlert } from "lucide-react";
import { buildGreeting } from "@/services";
import { AssistantTip } from "@/features/shell";

interface Props {
  firstName?: string | null;
  zone?: string | null;
  /** Alertes non lues : sert au badge et à la ligne « urgences ». */
  alertCount?: number;
  avatarUrl?: string | null;
}

/** En-tête « ami » de l'accueil : salutation, contexte du moment, urgences. */
export function HomeHeader({ firstName, zone, alertCount = 0, avatarUrl }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const greeting = useMemo(
    () => buildGreeting({ firstName, zone, urgentCount: alertCount, hour: new Date().getHours() }),
    [firstName, zone, alertCount]
  );

  return (
    <header className="mb-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-display truncate">{t(greeting.titleKey, greeting.titleParams)}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t(greeting.contextKey, greeting.contextParams)}</p>
        </div>
      </div>

      {greeting.urgencyKey && (
        <button
          onClick={() => navigate("/alerts")}
          className="mt-3 w-full flex items-center gap-2 rounded-xl border-l-4 border-l-destructive bg-destructive/5 px-3 py-2 text-left text-sm tap focus-ring"
        >
          <ShieldAlert className="size-4 text-destructive shrink-0" />
          <span className="flex-1">{t(greeting.urgencyKey, greeting.urgencyParams)}</span>
        </button>
      )}

      <button
        onClick={() => navigate("/assistant")}
        className="mt-3 w-full flex items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2.5 text-left text-sm text-muted-foreground shadow-soft pressable focus-ring tap"
      >
        <Search className="size-4 shrink-0" />
        <span className="truncate">{t("greeting.searchHint")}</span>
      </button>

      <AssistantTip className="mt-3" />
    </header>
  );
}
