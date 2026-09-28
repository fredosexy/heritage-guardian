import { supabase } from "@/integrations/supabase/client";
import { db, type DraftDossier } from "./db";
import { classifySyncError, hasUnresolvedDependency, LOCK_TIMEOUT_MS, MAX_RETRIES, orderReadyOperations, retryDelayMs } from "./sync-engine";
import type { LocalOperation, OfflineCommandName, SyncStatus } from "./types";

let syncingPrincipal: string | null = null;
let activePrincipal: string | null = null;
let listenersInitialized = false;
const listeners = new Set<() => void>();

const uuid = () => crypto.randomUUID();

export function onSyncChange(callback: () => void) {
  listeners.add(callback);
  return () => { listeners.delete(callback); };
}

function emit() {
  listeners.forEach((listener) => listener());
}

async function authenticatedPrincipal(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export async function setActiveSyncPrincipal(principalId: string | null): Promise<void> {
  const previous = activePrincipal;
  activePrincipal = principalId;
  if (previous && previous !== principalId) {
    const locked = await db.operations.where("[principal_id+status]").equals([previous, "SYNCING"]).toArray();
    await Promise.all(locked.map((operation) => db.operations.update(operation.operation_id, {
      status: "PENDING_SYNC",
      locked_at: null,
      updated_at: Date.now(),
    })));
  }
  emit();
  if (principalId && (typeof navigator === "undefined" || navigator.onLine)) void processQueue(principalId);
}

export interface EnqueueOperationInput {
  principalId?: string;
  targetDomain: string;
  commandName: OfflineCommandName;
  aggregateId?: string | null;
  payload: Record<string, unknown>;
  baseVersion?: number | null;
  dependencyOperationIds?: string[];
  operationId?: string;
}

export async function enqueueOperation(input: EnqueueOperationInput): Promise<string> {
  const principalId = input.principalId ?? await authenticatedPrincipal();
  if (!principalId) throw new Error("offline_sync_authentication_required");
  const now = Date.now();
  const operationId = input.operationId ?? uuid();
  const operation: LocalOperation = {
    operation_id: operationId,
    principal_id: principalId,
    target_domain: input.targetDomain,
    command_name: input.commandName,
    command_version: 1,
    aggregate_id: input.aggregateId ?? null,
    payload: input.payload,
    base_version: input.baseVersion ?? null,
    idempotency_key: operationId,
    dependency_operation_ids: input.dependencyOperationIds ?? [],
    created_at: now,
    updated_at: now,
    status: "PENDING_SYNC",
    retry_count: 0,
    next_retry_at: now,
    locked_at: null,
  };
  await db.operations.add(operation);
  emit();
  if (typeof navigator === "undefined" || navigator.onLine) void processQueue(principalId);
  return operationId;
}

export async function enqueueCreateDossier(
  draft: Omit<DraftDossier, "id" | "synced" | "created_at" | "updated_at"> & { localId: string },
): Promise<string> {
  const now = Date.now();
  await db.drafts.put({ ...draft, created_at: now, updated_at: now, synced: 0 });
  return enqueueOperation({
    principalId: draft.user_id,
    operationId: draft.localId.replace(/^local-/, "").padEnd(36, "0").slice(0, 36).match(/^[0-9a-f-]{36}$/i)
      ? draft.localId.replace(/^local-/, "")
      : uuid(),
    targetDomain: "DOSSIER",
    commandName: "CREATE_DOSSIER",
    payload: {
      local_id: draft.localId,
      bien_id: draft.bien_id,
      type: draft.type,
      title: draft.title,
      description: draft.description ?? null,
      visibility: draft.visibility,
      include_bien_holders: true,
    },
  });
}

async function migrateLegacyQueue(principalId: string): Promise<void> {
  const legacy = await db.queue.orderBy("created_at").toArray();
  for (const item of legacy) {
    const draft = await db.drafts.where("localId").equals(item.payload.localId).first();
    const operationId = uuid();
    if (item.kind === "create_dossier" && draft?.user_id === principalId) {
      await enqueueOperation({
        principalId,
        operationId,
        targetDomain: "DOSSIER",
        commandName: "CREATE_DOSSIER",
        payload: {
          local_id: draft.localId,
          bien_id: draft.bien_id,
          type: draft.type,
          title: draft.title,
          description: draft.description ?? null,
          visibility: draft.visibility,
          include_bien_holders: true,
        },
      });
    } else if (!draft || draft.user_id === principalId) {
      const now = Date.now();
      await db.operations.add({
        operation_id: operationId,
        principal_id: principalId,
        target_domain: "DOSSIER",
        command_name: "CREATE_DOSSIER",
        command_version: 1,
        aggregate_id: null,
        payload: { legacy_kind: item.kind, local_id: item.payload.localId },
        base_version: null,
        idempotency_key: operationId,
        dependency_operation_ids: [],
        created_at: item.created_at,
        updated_at: now,
        status: "DEAD_LETTER",
        retry_count: item.attempts,
        next_retry_at: now,
        last_error_code: "LEGACY_OPERATION_INCOMPLETE",
        last_error_message: item.last_error ?? "Legacy operation requires review",
      });
    } else {
      continue;
    }
    if (item.id) await db.queue.delete(item.id);
  }
}

async function executeOperation(operation: LocalOperation): Promise<Record<string, unknown>> {
  if (operation.command_name === "REGISTER_DOCUMENT") {
    const uploadId = String(operation.payload.upload_id ?? "");
    const upload = await db.uploads.get(uploadId);
    if (!upload || upload.principal_id !== operation.principal_id) throw new Error("offline_upload_missing");
    const storagePath = String(operation.payload.storage_path);
    const { error: uploadError } = await supabase.storage
      .from("dossier-proofs")
      .upload(storagePath, upload.blob, { contentType: upload.mime_type, upsert: false });
    if (uploadError && !uploadError.message.toLowerCase().includes("already exists")) throw uploadError;
  }

  const { data, error } = await supabase.rpc(
    "execute_offline_command" as never,
    {
      p_operation_id: operation.operation_id,
      p_command_name: operation.command_name,
      p_command_version: operation.command_version,
      p_payload: operation.payload,
    } as never,
  ) as unknown as { data: Record<string, unknown> | null; error: { code?: string; message: string; status?: number } | null };

  if (error) throw error;
  if (operation.command_name === "REGISTER_DOCUMENT") {
    const uploadId = String(operation.payload.upload_id ?? "");
    await db.uploads.delete(uploadId);
  }
  return data ?? {};
}

async function lockOperation(operation: LocalOperation): Promise<boolean> {
  return db.transaction("rw", db.operations, async () => {
    const current = await db.operations.get(operation.operation_id);
    if (!current || !["PENDING_SYNC", "SYNC_FAILED"].includes(current.status)) return false;
    await db.operations.update(operation.operation_id, {
      status: "SYNCING",
      locked_at: Date.now(),
      updated_at: Date.now(),
    });
    return true;
  });
}

async function recordFailure(operation: LocalOperation, error: unknown): Promise<void> {
  const classified = classifySyncError(error);
  const retryCount = operation.retry_count + 1;
  let status: SyncStatus;
  if (classified.result === "RETRY_LATER" && retryCount < MAX_RETRIES) status = "SYNC_FAILED";
  else if (["CONFLICT", "REJECTED_AUTH", "REJECTED_STATE", "REVIEW_REQUIRED"].includes(classified.result)) status = "SYNC_CONFLICT";
  else status = "DEAD_LETTER";

  await db.operations.update(operation.operation_id, {
    status,
    retry_count: retryCount,
    next_retry_at: status === "SYNC_FAILED" ? Date.now() + retryDelayMs(retryCount) : Number.MAX_SAFE_INTEGER,
    last_error_code: classified.code,
    last_error_message: error instanceof Error ? error.message : String((error as { message?: string })?.message ?? error),
    locked_at: null,
    updated_at: Date.now(),
  });
}

export async function processQueue(requestedPrincipal?: string): Promise<void> {
  if (typeof navigator !== "undefined" && !navigator.onLine) return;
  const principalId = requestedPrincipal ?? activePrincipal ?? await authenticatedPrincipal();
  if (!principalId || syncingPrincipal) return;
  const authenticated = await authenticatedPrincipal();
  if (authenticated !== principalId) return;

  syncingPrincipal = principalId;
  await db.syncMetadata.put({ principal_id: principalId, last_started_at: Date.now() });
  try {
    await migrateLegacyQueue(principalId);
    const staleBefore = Date.now() - LOCK_TIMEOUT_MS;
    const stale = await db.operations.where("[principal_id+status]").equals([principalId, "SYNCING"]).toArray();
    await Promise.all(stale.filter((item) => (item.locked_at ?? 0) < staleBefore).map((item) =>
      db.operations.update(item.operation_id, { status: "PENDING_SYNC", locked_at: null, updated_at: Date.now() }),
    ));

    let progressed = true;
    while (progressed) {
      progressed = false;
      const operations = await db.operations.where("principal_id").equals(principalId).toArray();
      for (const operation of operations.filter((item) => hasUnresolvedDependency(item, operations))) {
        if (["PENDING_SYNC", "SYNC_FAILED"].includes(operation.status)) {
          await db.operations.update(operation.operation_id, {
            status: "SYNC_CONFLICT",
            last_error_code: "DEPENDENCY_UNRESOLVED",
            last_error_message: "A required offline operation did not complete.",
            updated_at: Date.now(),
          });
        }
      }
      const ready = orderReadyOperations(operations);
      for (const operation of ready) {
        if (!await lockOperation(operation)) continue;
        progressed = true;
        try {
          const result = await executeOperation(operation);
          await db.operations.update(operation.operation_id, {
            status: "SYNCED",
            server_result: result,
            completed_at: Date.now(),
            locked_at: null,
            last_error_code: null,
            last_error_message: null,
            updated_at: Date.now(),
          });
          const localId = operation.payload.local_id;
          if (operation.command_name === "CREATE_DOSSIER" && typeof localId === "string") {
            const draft = await db.drafts.where("localId").equals(localId).first();
            if (draft?.id) await db.drafts.update(draft.id, {
              synced: 1,
              remote_id: typeof result.id === "string" ? result.id : null,
              updated_at: Date.now(),
            });
          }
        } catch (error) {
          await recordFailure(operation, error);
          break;
        }
        emit();
      }
    }
    await db.syncMetadata.update(principalId, { last_completed_at: Date.now(), last_error_code: null });
  } finally {
    syncingPrincipal = null;
    emit();
  }
}

export function initSyncListeners() {
  if (typeof window === "undefined" || listenersInitialized) return;
  listenersInitialized = true;
  window.addEventListener("online", () => void processQueue());
  if (navigator.onLine) void processQueue();
}

export async function retryOperation(operationId: string): Promise<void> {
  const operation = await db.operations.get(operationId);
  const principal = activePrincipal ?? await authenticatedPrincipal();
  if (!operation || operation.principal_id !== principal) throw new Error("offline_operation_forbidden");
  await db.operations.update(operationId, {
    status: "PENDING_SYNC",
    retry_count: 0,
    next_retry_at: Date.now(),
    last_error_code: null,
    last_error_message: null,
    locked_at: null,
    updated_at: Date.now(),
  });
  emit();
  void processQueue(principal);
}

export async function cancelOperation(operationId: string): Promise<void> {
  const operation = await db.operations.get(operationId);
  const principal = activePrincipal ?? await authenticatedPrincipal();
  if (!operation || operation.principal_id !== principal || operation.status === "SYNCED") {
    throw new Error("offline_operation_forbidden");
  }
  await db.operations.update(operationId, { status: "CANCELLED", updated_at: Date.now(), locked_at: null });
  emit();
}

export async function getPendingCount(principalId?: string): Promise<number> {
  const principal = principalId ?? activePrincipal ?? await authenticatedPrincipal();
  if (!principal) return 0;
  const operations = await db.operations.where("principal_id").equals(principal).toArray();
  return operations.filter((operation) => !["SYNCED", "CANCELLED"].includes(operation.status)).length;
}

export async function saveLocalDraft(
  draft: Omit<DraftDossier, "id" | "synced" | "created_at" | "updated_at"> & { localId: string },
): Promise<void> {
  const now = Date.now();
  await db.drafts.put({ ...draft, created_at: now, updated_at: now, synced: 0 });
  emit();
}

export async function listLocalDrafts(userId: string): Promise<DraftDossier[]> {
  return db.drafts.where("[user_id+synced]").equals([userId, 0]).reverse().sortBy("updated_at");
}

export async function deleteLocalDraft(localId: string): Promise<void> {
  const draft = await db.drafts.where("localId").equals(localId).first();
  if (draft?.id) await db.drafts.delete(draft.id);
  emit();
}

export async function claimLocalDrafts(fromUserId: string, toUserId: string): Promise<number> {
  if (!fromUserId || fromUserId === toUserId) return 0;
  const drafts = await db.drafts.where("[user_id+synced]").equals([fromUserId, 0]).toArray();
  for (const draft of drafts) {
    await db.drafts.update(draft.id!, { user_id: toUserId, updated_at: Date.now() });
    await enqueueOperation({
      principalId: toUserId,
      targetDomain: "DOSSIER",
      commandName: "CREATE_DOSSIER",
      payload: {
        local_id: draft.localId,
        bien_id: draft.bien_id,
        type: draft.type,
        title: draft.title,
        description: draft.description ?? null,
        visibility: draft.visibility,
        include_bien_holders: true,
      },
    });
  }
  emit();
  return drafts.length;
}
