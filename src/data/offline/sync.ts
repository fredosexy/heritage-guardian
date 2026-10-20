import { supabase } from "@/integrations/supabase/client";
import * as proceduresRepo from "@/data/procedures.repo";
import { detectConflictFields, type DossierChanges } from "@/services/sync-conflicts";
import { db, DraftDossier } from "./db";

let syncing = false;
let rerunRequested = false;
const listeners = new Set<() => void>();

export function onSyncChange(cb: () => void) {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}
function emit() {
  listeners.forEach((l) => l());
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error && typeof error.message === "string") {
    return error.message;
  }
  return String(error);
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
  // Coalesce pending edits without dropping sections saved by an earlier offline edit.
  const pending = await db.queue.where("kind").equals("update_dossier").toArray();
  const existing = pending.find((op) => op.payload?.dossierId === dossierId);
  if (existing?.id) {
    const previous = existing.payload?.metadata && typeof existing.payload.metadata === "object" && !Array.isArray(existing.payload.metadata)
      ? existing.payload.metadata as Record<string, unknown>
      : {};
    const previousTerrain = previous.terrain && typeof previous.terrain === "object" && !Array.isArray(previous.terrain)
      ? previous.terrain as Record<string, unknown>
      : {};
    const nextTerrain = metadata.terrain && typeof metadata.terrain === "object" && !Array.isArray(metadata.terrain)
      ? metadata.terrain as Record<string, unknown>
      : {};
    const previousSections = previousTerrain.sections && typeof previousTerrain.sections === "object" && !Array.isArray(previousTerrain.sections)
      ? previousTerrain.sections as Record<string, unknown>
      : {};
    const nextSections = nextTerrain.sections && typeof nextTerrain.sections === "object" && !Array.isArray(nextTerrain.sections)
      ? nextTerrain.sections as Record<string, unknown>
      : {};
    const mergedMetadata = metadata.terrain
      ? {
          ...previous,
          ...metadata,
          terrain: {
            ...previousTerrain,
            ...nextTerrain,
            ...(previousTerrain.sections || nextTerrain.sections
              ? { sections: { ...previousSections, ...nextSections } }
              : {}),
          },
        }
      : { ...previous, ...metadata };
    await db.queue.update(existing.id, {
      payload: { dossierId, metadata: mergedMetadata },
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

/** Stocke le fichier et son chemin de destination dans une seule écriture IndexedDB. */
export async function enqueueProofUpload(params: {
  file: File;
  dossierId: string;
  userId: string;
  sectionKey?: string;
  storagePath?: string;
}) {
  const { file, dossierId, userId, sectionKey } = params;
  const storagePath = params.storagePath ??
    `${userId}/${dossierId}/queued-${Date.now()}-${Math.random().toString(36).slice(2)}-${encodeURIComponent(file.name)}`;
  await db.queue.add({
    kind: "upload_proof",
    payload: {
      file,
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      sizeBytes: file.size,
      dossierId,
      userId,
      sectionKey,
      storagePath,
    },
    created_at: Date.now(),
    attempts: 0,
  });
  emit();
  if (typeof navigator === "undefined" || navigator.onLine) void processQueue();
}

export async function processQueue(): Promise<void> {
  if (syncing) {
    // A mutation may be queued while this pass is awaiting the network. Request one
    // fresh pass after the current one finishes so the newer payload is not stranded.
    rerunRequested = true;
    return;
  }
  if (typeof navigator !== "undefined" && !navigator.onLine) return;

  syncing = true;
  try {
    const ops = await db.queue.orderBy("created_at").toArray();
    for (const op of ops) {
      try {
        // An operation can outlive the session that queued it. Never replay it
        // under a missing or different identity.
        const { data: { user: currentUser }, error: sessionError } = await supabase.auth.getUser();
        if (sessionError || !currentUser) break;

        if (op.kind === "create_dossier") {
          const draft = await db.drafts.where("localId").equals(op.payload.localId).first();
          if (!draft || draft.synced) {
            await db.queue.delete(op.id!);
            continue;
          }
          if (draft.user_id !== currentUser.id) break;
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
          } catch (journeyError: unknown) {
            const code = typeof journeyError === "object" && journeyError !== null && "code" in journeyError ? journeyError.code : undefined;
            const message = getErrorMessage(journeyError);
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
          const { data: ownedDossier, error: ownershipError } = await supabase
            .from("dossiers")
            .select("id")
            .eq("id", dossierId)
            .eq("user_id", currentUser.id)
            .single();
          if (ownershipError) throw ownershipError;
          if (!ownedDossier) break;
          await proceduresRepo.initializeDossierJourney(dossierId);
          await db.queue.delete(op.id!);
          emit();
        } else if (op.kind === "update_dossier") {
          const payload = op.payload;
          const dossierId = payload?.dossierId;
          if (!dossierId) {
            await db.queue.update(op.id!, { attempts: (op.attempts || 0) + 1, last_error: "Invalid queued dossier update" });
            break;
          }

          // Main's offline editor queues field-level changes with a base timestamp.
          // Detect overlapping edits and persist them for the Sync Center instead of overwriting.
          if (payload.changes && payload.baseUpdatedAt) {
            const changes = payload.changes as DossierChanges;
            const { data: remote, error: readError } = await supabase
              .from("dossiers")
              .select("*")
              .eq("id", dossierId)
              .eq("user_id", currentUser.id)
              .single();
            if (readError) throw readError;
            if (remote.user_id !== currentUser.id) break;
            const fields = detectConflictFields(payload.baseUpdatedAt, remote, changes);
            if (fields.length > 0) {
              const theirs: Record<string, string | null> = {};
              for (const field of Object.keys(changes) as (keyof DossierChanges)[]) theirs[field] = remote[field] ?? null;
              await db.conflicts.add({
                dossier_id: dossierId,
                title: remote.title,
                fields,
                mine: Object.fromEntries(Object.entries(changes).map(([key, value]) => [key, value ?? null])) as Record<string, string | null>,
                theirs,
                remote_updated_at: remote.updated_at,
                created_at: Date.now(),
              });
            } else {
              const { error } = await supabase.from("dossiers")
                .update(changes)
                .eq("id", dossierId)
                .eq("user_id", currentUser.id);
              if (error) throw error;
            }
            await db.queue.delete(op.id!);
            emit();
          } else {
            // Terrain section metadata is merged with the latest server state, not a stale snapshot.
            const metadata = payload?.metadata;
            if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
              await db.queue.update(op.id!, { attempts: (op.attempts || 0) + 1, last_error: "Invalid queued dossier update" });
              break;
            }
            const { data: currentDossier, error: readError } = await supabase
              .from("dossiers")
              .select("metadata, user_id")
              .eq("id", dossierId)
              .eq("user_id", currentUser.id)
              .single();
            if (readError) throw readError;
            if (currentDossier.user_id !== currentUser.id) break;
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
            const mergedMetadata = queuedMetadata.terrain
              ? {
                  ...currentMetadata,
                  terrain: {
                    ...currentTerrain,
                    ...queuedTerrain,
                    ...(queuedTerrain.sections
                      ? { sections: { ...currentSections, ...queuedSections } }
                      : {}),
                  },
                }
              : { ...currentMetadata, ...queuedMetadata };
            const { error } = await supabase.from("dossiers")
              .update({ metadata: mergedMetadata })
              .eq("id", dossierId)
              .eq("user_id", currentUser.id);
            if (error) throw error;
            // A new offline edit may have replaced this payload during the request.
            const latestQueued = await db.queue.get(op.id!);
            if (latestQueued?.kind === "update_dossier" &&
                latestQueued.payload?.dossierId === dossierId &&
                JSON.stringify(latestQueued.payload?.metadata) === JSON.stringify(metadata)) {
              await db.queue.delete(op.id!);
            }
            emit();
          }        } else if (op.kind === "upload_proof") {
          const payload = op.payload;
          const file = payload?.file as Blob | undefined;
          const { dossierId, userId, fileName, mimeType, sizeBytes, sectionKey, storagePath } = payload ?? {};
          if (!file || !dossierId || !userId || !storagePath) {
            await db.queue.update(op.id!, { attempts: (op.attempts || 0) + 1, last_error: "Invalid queued proof upload" });
            break;
          }
          if (userId !== currentUser.id) break;
          const { data: ownedDossier, error: ownershipError } = await supabase
            .from("dossiers")
            .select("id")
            .eq("id", dossierId)
            .eq("user_id", currentUser.id)
            .single();
          if (ownershipError) throw ownershipError;
          if (!ownedDossier) break;
          // Multiple tabs may process the same queued operation at once. Storage upsert
          // makes the object write repeatable; the unique storage_path index plus DB upsert
          // ensures that all workers converge on one proof row.
          const { error: uploadError } = await supabase.storage.from("dossier-proofs").upload(storagePath, file, { contentType: mimeType, upsert: true });
          if (uploadError) throw uploadError;
          const proofMetadata = sectionKey ? { terrainSectionKey: sectionKey } : {};
          const { error: upsertError } = await supabase.from("proofs").upsert({
            dossier_id: dossierId, uploaded_by: userId,
            type: mimeType.startsWith("image/") ? "image" : mimeType.startsWith("video/") ? "video" : mimeType.startsWith("audio/") ? "audio" : "document",
            title: fileName, storage_path: storagePath, mime_type: mimeType, size_bytes: sizeBytes, metadata: proofMetadata,
          }, { onConflict: "storage_path" });
          if (upsertError) throw upsertError;
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
      } catch (e: unknown) {
        await db.queue.update(op.id!, {
          attempts: (op.attempts || 0) + 1,
          last_error: getErrorMessage(e),
        });
        break;
      }
    }
  } finally {
    syncing = false;
    emit();
    if (rerunRequested) {
      rerunRequested = false;
      if (typeof navigator === "undefined" || navigator.onLine) {
        void processQueue();
      }
    }
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
  const { data: { user: currentUser }, error: sessionError } = await supabase.auth.getUser();
  if (sessionError || !currentUser || currentUser.id !== toUserId) {
    throw new Error("Session active du compte cible requise pour rattacher les brouillons");
  }
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


// Remove a queued operation only when the user explicitly discards it in Sync Center.
export async function discardQueuedOp(id: number) {
  await db.queue.delete(id);
  emit();
}

/** Apply the user's field-by-field choice after verifying ownership of the dossier. */
export async function resolveConflict(conflictId: number, values: DossierChanges) {
  const conflict = await db.conflicts.get(conflictId);
  if (!conflict) return;

  const { data: { user: currentUser }, error: sessionError } = await supabase.auth.getUser();
  if (sessionError || !currentUser) throw new Error("Session requise pour résoudre ce conflit");

  const { error: lookupError } = await supabase
    .from("dossiers")
    .select("id")
    .eq("id", conflict.dossier_id)
    .eq("user_id", currentUser.id)
    .single();
  if (lookupError) throw lookupError;

  const { error } = await supabase
    .from("dossiers")
    .update(values)
    .eq("id", conflict.dossier_id)
    .eq("user_id", currentUser.id);
  if (error) throw error;
  await db.conflicts.delete(conflictId);
  emit();
}
