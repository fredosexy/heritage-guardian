import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { AppLayout, AssistantTip, EmptyState, NextActionCard, PageHeader } from "@/features/shell";
import { useIdentity } from "@/features/identity";
import { FolderOpen, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useMyFiles } from "../hooks/useMyFiles";
import { FileRow } from "../components/FileRow";

export default function MyFilesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useIdentity();
  const { files, loading, rename, remove, preview } = useMyFiles();

  const handleDelete = async (file: Parameters<typeof remove>[0]) => {
    try {
      await remove(file);
      toast.success(t("files.deleted"));
    } catch {
      toast.error(t("auth.error"));
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title={t("files.title")}
        subtitle={t("files.subtitle")}
        parentLabel={t("nav.profile")}
        showBack
      />

      <AssistantTip className="mb-4" fileCount={files.length} />

      {!isAuthenticated ? (
        <EmptyState
          icon={FolderOpen}
          title={t("files.needAccount")}
          actionLabel={t("visitor.cta")}
          onAction={() => navigate("/auth")}
          secondaryLabel={t("next.seeDossiers")}
          onSecondary={() => navigate("/dossiers")}
        />
      ) : loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="size-5 animate-spin text-primary" />
        </div>
      ) : files.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title={t("files.empty")}
          description={t("files.emptyHint")}
          actionLabel={t("files.goToDossiers")}
          onAction={() => navigate("/dossiers")}
        />
      ) : (
        <div className="space-y-2">
          {files.map((file) => (
            <FileRow
              key={file.id}
              file={file}
              onRename={rename}
              onDelete={handleDelete}
              onPreview={preview}
            />
          ))}
        </div>
      )}

      <NextActionCard className="mt-4" />
    </AppLayout>
  );
}
