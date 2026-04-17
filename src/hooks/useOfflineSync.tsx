import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/offline/db";
import { onSyncChange, processQueue } from "@/lib/offline/sync";

export function usePendingSync() {
  const pending = useLiveQuery(() => db.queue.count(), [], 0);
  const [, force] = useState(0);
  useEffect(() => onSyncChange(() => force((v) => v + 1)), []);
  return pending ?? 0;
}

export function useUnsyncedDrafts(userId?: string) {
  return useLiveQuery(
    async () => {
      if (!userId) return [];
      return db.drafts.where({ user_id: userId, synced: 0 }).toArray();
    },
    [userId],
    []
  );
}

export function useTriggerSync() {
  return () => processQueue();
}
