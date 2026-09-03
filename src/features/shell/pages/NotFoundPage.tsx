import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Compass } from "lucide-react";
import { AppLayout } from "../components/AppLayout";
import { EmptyState } from "../components/EmptyState";

/** Aucun cul-de-sac : même une page inconnue propose la suite. */
export default function NotFoundPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="py-10">
        <EmptyState
          icon={Compass}
          title={t("notFound.title")}
          description={t("notFound.description")}
          actionLabel={t("notFound.action")}
          onAction={() => navigate("/", { replace: true })}
          secondaryLabel={t("notFound.secondary")}
          onSecondary={() => navigate("/dossiers")}
        />
      </div>
    </AppLayout>
  );
}
