import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { FileText, Image as ImageIcon, Loader2, Plus } from "lucide-react";
import type { Proof } from "@/core/types/domain";

interface Props {
  proofs: Proof[];
  uploading: boolean;
  onUpload: (file: File) => void;
  uploadLabel?: string;
}

export function ProofsTab({ proofs, uploading, onUpload, uploadLabel }: Props) {
  const { t } = useTranslation();
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-3">
      <input ref={fileRef} type="file" accept="image/*,application/pdf,video/*" hidden
        onChange={(e) => { const file = e.target.files?.[0]; if (file) onUpload(file); e.currentTarget.value = ""; }} />
      <Button onClick={() => fileRef.current?.click()} disabled={uploading} className="w-full rounded-2xl bg-primary text-primary-foreground shadow-[var(--shadow-soft)] hover:brightness-105">
        {uploading ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
        {uploadLabel ?? t("dossier.addProof")}
      </Button>
      {proofs.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">{t("dossier.noProofs")}</p>
      ) : (
        <div className="space-y-2">
          {proofs.map((p) => (
            <div key={p.id} className="rounded-2xl border border-border/60 bg-card/85 p-3 flex items-center gap-3 shadow-[var(--shadow-soft)]">
              <div className="size-10 rounded-2xl bg-gradient-to-br from-primary/15 via-accent/70 to-secondary/60 flex items-center justify-center text-primary shrink-0">
                {p.type === "image" ? <ImageIcon className="size-4" /> : <FileText className="size-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{p.title}</p>
                <p className="text-caption">{((p.size_bytes ?? 0) / 1024).toFixed(0)} {t("dossier.kb")} · {p.verified ? t("dossier.proofVerified") : t("dossier.proofNeedsVerification")}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
