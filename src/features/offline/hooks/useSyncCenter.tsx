import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";
import { db } from "@/data/offline/db";
import { useAuth } from "@/features/identity";
import { discardQueuedOp, processQueue, resolveConflict } from "@/data/offline/sync";
import { mergeResolution, type DossierChanges, type EditableField } from "@/services/sync-conflicts";

export function useSyncCenter() {
  const { user } = useAuth();
  const userId = user?.id;
  const [retrying, setRetrying] = useState(false);
  const queue = useLiveQuery(
    () => userId ? db.queue.where("viewer_user_id").equals(userId).sortBy("created_at") : Promise.resolve([]),
    [userId],
    [],
  );
  const conflicts = useLiveQuery(
    () => userId ? db.conflicts.where("viewer_user_id").equals(userId).sortBy("created_at") : Promise.resolve([]),
    [userId],
    [],
  );

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
