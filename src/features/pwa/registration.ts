type UpdateWorker = (reloadPage?: boolean) => Promise<void>;
export type PwaRuntimeStatus = "update" | "offline-ready" | "error";

let updateWorker: UpdateWorker | null = null;
let runtimeStatus: PwaRuntimeStatus | null = null;
const statusListeners = new Set<(status: PwaRuntimeStatus) => void>();

export function setPwaUpdateWorker(worker: UpdateWorker) {
  updateWorker = worker;
}

export function publishPwaStatus(status: PwaRuntimeStatus) {
  runtimeStatus = status;
  statusListeners.forEach((listener) => listener(status));
}

export function subscribePwaStatus(listener: (status: PwaRuntimeStatus) => void) {
  statusListeners.add(listener);
  if (runtimeStatus) listener(runtimeStatus);
  return () => { statusListeners.delete(listener); };
}

export async function applyPwaUpdate(): Promise<void> {
  if (!updateWorker) throw new Error("PWA update is not ready");
  await updateWorker(true);
}
