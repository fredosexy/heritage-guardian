import { useEffect, useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/data/offline/db";
import { onSyncChange, processQueue } from "@/data/offline/sync";
import { useAuth } from "@/features/identity";

export function useSyncOperations() {
  const { user } = useAuth();
  return useLiveQuery(
    () => user ? db.operations.where("principal_id").equals(user.id).reverse().sortBy("created_at") : [],
    [user?.id],
    [],
  );
}

export function usePendingSync() {
  const operations = useSyncOperations();
  return operations.filter((operation) => !["SYNCED", "CANCELLED"].includes(operation.status)).length;
}

export function useSyncSummary() {
  const operations = useSyncOperations();
  return useMemo(() => ({
    pending: operations.filter((operation) => ["PENDING_SYNC", "SYNCING", "SYNC_FAILED"].includes(operation.status)).length,
    conflicts: operations.filter((operation) => operation.status === "SYNC_CONFLICT").length,
    deadLetters: operations.filter((operation) => operation.status === "DEAD_LETTER").length,
    syncing: operations.some((operation) => operation.status === "SYNCING"),
  }), [operations]);
}

export function useUnsyncedDrafts(userId?: string) {
  return useLiveQuery(
    async () => userId ? db.drafts.where("[user_id+synced]").equals([userId, 0]).toArray() : [],
    [userId],
    [],
  );
}

export function useTriggerSync() {
  const { user } = useAuth();
  const [, force] = useState(0);
  useEffect(() => onSyncChange(() => force((value) => value + 1)), []);
  return () => processQueue(user?.id);
}
