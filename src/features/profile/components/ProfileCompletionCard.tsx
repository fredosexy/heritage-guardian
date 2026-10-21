import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useProfileCompletion } from "../hooks/useProfileCompletion";

/** Invitation douce à enrichir le profil, jamais bloquante. */
export function ProfileCompletionCard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { percent, next } = useProfileCompletion();

  if (percent >= 100) return null;

  return (
    <section className="card-soft p-4 mb-6">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium">{t("completion.title")}</p>
        <span className="text-caption">{percent >= 75 ? t("completion.stateWellAdvanced") : percent >= 40 ? t("completion.stateTakingShape") : t("completion.stateToComplete")}</span>
      </div>
      {next && (
        <button
          onClick={() => navigate(next.route)}
          className="w-full flex items-center gap-2 text-left text-sm text-primary tap focus-ring"
        >
          <span className="flex-1">{t(next.labelKey)}</span>
          <ChevronRight className="size-4" />
        </button>
      )}
    </section>
  );
}
