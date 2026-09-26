import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, Eye, FileText, Loader2, Paperclip, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { proofsRepo } from "@/data";
import type { Document } from "@/core/types/domain";
import { DOCUMENT_TYPES, type DocumentCoverage } from "@/services/document-service";
import { useAuth } from "@/features/identity";

export function DocumentsSection({ dossierId, bienId }: { dossierId: string; bienId?: string | null }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [coverage, setCoverage] = useState<DocumentCoverage | null>(null);
  const [versionNumbers, setVersionNumbers] = useState<Record<string, number>>({});
  const [replacing, setReplacing] = useState<Document | null>(null);
  const [documentType, setDocumentType] = useState("photo");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const cameraRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const replacementRef = useRef<HTMLInputElement>(null);
  const load = useCallback(async () => {
    const [items, currentCoverage] = await Promise.all([proofsRepo.getDocumentsForDossier(dossierId), proofsRepo.getCurrentDocumentCoverage(dossierId)]);
    const versions = await Promise.all(items.map(async (document) => [document.id, (await proofsRepo.getDocumentVersions(document.id))[0]?.version_number ?? 0] as const));
    setDocuments(items); setCoverage(currentCoverage); setVersionNumbers(Object.fromEntries(versions));
  }, [dossierId]);
  useEffect(() => { void load(); }, [load]);
  const upload = async (file: File) => {
    if (!user) return;
    setUploading(true); setProgress(15);
    try {
      setProgress(40);
      await proofsRepo.uploadDocument({ file, dossierId, bienId, userId: user.id, documentType, title: file.name });
      setProgress(100); await load(); toast.success(t("documents.added"));
    } catch (error) { toast.error(error instanceof Error ? t(`documents.errors.${error.message}`, error.message) : t("auth.error")); }
    finally { setUploading(false); setTimeout(() => setProgress(0), 400); }
  };
  const replace = async (file: File) => {
    if (!user || !replacing) return;
    setUploading(true); setProgress(30);
    try { await proofsRepo.addDocumentVersion(replacing, file, user.id); setProgress(100); await load(); toast.success(t("documents.versionAdded")); }
    catch (error) { toast.error(error instanceof Error ? t(`documents.errors.${error.message}`, error.message) : t("auth.error")); }
    finally { setUploading(false); setReplacing(null); setTimeout(() => setProgress(0), 400); }
  };
  const preview = async (document: Document) => {
    const url = await proofsRepo.getDocumentUrl(document.storage_path);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };
  return <section id="documents" className="card-soft p-5 mb-4 space-y-4">
    <div><h2 className="font-medium flex items-center gap-2"><Paperclip className="size-4" />{t("documents.title")}</h2><p className="text-caption">{t("documents.hint")}</p></div>
    {coverage && coverage.required.length > 0 && <div className="rounded-lg bg-muted p-3 text-sm"><p>{t("documents.coverage", { provided: coverage.provided.length, required: coverage.required.length })}</p>{coverage.missing.length > 0 && <p className="text-caption mt-1">{t("documents.missing")}: {coverage.missing.map((code) => t(`documents.types.${code}`, code)).join(", ")}</p>}</div>}
    <select className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={documentType} onChange={(event) => setDocumentType(event.target.value)} aria-label={t("documents.type")}>{DOCUMENT_TYPES.map((type) => <option key={type} value={type}>{t(`documents.types.${type}`)}</option>)}</select>
    <input ref={cameraRef} hidden type="file" accept="image/*" capture="environment" onChange={(event) => event.target.files?.[0] && void upload(event.target.files[0])} />
    <input ref={fileRef} hidden type="file" accept="image/jpeg,image/png,image/webp,application/pdf,audio/mpeg,audio/mp4,video/mp4" onChange={(event) => event.target.files?.[0] && void upload(event.target.files[0])} />
    <input ref={replacementRef} hidden type="file" accept="image/jpeg,image/png,image/webp,application/pdf,audio/mpeg,audio/mp4,video/mp4" onChange={(event) => event.target.files?.[0] && void replace(event.target.files[0])} />
    <div className="grid grid-cols-2 gap-2"><Button disabled={uploading} onClick={() => cameraRef.current?.click()}><Camera className="size-4" />{t("documents.camera")}</Button><Button variant="outline" disabled={uploading} onClick={() => fileRef.current?.click()}><FileText className="size-4" />{t("documents.file")}</Button></div>
    {uploading && <div className="space-y-1"><div className="flex items-center gap-2 text-caption"><Loader2 className="size-3 animate-spin" />{t("documents.uploading")}</div><Progress value={progress} /></div>}
    {documents.length === 0 ? <p className="text-caption text-center py-3">{t("documents.empty")}</p> : <div className="space-y-2">{documents.map((document) => <div key={document.id} className="rounded-lg border p-3 space-y-2"><div className="flex justify-between gap-2"><p className="text-sm font-medium truncate">{document.title}</p><span className="text-xs text-muted-foreground">{t(`documents.statuses.${document.verification_status}`)}</span></div><p className="text-caption">{t(`documents.types.${document.document_type}`, document.document_type)} · {t(`documents.sources.${document.source_type}`)} · {t("documents.version", { number: versionNumbers[document.id] ?? 1 })}</p><div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => void preview(document)}><Eye className="size-3" />{t("documents.preview")}</Button>{["utilisateur","declaration","accompagnateur"].includes(document.source_type) && <Button size="sm" variant="ghost" onClick={() => { setReplacing(document); replacementRef.current?.click(); }}><RefreshCw className="size-3" />{t("documents.replace")}</Button>}</div></div>)}</div>}
  </section>;
}
