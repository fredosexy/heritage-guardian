import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { FileText, Image as ImageIcon, Loader2, Plus } from "lucide-react";
import type { Proof } from "@/core/types/domain";

interface Props {
  proofs: Proof[];
  uploading: boolean;
  onUpload: (file: File) => void;
}

export function ProofsTab({ proofs, uploading, onUpload }: Props) {
  const { t } = useTranslation();
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-3">
      <input
        ref={fileRef}
        type="file"
        accept="image/*,application/pdf,video/*"
        hidden
        onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
      />
      <Button onClick={() => fileRef.current?.click()} disabled={uploading} className="w-full bg-gradient-warm">
        {uploading ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
        {t("dossier.addProof")}
      </Button>
      {proofs.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">{t("dossier.noProofs")}</p>
      ) : (
        <div className="space-y-2">
          {proofs.map((p) => (
            <div key={p.id} className="card-soft p-3 flex items-center gap-3">
              <div className="size-9 rounded-lg bg-accent flex items-center justify-center text-primary">
                {p.type === "image" ? <ImageIcon className="size-4" /> : <FileText className="size-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{p.title}</p>
                <p className="text-caption">
                  {((p.size_bytes ?? 0) / 1024).toFixed(0)} {t("dossier.kb")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
