import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const queued = new Map<number, any>();
  return {
    queued,
    orderByToArray: vi.fn(async () => [...queued.values()].sort((a, b) => a.created_at - b.created_at)),
    queueUpdate: vi.fn(async (id: number, patch: any) => {
      const current = queued.get(id);
      if (current) queued.set(id, { ...current, ...patch });
    }),
    queueDelete: vi.fn(async (id: number) => { queued.delete(id); }),
    queueAdd: vi.fn(async (op: any) => {
      const id = Math.max(0, ...queued.keys()) + 1;
      queued.set(id, { ...op, id });
      return id;
    }),
    queueGet: vi.fn(async (id: number) => queued.get(id)),
    storageUpload: vi.fn(),
    proofUpsert: vi.fn(),
    supabaseFrom: vi.fn(),
  };
});

vi.mock("@/data/offline/db", () => ({
  db: {
    queue: {
      orderBy: vi.fn(() => ({ toArray: mocks.orderByToArray })),
      update: mocks.queueUpdate,
      delete: mocks.queueDelete,
      add: mocks.queueAdd,
      get: mocks.queueGet,
    },
    drafts: {
      where: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    storage: { from: vi.fn(() => ({ upload: mocks.storageUpload })) },
    from: mocks.supabaseFrom,
  },
}));

vi.mock("@/data/procedures.repo", () => ({
  initializeDossierJourney: vi.fn(),
}));

import { processQueue } from "@/data/offline/sync";

describe("proof upload queue retry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.queued.clear();
    Object.defineProperty(navigator, "onLine", { configurable: true, value: true });
    mocks.storageUpload.mockResolvedValue({ error: null });
    mocks.proofUpsert.mockResolvedValue({ error: null });
    mocks.supabaseFrom.mockReturnValue({ upsert: mocks.proofUpsert });
  });

  it("keeps a failed proof operation and retries with the same storage path", async () => {
    const operation = {
      id: 41,
      kind: "upload_proof",
      created_at: 100,
      attempts: 0,
      payload: {
        file: new Blob(["terrain proof"], { type: "application/pdf" }),
        fileName: "title-de-propriete.pdf",
        mimeType: "application/pdf",
        sizeBytes: 13,
        dossierId: "dossier-1",
        userId: "user-1",
        sectionKey: "documentation",
        storagePath: "user-1/dossier-1/queued-proof-1-title-de-propriete.pdf",
      },
    };
    mocks.queued.set(operation.id, operation);
    mocks.proofUpsert.mockResolvedValueOnce({ error: new Error("temporary database failure") });

    await processQueue();

    expect(mocks.queued.get(operation.id)?.attempts).toBe(1);
    expect(mocks.queued.get(operation.id)?.last_error).toContain("temporary database failure");
    expect(mocks.queued.get(operation.id)?.payload.storagePath).toBe(operation.payload.storagePath);
    expect(mocks.queueDelete).not.toHaveBeenCalled();

    await processQueue();

    expect(mocks.storageUpload).toHaveBeenCalledTimes(2);
    expect(mocks.storageUpload).toHaveBeenNthCalledWith(
      1,
      operation.payload.storagePath,
      operation.payload.file,
      { contentType: "application/pdf", upsert: true },
    );
    expect(mocks.storageUpload).toHaveBeenNthCalledWith(
      2,
      operation.payload.storagePath,
      operation.payload.file,
      { contentType: "application/pdf", upsert: true },
    );
    expect(mocks.proofUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        dossier_id: "dossier-1",
        uploaded_by: "user-1",
        storage_path: operation.payload.storagePath,
        metadata: { terrainSectionKey: "documentation" },
      }),
      { onConflict: "storage_path" },
    );
    expect(mocks.queued.has(operation.id)).toBe(false);
    expect(mocks.queueDelete).toHaveBeenCalledWith(operation.id);
  });

  it("does not attempt network work while offline", async () => {
    Object.defineProperty(navigator, "onLine", { configurable: true, value: false });
    mocks.queued.set(42, {
      id: 42,
      kind: "upload_proof",
      created_at: 101,
      attempts: 0,
      payload: {
        file: new Blob(["proof"]),
        fileName: "preuve.pdf",
        mimeType: "application/pdf",
        sizeBytes: 5,
        dossierId: "dossier-1",
        userId: "user-1",
        storagePath: "user-1/dossier-1/proof.pdf",
      },
    });

    await processQueue();

    expect(mocks.storageUpload).not.toHaveBeenCalled();
    expect(mocks.proofUpsert).not.toHaveBeenCalled();
    expect(mocks.queued.has(42)).toBe(true);
  });
});
