import Dexie, { Table } from "dexie";

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
  synced: 0 | 1; // Dexie indexes booleans poorly; use 0/1
  remote_id?: string | null;
}

export interface QueuedOp {
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
  queue!: Table<QueuedOp, number>;
  cachedDossiers!: Table<CachedDossier, string>;

  constructor() {
    super("memoire-offline");
    this.version(1).stores({
      drafts: "++id, localId, user_id, synced, updated_at",
      queue: "++id, kind, created_at",
      cachedDossiers: "id, user_id, cached_at",
    });
  }
}

export const db = new MemoireDB();
