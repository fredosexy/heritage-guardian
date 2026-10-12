import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, ChevronRight, Circle } from "lucide-react";
import { useProfileCompletion } from "../hooks/useProfileCompletion";

/**
 * Vue humaine des éléments du profil : aucun score ni jauge.
 * Les états proviennent des étapes calculées par le service existant.
 */
export function ProfileCompletionCard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { steps, missing, next } = useProfileCompletion();

  if (steps.length === 0) return null;

  const establishedCount = steps.length - missing.length;
  const allEstablished = missing.length === 0;

  return (
    <section className="card-soft p-5 mb-6 space-y-4" aria-labelledby="profile-priorities-title">
      <div className="flex items-start gap-3">
        <span className="size-10 rounded-xl bg-accent text-primary flex items-center justify-center shrink-0">
          {allEstablished ? <CheckCircle2 className="size-5" /> : <Circle className="size-5" />}
        </span>
        <div className="min-w-0 flex-1">
          <h2 id="profile-priorities-title" className="text-base font-semibold">
            {t("completion.title")}
          </h2>
          <p className="text-caption mt-1">
            {allEstablished
              ? "Les éléments essentiels de votre profil sont renseignés."
              : missing.length === 1
                ? "Un élément reste à renseigner pour mieux vous accompagner."
                : `${missing.length} éléments restent à renseigner pour mieux vous accompagner.`}
          </p>
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {establishedCount} / {steps.length} éléments renseignés
        </span>
      </div>

      <ul className="space-y-2">
        {steps.map((step) => (
          <li key={step.id} className="flex items-center gap-3 rounded-xl border border-border/70 p-3">
            <span className={step.done ? "text-primary" : "text-muted-foreground"} aria-hidden="true">
              {step.done ? <CheckCircle2 className="size-4" /> : <Circle className="size-4" />}
            </span>
            <span className="flex-1 min-w-0 text-sm">{t(step.labelKey)}</span>
            <span className={step.done ? "text-xs text-primary" : "text-xs text-muted-foreground"}>
              {step.done ? "Renseigné" : "À compléter"}
            </span>
          </li>
        ))}
      </ul>

      {next && (
        <button
          onClick={() => navigate(next.route)}
          className="w-full flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-left text-sm font-medium text-primary-foreground tap focus-ring"
        >
          <span className="flex-1">{t(next.labelKey)}</span>
          <span>Continuer</span>
          <ChevronRight className="size-4" />
        </button>
      )}
    </section>
  );
}
