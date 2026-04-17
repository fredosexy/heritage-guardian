import { supabase } from "@/integrations/supabase/client";
import { db, DraftDossier } from "./db";

let syncing = false;
const listeners = new Set<() => void>();

export function onSyncChange(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
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
            .insert({
              user_id: draft.user_id,
              type: draft.type as any,
              title: draft.title,
              description: draft.description || null,
              location_name: draft.location_name || null,
              latitude: draft.latitude ?? null,
              longitude: draft.longitude ?? null,
              status: "incomplete",
            })
            .select()
            .single();
          if (error) throw error;
          await db.drafts.update(draft.id!, { synced: 1, remote_id: data.id });
          await db.queue.delete(op.id!);
          emit();
        } else {
          // Other kinds not implemented yet — drop
          await db.queue.delete(op.id!);
        }
      } catch (e: any) {
        await db.queue.update(op.id!, {
          attempts: (op.attempts || 0) + 1,
          last_error: e?.message || String(e),
        });
        // Stop loop on first failure to retry later
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
