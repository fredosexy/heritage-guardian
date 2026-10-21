import { supabase } from "@/integrations/supabase/client";
import { db, type QueuedOp } from "./db";

type ProofOperation = Extract<QueuedOp, { kind: "upload_proof" }>;

/** The persisted primary-key identity is independent of a storage_path unique index. */
export async function replayProof(op: ProofOperation & { id: number }): Promise<void> {
  const { dossierId, userId, storagePath, sectionKey, file, mimeType, fileName, sizeBytes } = op.payload;
  const proofId = await db.transaction("rw", db.queue, async () => {
    const latest = await db.queue.get(op.id);
    if (latest?.kind !== "upload_proof") throw new Error("Queued proof no longer available");
    const id = latest.payload.proofId ?? crypto.randomUUID();
    if (!latest.payload.proofId) await db.queue.update(op.id, { payload: { ...latest.payload, proofId: id } });
    return id;
  });

  const findExisting = async () => {
    const { data, error } = await supabase.from("proofs").select("id, dossier_id, uploaded_by, metadata")
      .eq("storage_path", storagePath);
    if (error) throw error;
    const rows = data ?? [];
    if (rows.length > 1) throw new Error("Multiple proof records use this storage path; owner review required");
    const existing = rows[0];
    if (existing) {
      const metadata = existing.metadata && typeof existing.metadata === "object" && !Array.isArray(existing.metadata)
        ? existing.metadata : {};
      if (existing.dossier_id !== dossierId || existing.uploaded_by !== userId ||
          (metadata.terrainSectionKey ?? undefined) !== sectionKey) {
        throw new Error("Proof dossier or Terrain section mismatch; owner review required");
      }
    }
    return existing;
  };

  if (await findExisting()) return;
  // A missing Storage UPDATE policy is an actionable failure, never a reason to
  // generate a fresh path or delete the already-uploaded object/queued operation.
  const { error: uploadError } = await supabase.storage.from("dossier-proofs")
    .upload(storagePath, file, { contentType: mimeType, upsert: true });
  if (uploadError) throw uploadError;
  const { error } = await supabase.from("proofs").upsert({
    id: proofId, dossier_id: dossierId, uploaded_by: userId,
    type: mimeType.startsWith("image/") ? "image" : mimeType.startsWith("video/") ? "video" : mimeType.startsWith("audio/") ? "audio" : "document",
    title: fileName, storage_path: storagePath, mime_type: mimeType, size_bytes: sizeBytes,
    metadata: sectionKey ? { terrainSectionKey: sectionKey } : {},
  }, { onConflict: "id", ignoreDuplicates: true });
  if (error) throw error;
  if (!(await findExisting())) throw new Error("Proof record not confirmed; retry required");
}