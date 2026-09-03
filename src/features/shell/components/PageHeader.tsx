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
    <header className="mb-5">
      {showBack && (
        <button
          onClick={goBack}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-2 tap focus-ring"
        >
          <ArrowLeft className="size-4" /> {parentLabel ?? t("common.back")}
        </button>
      )}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-display">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        {right}
      </div>
    </header>
  );
}
