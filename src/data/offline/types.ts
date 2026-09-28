export type SyncStatus =
  | "LOCAL_DRAFT"
  | "PENDING_SYNC"
  | "SYNCING"
  | "SYNCED"
  | "SYNC_FAILED"
  | "SYNC_CONFLICT"
  | "DEAD_LETTER"
  | "CANCELLED";

export type SyncResult =
  | "SYNCED"
  | "RETRY_LATER"
  | "CONFLICT"
  | "REJECTED_AUTH"
  | "REJECTED_STATE"
  | "REVIEW_REQUIRED"
  | "PERMANENT_FAILURE";

export type OfflineCommandName =
  | "CREATE_DOSSIER"
  | "CREATE_BIEN"
  | "ADD_PARTICIPANT"
  | "REVOKE_PARTICIPANT"
  | "CREATE_INTERVENTION"
  | "SEND_TEXT_MESSAGE"
  | "CREATE_SIGNALEMENT"
  | "UPDATE_USAGE_PREFERENCES"
  | "UPLOAD_DOCUMENT";

export interface LocalOperation {
  operation_id: string;
  principal_id: string;
  target_domain: string;
  command_name: OfflineCommandName;
  command_version: number;
  aggregate_id?: string | null;
  payload: Record<string, unknown>;
  base_version?: number | null;
  idempotency_key: string;
  dependency_operation_ids: string[];
  created_at: number;
  updated_at: number;
  status: SyncStatus;
  retry_count: number;
  next_retry_at: number;
  last_error_code?: string | null;
  last_error_message?: string | null;
  locked_at?: number | null;
  completed_at?: number | null;
  server_result?: Record<string, unknown> | null;
}

export interface PendingUpload {
  upload_id: string;
  principal_id: string;
  operation_id: string;
  blob: Blob;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  checksum?: string | null;
  created_at: number;
}

export interface SyncMetadata {
  principal_id: string;
  last_started_at?: number | null;
  last_completed_at?: number | null;
  last_error_code?: string | null;
}
