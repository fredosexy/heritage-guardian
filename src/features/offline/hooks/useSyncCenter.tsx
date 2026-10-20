import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/data/offline/db";
import { discardQueuedOp, processQueue, resolveConflict } from "@/data/offline/sync";
import { mergeResolution, type DossierChanges, type EditableField } from "@/services/sync-conflicts";

export function useSyncCenter() {
  const queue = useLiveQuery(() => db.queue.orderBy("created_at").toArray(), [], []);
  const conflicts = useLiveQuery(() => db.conflicts.orderBy("created_at").toArray(), [], []);

  const resolve = (id: number, mine: DossierChanges, theirs: DossierChanges, choice: Partial<Record<EditableField, "mine" | "theirs">>) =>
    resolveConflict(id, mergeResolution(mine, theirs, choice));

  return { queue: queue ?? [], conflicts: conflicts ?? [], retry: () => processQueue(), discard: discardQueuedOp, resolve };
}
