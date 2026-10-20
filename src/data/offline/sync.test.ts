import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const queued = new Map<number, unknown>();
  return {
    queued,
    orderByToArray: vi.fn(async () => [...queued.values()].sort((a, b) => a.created_at - b.created_at)),
    queueWhereToArray: vi.fn(async () => [...queued.values()].filter((op) => op.kind === "update_dossier")),
    queueUpdate: vi.fn(async (id: number, patch: unknown) => {
      const current = queued.get(id);
      if (current) queued.set(id, { ...current, ...patch });
    }),
    queueDelete: vi.fn(async (id: number) => { queued.delete(id); }),
    queueAdd: vi.fn(async (op: unknown) => {
      const id = Math.max(0, ...queued.keys()) + 1;
      queued.set(id, { ...op, id });
      return id;
    }),
    queueGet: vi.fn(async (id: number) => queued.get(id)),
    conflictAdd: vi.fn(async (conflict: unknown) => conflict),
    storageUpload: vi.fn(),
    proofUpsert: vi.fn(),
    supabaseFrom: vi.fn(),
  };
});

vi.mock("@/data/offline/db", () => ({
  db: {
    queue: {
      orderBy: vi.fn(() => ({ toArray: mocks.orderByToArray })),
      where: vi.fn(() => ({ equals: vi.fn(() => ({ toArray: mocks.queueWhereToArray })) })),
      update: mocks.queueUpdate,
      delete: mocks.queueDelete,
      add: mocks.queueAdd,
      get: mocks.queueGet,
    },
    conflicts: { add: mocks.conflictAdd },
    drafts: {
      where: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getUser: vi.fn(async () => ({ data: { user: { id: "user-1" } }, error: null })) },
    storage: { from: vi.fn(() => ({ upload: mocks.storageUpload })) },
    from: mocks.supabaseFrom,
  },
}));

vi.mock("@/data/procedures.repo", () => ({
  initializeDossierJourney: vi.fn(),
}));

import { enqueueUpdateDossierMetadata, processQueue } from "@/data/offline/sync";

describe("offline Terrain section updates", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.queued.clear();
    Object.defineProperty(navigator, "onLine", { configurable: true, value: false });
  });

  it("merges separate section edits into one queued update instead of losing the first", async () => {
    await enqueueUpdateDossierMetadata("dossier-1", {
      terrain: { version: 1, sections: { histoire: "Historique familial" } },
    });
    await enqueueUpdateDossierMetadata("dossier-1", {
      terrain: { version: 1, sections: { provenance: "Acte ancien" } },
    });

    const pending = [...mocks.queued.values()].filter((op) => op.kind === "update_dossier");
    expect(pending).toHaveLength(1);
    expect(pending[0].payload.metadata.terrain.sections).toEqual({
      histoire: "Historique familial",
      provenance: "Acte ancien",
    });
  });
});

describe("sync queue concurrency", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.queued.clear();
    Object.defineProperty(navigator, "onLine", { configurable: true, value: false });
  });

  it("replays a section edit queued while an earlier sync request is in flight", async () => {
    let releaseFirstRead!: (value: unknown) => void;
    let signalFirstRead!: () => void;
    const firstReadStarted = new Promise<void>((resolve) => { signalFirstRead = resolve; });
    const firstRead = new Promise<unknown>((resolve) => { releaseFirstRead = resolve; });
    let readCount = 0;
    const updatePayloads: unknown[] = [];

    mocks.supabaseFrom.mockImplementation(() => ({
      select: vi.fn(() => {
        const query: unknown = {
          eq: vi.fn(() => query),
          single: vi.fn(() => {
            readCount += 1;
            if (readCount === 1) {
              signalFirstRead();
              return firstRead;
            }
            return Promise.resolve({
              data: { user_id: "user-1", metadata: { terrain: { sections: {} }, dossierNote: "keep" } },
              error: null,
            });
          }),
        };
        return query;
      }),
      update: vi.fn((values: unknown) => {
        const query: unknown = {
          eq: vi.fn(() => {
            if (query.eq.mock.calls.length === 1) return query;
            updatePayloads.push(values.metadata);
            return Promise.resolve({ error: null });
          }),
        };
        return query;
      }),
    }));

    await enqueueUpdateDossierMetadata("dossier-1", {
      terrain: { sections: { histoire: "Historique" } },
    });
    // Prevent enqueue from starting the first pass until the mock network is ready.
    Object.defineProperty(navigator, "onLine", { configurable: true, value: true });
    const firstPass = processQueue();
    await firstReadStarted;

    await enqueueUpdateDossierMetadata("dossier-1", {
      terrain: { sections: { provenance: "Acte ancien" } },
    });

    releaseFirstRead({
      data: { user_id: "user-1", metadata: { terrain: { sections: {} }, dossierNote: "keep" } },
      error: null,
    });
    await firstPass;
    await vi.waitFor(() => {
      expect(updatePayloads).toHaveLength(2);
      expect(mocks.queued.size).toBe(0);
    });

    expect(updatePayloads[1]).toEqual(expect.objectContaining({
      dossierNote: "keep",
      terrain: {
        sections: {
          histoire: "Historique",
          provenance: "Acte ancien",
        },
      },
    }));
    expect(mocks.queued.size).toBe(0);
  });
});

describe("proof upload queue retry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.queued.clear();
    Object.defineProperty(navigator, "onLine", { configurable: true, value: true });
    mocks.storageUpload.mockResolvedValue({ error: null });
    mocks.proofUpsert.mockResolvedValue({ error: null });
    mocks.supabaseFrom.mockImplementation((table: string) => {
      if (table === "dossiers") {
        const query: unknown = {
          eq: vi.fn(() => query),
          single: vi.fn().mockResolvedValue({ data: { id: "dossier-1", user_id: "user-1" }, error: null }),
        };
        return { select: vi.fn(() => query) };
      }
      return { upsert: mocks.proofUpsert };
    });
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

  it("retains a proof upload after a Storage error and retries the same path", async () => {
    const operation = {
      id: 43,
      kind: "upload_proof",
      created_at: 102,
      attempts: 0,
      payload: {
        file: new Blob(["proof"], { type: "application/pdf" }),
        fileName: "preuve.pdf",
        mimeType: "application/pdf",
        sizeBytes: 5,
        dossierId: "dossier-1",
        userId: "user-1",
        sectionKey: "documentation",
        storagePath: "user-1/dossier-1/proof-storage-retry.pdf",
      },
    };
    mocks.queued.set(operation.id, operation);
    mocks.storageUpload.mockResolvedValueOnce({ error: new Error("temporary Storage failure") });

    await processQueue();

    expect(mocks.queued.get(operation.id)?.attempts).toBe(1);
    expect(mocks.queued.get(operation.id)?.last_error).toContain("temporary Storage failure");
    expect(mocks.queued.get(operation.id)?.payload.storagePath).toBe(operation.payload.storagePath);
    expect(mocks.proofUpsert).not.toHaveBeenCalled();
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
      expect.objectContaining({ storage_path: operation.payload.storagePath }),
      { onConflict: "storage_path" },
    );
    expect(mocks.queued.has(operation.id)).toBe(false);
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


describe("Terrain section persistence after offline replay", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.queued.clear();
    Object.defineProperty(navigator, "onLine", { configurable: true, value: false });
  });

  it("writes all nine saved sections while preserving unrelated server metadata", async () => {
    const sections = {
      histoire: "Historique familial",
      provenance: "Acte de provenance",
      proprietaires: "Deux propriétaires déclarés",
      ayantsDroit: "Ayants droit recensés",
      documentation: "Titre foncier",
      localisation: "Village et repères",
      dimensions: "Surface mesurée",
      etat: "Terrain cultivé",
      miseEnValeur: "Plantations existantes",
    };
    const updates: unknown[] = [];

    mocks.supabaseFrom.mockImplementation(() => ({
      select: vi.fn(() => {
        const query: unknown = {
          eq: vi.fn(() => query),
          single: vi.fn().mockResolvedValue({
            data: {
              user_id: "user-1",
              metadata: {
                dossierNote: "ne pas écraser",
                terrain: { sections: { histoire: "Ancienne valeur", champServeur: "conserver" } },
              },
            },
            error: null,
          }),
        };
        return query;
      }),
      update: vi.fn((values: unknown) => {
        const query: unknown = {
          eq: vi.fn(() => {
            if (query.eq.mock.calls.length === 1) return query;
            updates.push(values.metadata);
            return Promise.resolve({ error: null });
          }),
        };
        return query;
      }),
    }));

    await enqueueUpdateDossierMetadata("dossier-1", {
      terrain: { version: 1, sections },
    });
    Object.defineProperty(navigator, "onLine", { configurable: true, value: true });
    await processQueue();

    expect(updates).toHaveLength(1);
    expect(updates[0]).toEqual({
      dossierNote: "ne pas écraser",
      terrain: {
        sections: { ...sections, champServeur: "conserver" },
        version: 1,
      },
    });
    expect(mocks.queued.size).toBe(0);
  });
});


describe("offline field conflict detection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.queued.clear();
    Object.defineProperty(navigator, "onLine", { configurable: true, value: true });
  });

  it("persists an overlapping edit for Sync Center instead of overwriting the server", async () => {
    mocks.queued.set(51, {
      id: 51,
      kind: "update_dossier",
      created_at: 100,
      attempts: 0,
      payload: {
        dossierId: "dossier-1",
        changes: { title: "Titre local" },
        baseUpdatedAt: "2026-01-01T00:00:00Z",
      },
    });
    const update = vi.fn();
    const query: unknown = {
      eq: vi.fn(() => query),
      single: vi.fn().mockResolvedValue({
        data: {
          id: "dossier-1",
          user_id: "user-1",
          title: "Titre serveur",
          description: null,
          location_name: null,
          updated_at: "2026-01-02T00:00:00Z",
        },
        error: null,
      }),
    };
    mocks.supabaseFrom.mockImplementation(() => ({
      select: vi.fn(() => query),
      update,
    }));

    await processQueue();

    expect(mocks.conflictAdd).toHaveBeenCalledWith(expect.objectContaining({
      dossier_id: "dossier-1",
      fields: ["title"],
      mine: { title: "Titre local" },
      theirs: { title: "Titre serveur" },
    }));
    expect(update).not.toHaveBeenCalled();
    expect(mocks.queued.has(51)).toBe(false);
  });
});
