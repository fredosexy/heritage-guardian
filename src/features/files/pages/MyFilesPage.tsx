import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/features/shell";
import { useIdentity } from "@/features/identity";
import { Button } from "@/components/ui/button";
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
      <button onClick={() => navigate(-1)} className="text-sm text-muted-foreground mb-4 tap focus-ring">
        ← {t("common.back")}
      </button>
      <h1 className="text-display mb-1">{t("files.title")}</h1>
      <p className="text-sm text-muted-foreground mb-6">{t("files.subtitle")}</p>

      {!isAuthenticated ? (
        <div className="card-soft p-8 text-center">
          <p className="text-muted-foreground mb-4">{t("files.needAccount")}</p>
          <Button onClick={() => navigate("/auth")} className="bg-gradient-warm">
            {t("visitor.cta")}
          </Button>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="size-5 animate-spin text-primary" />
        </div>
      ) : files.length === 0 ? (
        <div className="card-soft p-8 text-center">
          <FolderOpen className="size-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">{t("files.empty")}</p>
          <Button onClick={() => navigate("/dossiers")} className="bg-gradient-warm">
            {t("files.goToDossiers")}
          </Button>
        </div>
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
    </AppLayout>
  );
}
