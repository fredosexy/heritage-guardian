import { supabase } from "@/integrations/supabase/client";
import * as proceduresRepo from "@/data/procedures.repo";
import { db, DraftDossier } from "./db";

let syncing = false;
const listeners = new Set<() => void>();

export function onSyncChange(cb: () => void) {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}
function emit() {
  listeners.forEach((l) => l());
}

export async function enqueueCreateDossier(draft: Omit<DraftDossier, "id" | "synced" | "created_at" | "updated_at"> & { localId: string }) {
  const now = Date.now();
  await db.drafts.add({ ...draft, created_at: now, updated_at: now, synced: 0 });
  await db.queue.add({ kind: "create_dossier", payload: { localId: draft.localId }, created_at: now, attempts: 0 });
  emit();
  void processQueue();
}

/** Met en attente la sauvegarde des sections d'un dossier Terrain existant. */
export async function enqueueUpdateDossierMetadata(dossierId: string, metadata: Record<string, unknown>) {
  // Keep only the latest pending snapshot for this dossier to avoid replaying stale edits.
  const pending = await db.queue.where("kind").equals("update_dossier").toArray();
  const existing = pending.find((op) => op.payload?.dossierId === dossierId);
  if (existing?.id) {
    await db.queue.update(existing.id, {
      payload: { dossierId, metadata },
      created_at: Date.now(),
      attempts: 0,
      last_error: undefined,
    });
  } else {
    await db.queue.add({
      kind: "update_dossier",
      payload: { dossierId, metadata },
      created_at: Date.now(),
      attempts: 0,
    });
  }
  emit();
  if (typeof navigator === "undefined" || navigator.onLine) void processQueue();
}

/** Stocke le fichier lui-même dans IndexedDB avant de confirmer sa mise en attente. */
export async function enqueueProofUpload(params: { file: File; dossierId: string; userId: string; sectionKey?: string }) {
  const { file, dossierId, userId, sectionKey } = params;
  const opId = await db.queue.add({
    kind: "upload_proof",
    payload: { file, fileName: file.name, mimeType: file.type || "application/octet-stream", sizeBytes: file.size, dossierId, userId, sectionKey, storagePath: "" },
    created_at: Date.now(), attempts: 0,
  });
  await db.queue.update(opId, { payload: {
    file, fileName: file.name, mimeType: file.type || "application/octet-stream", sizeBytes: file.size, dossierId, userId, sectionKey,
    storagePath: `${userId}/${dossierId}/queued-${opId}-${encodeURIComponent(file.name)}`,
  }});
  emit();
  if (typeof navigator === "undefined" || navigator.onLine) void processQueue();
}

export async function processQueue(): Promise<void> {
  if (syncing) return;
  if (typeof navigator !== "undefined" && !navigator.onLine) return;

  syncing = true;
  try {
    const ops = await db.queue.orderBy("created_at").toArray();
    for (const op of ops) {
      try {
        if (op.kind === "create_dossier") {
          const draft = await db.drafts.where("localId").equals(op.payload.localId).first();
          if (!draft || draft.synced) {
            await db.queue.delete(op.id!);
            continue;
          }
          const { data, error } = await supabase.from("dossiers").insert({
            user_id: draft.user_id,
            type: draft.type as any,
            title: draft.title,
            description: draft.description || null,
            location_name: draft.location_name || null,
            latitude: draft.latitude ?? null,
            metadata: draft.metadata ?? {},
            longitude: draft.longitude ?? null,
            status: "incomplete",
          }).select().single();
          if (error) throw error;
          await db.drafts.update(draft.id!, { synced: 1, remote_id: data.id });
          await db.queue.delete(op.id!);
          emit();
          try {
            await proceduresRepo.initializeDossierJourney(data.id);
          } catch (journeyError: any) {
            const code = journeyError?.code;
            const message = journeyError?.message || String(journeyError);
            if (code !== "P0002" && !message.includes("published_procedure_not_found")) {
              await db.queue.add({
                kind: "initialize_journey",
                payload: { dossierId: data.id },
                created_at: Date.now(),
                attempts: 0,
                last_error: message,
              });
            }
          }
        } else if (op.kind === "initialize_journey") {
          const dossierId = op.payload?.dossierId;
          if (!dossierId) {
            await db.queue.delete(op.id!);
            continue;
          }
          await proceduresRepo.initializeDossierJourney(dossierId);
          await db.queue.delete(op.id!);
          emit();
        } else if (op.kind === "update_dossier") {
          const dossierId = op.payload?.dossierId;
          const metadata = op.payload?.metadata;
          if (!dossierId || !metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
            await db.queue.update(op.id!, { attempts: (op.attempts || 0) + 1, last_error: "Invalid queued dossier update" });
            break;
          }
          // Merge with the latest server metadata so unrelated concurrent changes survive.
          const { data: currentDossier, error: readError } = await supabase
            .from("dossiers")
            .select("metadata")
            .eq("id", dossierId)
            .single();
          if (readError) throw readError;
          const currentMetadata = currentDossier?.metadata && typeof currentDossier.metadata === "object" && !Array.isArray(currentDossier.metadata)
            ? currentDossier.metadata as Record<string, unknown>
            : {};
          const queuedMetadata = metadata as Record<string, unknown>;
          const currentTerrain = currentMetadata.terrain && typeof currentMetadata.terrain === "object" && !Array.isArray(currentMetadata.terrain)
            ? currentMetadata.terrain as Record<string, unknown>
            : {};
          const queuedTerrain = queuedMetadata.terrain && typeof queuedMetadata.terrain === "object" && !Array.isArray(queuedMetadata.terrain)
            ? queuedMetadata.terrain as Record<string, unknown>
            : {};
          const currentSections = currentTerrain.sections && typeof currentTerrain.sections === "object" && !Array.isArray(currentTerrain.sections)
            ? currentTerrain.sections as Record<string, unknown>
            : {};
          const queuedSections = queuedTerrain.sections && typeof queuedTerrain.sections === "object" && !Array.isArray(queuedTerrain.sections)
            ? queuedTerrain.sections as Record<string, unknown>
            : {};
          const mergedMetadata = {
            ...currentMetadata,
            ...queuedMetadata,
            ...(queuedMetadata.terrain ? {
              terrain: {
                ...currentTerrain,
                ...queuedTerrain,
                ...(queuedTerrain.sections ? { sections: { ...currentSections, ...queuedSections } } : {}),
              },
            } : {}),
          };
          const { error } = await supabase.from("dossiers").update({ metadata: mergedMetadata }).eq("id", dossierId);
          if (error) throw error;
          await db.queue.delete(op.id!);
          emit();
        } else if (op.kind === "upload_proof") {
          const payload = op.payload;
          const file = payload?.file as Blob | undefined;
          const { dossierId, userId, fileName, mimeType, sizeBytes, sectionKey, storagePath } = payload ?? {};
          if (!file || !dossierId || !userId || !storagePath) {
            await db.queue.update(op.id!, { attempts: (op.attempts || 0) + 1, last_error: "Invalid queued proof upload" });
            break;
          }
          const { data: existing, error: existingError } = await supabase.from("proofs").select("id").eq("storage_path", storagePath).maybeSingle();
          if (existingError) throw existingError;
          if (!existing) {
            const { error: uploadError } = await supabase.storage.from("dossier-proofs").upload(storagePath, file, { contentType: mimeType, upsert: true });
            if (uploadError) throw uploadError;
            const proofMetadata = sectionKey ? { terrainSectionKey: sectionKey } : {};
            const { error: insertError } = await supabase.from("proofs").insert({
              dossier_id: dossierId, uploaded_by: userId,
              type: mimeType.startsWith("image/") ? "image" : mimeType.startsWith("video/") ? "video" : mimeType.startsWith("audio/") ? "audio" : "document",
              title: fileName, storage_path: storagePath, mime_type: mimeType, size_bytes: sizeBytes, metadata: proofMetadata,
            });
            if (insertError) throw insertError;
          }
          await db.queue.delete(op.id!);
          emit();
        } else {
          // Ne jamais supprimer silencieusement une mutation encore non prise en charge.
          await db.queue.update(op.id!, {
            attempts: (op.attempts || 0) + 1,
            last_error: "Unsupported queued operation",
          });
          break;
        }
      } catch (e: any) {
        await db.queue.update(op.id!, {
          attempts: (op.attempts || 0) + 1,
          last_error: e?.message || String(e),
        });
        break;
      }
    }
  } finally {
    syncing = false;
    emit();
  }
}

export function initSyncListeners() {
  if (typeof window === "undefined") return;
  window.addEventListener("online", () => void processQueue());
  if (navigator.onLine) void processQueue();
}

export async function getPendingCount(): Promise<number> {
  return db.queue.count();
}

export async function saveLocalDraft(
  draft: Omit<DraftDossier, "id" | "synced" | "created_at" | "updated_at"> & { localId: string }
): Promise<void> {
  const now = Date.now();
  await db.drafts.add({ ...draft, created_at: now, updated_at: now, synced: 0 });
  emit();
}

export async function listLocalDrafts(userId: string): Promise<DraftDossier[]> {
  return db.drafts.where({ user_id: userId, synced: 0 }).reverse().sortBy("updated_at");
}

export async function deleteLocalDraft(localId: string): Promise<void> {
  const draft = await db.drafts.where("localId").equals(localId).first();
  if (draft?.id) await db.drafts.delete(draft.id);
  emit();
}

export async function claimLocalDrafts(fromUserId: string, toUserId: string): Promise<number> {
  if (!fromUserId || fromUserId === toUserId) return 0;
  const drafts = await db.drafts.where({ user_id: fromUserId, synced: 0 }).toArray();
  for (const draft of drafts) {
    await db.drafts.update(draft.id!, { user_id: toUserId, updated_at: Date.now() });
    await db.queue.add({
      kind: "create_dossier",
      payload: { localId: draft.localId },
      created_at: Date.now(),
      attempts: 0,
    });
  }
  emit();
  if (drafts.length > 0) void processQueue();
  return drafts.length;
}
