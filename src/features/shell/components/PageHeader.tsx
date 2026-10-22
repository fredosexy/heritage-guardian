import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { parentRoute } from "@/services";

interface Props {
  title: string;
  subtitle?: string;
  /** Fil d'Ariane court : un seul niveau parent, jamais plus. */
  parentLabel?: string;
  showBack?: boolean;
  right?: React.ReactNode;
}

/** En-tête d'écran : titre, fil d'Ariane court, retour toujours prévisible. */
export function PageHeader({ title, subtitle, parentLabel, showBack, right }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const goBack = () => {
    if (window.history.length > 2) navigate(-1);
    else navigate(parentRoute(pathname), { replace: true });
  };

  return (
    <header className="mb-6">
      {showBack && (
        <button
          onClick={goBack}
          className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/75 px-3 text-sm text-muted-foreground mb-3 tap focus-ring shadow-[var(--shadow-soft)]"
        >
          <ArrowLeft className="size-4" /> {parentLabel ?? t("common.back")}
        </button>
      )}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-display">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-prose">{subtitle}</p>}
        </div>
        {right}
      </div>
    </header>
  );
}
