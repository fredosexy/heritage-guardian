import { classifySyncError } from "./sync-engine";
import { enqueueOperation, type EnqueueOperationInput } from "./sync";

export const isQueuedResult = (value: unknown): value is string =>
  typeof value === "string" && value.startsWith("offline:");

const isOffline = () => typeof navigator !== "undefined" && !navigator.onLine;

export async function runOrQueueId(
  operation: EnqueueOperationInput,
  runOnline: () => Promise<string>,
): Promise<string> {
  if (isOffline()) return `offline:${await enqueueOperation(operation)}`;
  try {
    return await runOnline();
  } catch (error) {
    if (classifySyncError(error).result !== "RETRY_LATER") throw error;
    return `offline:${await enqueueOperation(operation)}`;
  }
}

export async function runOrQueueVoid(
  operation: EnqueueOperationInput,
  runOnline: () => Promise<void>,
): Promise<boolean> {
  if (isOffline()) {
    await enqueueOperation(operation);
    return true;
  }
  try {
    await runOnline();
    return false;
  } catch (error) {
    if (classifySyncError(error).result !== "RETRY_LATER") throw error;
    await enqueueOperation(operation);
    return true;
  }
}
