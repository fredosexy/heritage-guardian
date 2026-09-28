import type { LocalOperation, SyncResult } from "./types";

export const MAX_RETRIES = 8;
export const LOCK_TIMEOUT_MS = 2 * 60_000;

export function retryDelayMs(retryCount: number, jitter = Math.random()): number {
  const exponent = Math.min(Math.max(retryCount, 0), 8);
  const base = Math.min(1_000 * 2 ** exponent, 5 * 60_000);
  return Math.round(base * (0.75 + Math.max(0, Math.min(jitter, 1)) * 0.5));
}

export function classifySyncError(error: unknown): { result: SyncResult; code: string } {
  const candidate = error as { code?: string; message?: string; status?: number };
  const code = candidate?.code ?? String(candidate?.status ?? "SYNC_FAILED");
  const message = (candidate?.message ?? String(error)).toLowerCase();

  if (code === "409" || code === "23505" || message.includes("conflict") || message.includes("version")) {
    return { result: "CONFLICT", code };
  }
  if (code === "401" || code === "403" || code === "42501" || message.includes("forbidden") || message.includes("permission")) {
    return { result: "REJECTED_AUTH", code };
  }
  if (code === "400" || code === "404" || code === "22023" || code === "P0002" || message.includes("archiv")) {
    return { result: "REJECTED_STATE", code };
  }
  if (message.includes("review_required")) return { result: "REVIEW_REQUIRED", code };
  if (message.includes("network") || message.includes("fetch") || code === "408" || code === "429" || /^5\d\d$/.test(code)) {
    return { result: "RETRY_LATER", code };
  }
  return { result: "PERMANENT_FAILURE", code };
}

export function orderReadyOperations(operations: LocalOperation[], now = Date.now()): LocalOperation[] {
  const completed = new Set(
    operations.filter((operation) => operation.status === "SYNCED").map((operation) => operation.operation_id),
  );
  const pending = operations.filter(
    (operation) =>
      ["PENDING_SYNC", "SYNC_FAILED"].includes(operation.status) &&
      operation.next_retry_at <= now &&
      operation.dependency_operation_ids.every((dependency) => completed.has(dependency)),
  );
  return pending.sort((a, b) => a.created_at - b.created_at);
}

export function hasUnresolvedDependency(operation: LocalOperation, operations: LocalOperation[]): boolean {
  const known = new Map(operations.map((item) => [item.operation_id, item.status]));
  return operation.dependency_operation_ids.some((dependency) => {
    const status = known.get(dependency);
    return !status || ["SYNC_CONFLICT", "DEAD_LETTER", "CANCELLED"].includes(status);
  });
}
