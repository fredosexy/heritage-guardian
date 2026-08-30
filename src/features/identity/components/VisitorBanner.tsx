import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { useIdentity } from "../hooks/useIdentity";

/** Rappel doux, jamais bloquant : « vos données sont sur cet appareil ». */
export function VisitorBanner() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isGuest } = useIdentity();

  if (!isGuest) return null;

  return (
    <div className="mb-4 rounded-2xl border border-border bg-surface p-3 flex items-center gap-3">
      <span className="size-10 rounded-xl bg-accent text-primary flex items-center justify-center shrink-0">
        <ShieldCheck className="size-4" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{t("visitor.title")}</p>
        <p className="text-caption">{t("visitor.subtitle")}</p>
      </div>
      <button
        onClick={() => navigate("/auth")}
        className="text-xs font-medium text-primary hover:underline tap focus-ring px-2"
      >
        {t("visitor.cta")}
      </button>
    </div>
  );
}
