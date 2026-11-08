type UpdateWorker = (reloadPage?: boolean) => Promise<void>;

let updateWorker: UpdateWorker | null = null;

export function setPwaUpdateWorker(worker: UpdateWorker) {
  updateWorker = worker;
}

export async function applyPwaUpdate(): Promise<void> {
  if (!updateWorker) throw new Error("PWA update is not ready");
  await updateWorker(true);
}
