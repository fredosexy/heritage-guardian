import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Bell, User } from "lucide-react";

interface Props {
  /** Nombre d'alertes non lues (badge). */
  alertCount?: number;
  /** Avatar de l'utilisateur, si disponible. */
  avatarUrl?: string | null;
}

/**
 * Actions de tête d'écran : Alertes et Profil.
 * Elles vivent ici, jamais dans la barre du bas.
 */
export function TopBar({ alertCount = 0, avatarUrl }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-2 shrink-0">
      <button
        onClick={() => navigate("/alerts")}
        aria-label={t("nav.alerts")}
        className="relative size-10 rounded-full bg-card border border-border flex items-center justify-center shadow-soft pressable focus-ring tap"
      >
        <Bell className="size-[18px]" />
        {alertCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 text-[10px] rounded-full bg-destructive text-destructive-foreground flex items-center justify-center font-bold">
            {alertCount > 9 ? "9+" : alertCount}
          </span>
        )}
      </button>

      <button
        onClick={() => navigate("/profile")}
        aria-label={t("nav.profile")}
        className="size-10 rounded-full bg-card border border-border overflow-hidden flex items-center justify-center shadow-soft pressable focus-ring tap"
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="size-full object-cover" loading="lazy" />
        ) : (
          <User className="size-[18px]" />
        )}
      </button>
    </div>
  );
}
