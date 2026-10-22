import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Eye, FileText, Image as ImageIcon, Loader2, Music, Pencil, Trash2, Video } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { MyFile } from "../hooks/useMyFiles";

const iconFor = (type: string) =>
  type === "image" ? ImageIcon : type === "video" ? Video : type === "audio" ? Music : FileText;

function readableSize(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

interface Props {
  file: MyFile;
  onRename: (id: string, title: string) => Promise<void>;
  onDelete: (file: MyFile) => Promise<void>;
  onPreview: (storagePath: string) => Promise<string | null>;
}

export function FileRow({ file, onRename, onDelete, onPreview }: Props) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(file.title ?? "");
  const [busy, setBusy] = useState(false);
  const Icon = iconFor(file.type);

  const save = async () => {
    setBusy(true);
    try {
      await onRename(file.id, name.trim() || (file.title ?? ""));
      setEditing(false);
    } finally {
      setBusy(false);
    }
  };

  const open = async () => {
    const url = await onPreview(file.storage_path);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="group rounded-3xl border border-border/60 bg-gradient-to-br from-card to-accent/10 p-3 flex items-center gap-3 shadow-[var(--shadow-soft)] transition-colors hover:border-primary/25">
      <span className="size-11 rounded-2xl bg-gradient-to-br from-primary/15 via-accent/70 to-secondary/60 text-primary flex items-center justify-center shrink-0">
        <Icon className="size-4" />
      </span>

      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="flex items-center gap-2">
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="h-10 rounded-2xl border-border/70 bg-background/70 focus-visible:ring-2 focus-visible:ring-ring"
              autoFocus
            />
            <Button size="sm" onClick={save} disabled={busy} className="rounded-xl bg-primary text-primary-foreground hover:brightness-105">
              {busy ? <Loader2 className="size-3 animate-spin" /> : t("common.save")}
            </Button>
          </div>
        ) : (
          <>
            <p className="text-sm font-medium truncate">{file.title || t("files.untitled")}</p>
            <p className="text-caption truncate">
              {[file.dossier_title, readableSize(file.size_bytes)].filter(Boolean).join(" · ")}
            </p>
          </>
        )}
      </div>

      {!editing && (
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={open} className="tap focus-ring rounded-xl border border-transparent p-2 text-muted-foreground transition-colors hover:border-primary/20 hover:bg-accent/50 hover:text-primary" aria-label={t("files.preview")}>
            <Eye className="size-4" />
          </button>
          <button
            onClick={() => setEditing(true)}
            className="tap focus-ring p-2 text-muted-foreground"
            aria-label={t("files.rename")}
          >
            <Pencil className="size-4" />
          </button>
          <button
            onClick={() => void onDelete(file)}
            className="tap focus-ring rounded-xl border border-transparent p-2 text-destructive transition-colors hover:border-destructive/20 hover:bg-destructive/5"
            aria-label={t("common.delete")}
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}
