import { supabase } from "@/integrations/supabase/client";
import { db, DraftDossier } from "./db";
import type { DossierType } from "@/core/types/domain";

let syncing = false;
const listeners = new Set<() => void>();

export function onSyncChange(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}
function emit() {
  listeners.forEach((l) => l());
}

export async function enqueueCreateDossier(draft: Omit<DraftDossier, "id" | "synced" | "created_at" | "updated_at"> & { localId: string }) {
  const now = Date.now();
  await db.drafts.add({ ...draft, created_at: now, updated_at: now, synced: 0 });
  await db.queue.add({
    kind: "create_dossier",
    payload: { localId: draft.localId },
    created_at: now,
    attempts: 0,
  });
  emit();
  // Try immediately
  void processQueue();
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
          if (!draft) {
            await db.queue.delete(op.id!);
            continue;
          }
          if (draft.synced) {
            await db.queue.delete(op.id!);
            continue;
          }
          const { data, error } = await supabase
            .from("dossiers")
            .upsert({
              client_operation_id: draft.localId,
              user_id: draft.user_id,
              type: draft.type as DossierType,
              title: draft.title,
              description: draft.description || null,
              location_name: draft.location_name || null,
              latitude: draft.latitude ?? null,
              longitude: draft.longitude ?? null,
              status: "incomplete",
            }, { onConflict: "user_id,client_operation_id" })
            .select()
            .single();
          if (error) throw error;
          await db.drafts.update(draft.id!, { synced: 1, remote_id: data.id });
          await db.queue.delete(op.id!);
          emit();
        } else {
          // Never acknowledge an operation that has not actually been applied.
          // Keeping it in the queue makes the failure visible and retryable.
          throw new Error(`Unsupported offline operation: ${op.kind}`);
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        await db.queue.update(op.id!, {
          attempts: (op.attempts || 0) + 1,
          last_error: message,
        });
        // Stop on the first failure to preserve operation ordering.
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
  // Initial attempt
  if (navigator.onLine) void processQueue();
}

export async function getPendingCount(): Promise<number> {
  return db.queue.count();
}

/** Enregistre un brouillon local sans le mettre en file (mode visiteur, pas de compte). */
export async function saveLocalDraft(
  draft: Omit<DraftDossier, "id" | "synced" | "created_at" | "updated_at"> & { localId: string }
): Promise<void> {
  const now = Date.now();
  await db.drafts.add({ ...draft, created_at: now, updated_at: now, synced: 0 });
  emit();
}

/** Brouillons locaux (non synchronisés) portés par une identité. */
export async function listLocalDrafts(userId: string): Promise<DraftDossier[]> {
  return db.drafts.where({ user_id: userId, synced: 0 }).reverse().sortBy("updated_at");
}

export async function deleteLocalDraft(localId: string): Promise<void> {
  const draft = await db.drafts.where("localId").equals(localId).first();
  if (draft?.id) await db.drafts.delete(draft.id);
  emit();
}

/**
 * Rattache les brouillons d'une identité locale à un vrai compte,
 * puis les met en file pour envoi au serveur.
 */
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
