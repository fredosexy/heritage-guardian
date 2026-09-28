import Dexie, { type Table } from "dexie";
import type { LocalOperation, PendingUpload, SyncMetadata } from "./types";

export interface DraftDossier {
  id?: number;
  localId: string;
  user_id: string;
  bien_id: string;
  type: string;
  title: string;
  description?: string | null;
  visibility: "prive" | "public";
  created_at: number;
  updated_at: number;
  synced: 0 | 1;
  remote_id?: string | null;
}

export interface LegacyQueuedOp {
  id?: number;
  kind: "create_dossier" | "update_dossier" | "delete_dossier";
  payload: { localId: string };
  created_at: number;
  attempts: number;
  last_error?: string | null;
}

export interface CachedDossier {
  id: string;
  user_id: string;
  data: unknown;
  cached_at: number;
}

class MemoireDB extends Dexie {
  drafts!: Table<DraftDossier, number>;
  queue!: Table<LegacyQueuedOp, number>;
  cachedDossiers!: Table<CachedDossier, [string, string]>;
  operations!: Table<LocalOperation, string>;
  uploads!: Table<PendingUpload, string>;
  syncMetadata!: Table<SyncMetadata, string>;

  constructor() {
    super("memoire-offline");
    this.version(1).stores({
      drafts: "++id, localId, user_id, synced, updated_at",
      queue: "++id, kind, created_at",
      cachedDossiers: "id, user_id, cached_at",
    });
    this.version(2).stores({
      drafts: "++id, &localId, user_id, [user_id+synced], updated_at",
      queue: "++id, kind, created_at",
      cachedDossiers: "[user_id+id], user_id, cached_at",
      operations: "&operation_id, principal_id, [principal_id+status], [principal_id+next_retry_at], created_at",
      uploads: "&upload_id, principal_id, operation_id, created_at",
      syncMetadata: "&principal_id",
    });
  }
}

export const db = new MemoireDB();
