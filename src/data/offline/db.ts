import Dexie, { Table } from "dexie";
import type { Database, Json } from "@/integrations/supabase/types";
import type { DossierChanges } from "@/services/sync-conflicts";

export interface DraftDossier {
  id?: number;
  localId: string;
  user_id: string;
  type: Database["public"]["Enums"]["dossier_type"];
  title: string;
  description?: string | null;
  location_name?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  created_at: number;
  updated_at: number;
  synced: 0 | 1; // Dexie indexes booleans poorly; use 0/1
  remote_id?: string | null;
}

export type QueuedOp =
  | { id?: number; kind: "create_dossier"; payload: { localId: string }; created_at: number; attempts: number; last_error?: string | null }
  | { id?: number; kind: "update_dossier"; payload: { dossierId: string; changes: DossierChanges; baseUpdatedAt: string }; created_at: number; attempts: number; last_error?: string | null }
  | { id?: number; kind: "delete_dossier"; payload: { dossierId: string }; created_at: number; attempts: number; last_error?: string | null };

export interface SyncConflict {
  id?: number;
  dossier_id: string;
  title: string;
  fields: string[];
  mine: Record<string, string | null>;
  theirs: Record<string, string | null>;
  remote_updated_at: string;
  created_at: number;
}

export interface CachedDossier {
  id: string;
  user_id: string;
  data: Json;
  cached_at: number;
}

class MemoireDB extends Dexie {
  drafts!: Table<DraftDossier, number>;
  queue!: Table<QueuedOp, number>;
  cachedDossiers!: Table<CachedDossier, string>;
  conflicts!: Table<SyncConflict, number>;

  constructor() {
    super("memoire-offline");
    this.version(1).stores({
      drafts: "++id, localId, user_id, synced, updated_at",
      queue: "++id, kind, created_at",
      cachedDossiers: "id, user_id, cached_at",
    });
    this.version(2).stores({
      drafts: "++id, localId, user_id, synced, updated_at",
      queue: "++id, kind, created_at",
      cachedDossiers: "id, user_id, cached_at",
      conflicts: "++id, dossier_id, created_at",
    });
  }
}

export const db = new MemoireDB();
