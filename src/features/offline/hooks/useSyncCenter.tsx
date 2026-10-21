import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";
import { db } from "@/data/offline/db";
import { discardQueuedOp, processQueue, resolveConflict } from "@/data/offline/sync";
import { mergeResolution, type DossierChanges, type EditableField } from "@/services/sync-conflicts";

export function useSyncCenter() {
  const [retrying, setRetrying] = useState(false);
  const queue = useLiveQuery(() => db.queue.orderBy("created_at").toArray(), [], []);
  const conflicts = useLiveQuery(() => db.conflicts.orderBy("created_at").toArray(), [], []);

  const resolve = (id: number, mine: DossierChanges, theirs: DossierChanges, choice: Partial<Record<EditableField, "mine" | "theirs">>) =>
    resolveConflict(id, mergeResolution(mine, theirs, choice));

  const retry = async () => {
    if (retrying) return;
    setRetrying(true);
    try { await processQueue(); }
    finally { setRetrying(false); }
  };

  return { queue: queue ?? [], conflicts: conflicts ?? [], retry, retrying, discard: discardQueuedOp, resolve };
}
