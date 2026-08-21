import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/data/offline/db";
import { onSyncChange, processQueue } from "@/data/offline/sync";

export function usePendingSync() {
  const pending = useLiveQuery(() => db.queue.count(), [], 0);
  const [, force] = useState(0);
  useEffect(() => {
    const off = onSyncChange(() => force((v) => v + 1));
    return () => { off; };
  }, []);
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
