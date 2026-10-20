import Dexie, { Table } from "dexie";
import type { Database, Json } from "@/integrations/supabase/types";
import type { DossierChanges } from "@/services/sync-conflicts";

export interface DraftDossier {
  id?: number;
  localId: string;
  user_id: string;
  type: Database["public"]["Enums"]["dossier_type"] | string;
  title: string;
  description?: string | null;
  location_name?: string | null;
  metadata?: Record<string, unknown>;
  latitude?: number | null;
  longitude?: number | null;
  created_at: number;
  updated_at: number;
  synced: 0 | 1;
  remote_id?: string | null;
}

export type QueuedOp =
  | { id?: number; kind: "create_dossier"; payload: { localId: string }; created_at: number; attempts: number; last_error?: string | null }
  | { id?: number; kind: "update_dossier"; payload: { dossierId: string; changes: DossierChanges; baseUpdatedAt: string } | { dossierId: string; metadata: Record<string, unknown> }; created_at: number; attempts: number; last_error?: string | null }
  | { id?: number; kind: "initialize_journey"; payload: { dossierId: string }; created_at: number; attempts: number; last_error?: string | null }
  | { id?: number; kind: "upload_proof"; payload: { file: Blob; fileName: string; mimeType: string; sizeBytes: number; dossierId: string; userId: string; sectionKey?: string; storagePath: string }; created_at: number; attempts: number; last_error?: string | null }
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
  data: Json | Record<string, unknown>;
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
    // Keep the original v2 schema for already-installed Terrain clients.
    this.version(2).stores({
      drafts: "++id, localId, user_id, synced, updated_at",
      queue: "++id, kind, created_at",
      cachedDossiers: "id, user_id, cached_at",
    });
    // Add conflict persistence as a new version so existing v2 databases upgrade safely.
    this.version(3).stores({
      drafts: "++id, localId, user_id, synced, updated_at",
      queue: "++id, kind, created_at",
      cachedDossiers: "id, user_id, cached_at",
      conflicts: "++id, dossier_id, created_at",
    });
  }
}

export const db = new MemoireDB();
