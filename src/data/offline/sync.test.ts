import { beforeEach, describe, expect, it, vi } from "vitest";

interface TestConflict {
  id?: number;
  dossier_id: string;
  title: string;
  fields: string[];
  mine: Record<string, string | null>;
  theirs: Record<string, string | null>;
  remote_updated_at: string;
  created_at: number;
}

interface TestOp {
  id?: number;
  kind: string;
  created_at: number;
  attempts: number;
  last_error?: string | null;
  payload: {
    dossierId?: string;
    changes?: { title?: string };
    baseUpdatedAt?: string;
    metadata?: { terrain?: { sections?: Record<string, string> } };
    storagePath?: string;
    proofId?: string;
    [key: string]: unknown;
  };
}
type MockQuery = { eq: ReturnType<typeof vi.fn>; single?: ReturnType<typeof vi.fn> };

const mocks = vi.hoisted(() => {
  const queued = new Map<number, TestOp>();
  const conflicts = new Map<number, TestConflict>();
  return {
    queued,
    conflicts,
    conflictGet: vi.fn(async (id: number) => conflicts.get(id)),
    conflictUpdate: vi.fn(async (id: number, patch: Partial<TestConflict>) => {
      const current = conflicts.get(id);
      if (current) conflicts.set(id, { ...current, ...patch });
    }),
    conflictDelete: vi.fn(async (id: number) => { conflicts.delete(id); }),
    orderByToArray: vi.fn(async () => [...queued.values()].sort((a, b) => a.created_at - b.created_at)),
    queueWhereToArray: vi.fn(async () => [...queued.values()].filter((op) => op.kind === "update_dossier")),
    queueUpdate: vi.fn(async (id: number, patch: Partial<TestOp>) => {
      const current = queued.get(id);
      if (current) queued.set(id, { ...current, ...patch });
    }),
    queueDelete: vi.fn(async (id: number) => { queued.delete(id); }),
    queueAdd: vi.fn(async (op: TestOp) => {
      const id = Math.max(0, ...queued.keys()) + 1;
      queued.set(id, { ...op, id });
      return id;
    }),
    queueGet: vi.fn(async (id: number) => queued.get(id)),
    conflictAdd: vi.fn(async (conflict: unknown) => conflict),
    authGetUser: vi.fn(async () => ({ data: { user: { id: "user-1" } }, error: null })),
    storageUpload: vi.fn(),
    proofUpsert: vi.fn(),
    proofRows: new Map<string, { id: string; dossier_id: string; uploaded_by: string; metadata: { terrainSectionKey?: string } }>(),
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
    transaction: vi.fn(async (_mode, _table, callback) => callback()),
    conflicts: {
      add: mocks.conflictAdd,
      get: mocks.conflictGet,
      update: mocks.conflictUpdate,
      delete: mocks.conflictDelete,
    },
    drafts: {
      where: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getUser: mocks.authGetUser },
    storage: { from: vi.fn(() => ({ upload: mocks.storageUpload })) },
    from: mocks.supabaseFrom,
  },
}));

vi.mock("@/data/procedures.repo", () => ({
  initializeDossierJourney: vi.fn(),
}));

import { enqueueUpdateDossierMetadata, processQueue, resolveConflict } from "@/data/offline/sync";

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

  it("preserves a queued field-level edit when Terrain metadata is also edited offline", async () => {
    await mocks.queueAdd({
      kind: "update_dossier",
      payload: {
        dossierId: "dossier-1",
        changes: { title: "Titre modifié hors ligne" },
        baseUpdatedAt: "2026-10-19T10:00:00Z",
      },
      created_at: 1,
      attempts: 0,
    });

    await enqueueUpdateDossierMetadata("dossier-1", {
      terrain: { version: 1, sections: { histoire: "Historique familial" } },
    });

    const pending = [...mocks.queued.values()].filter((op) => op.kind === "update_dossier");
    expect(pending).toHaveLength(2);
    expect(pending.some((op) => op.payload.changes?.title === "Titre modifié hors ligne")).toBe(true);
    expect(pending.some((op) => op.payload.metadata?.terrain?.sections?.histoire === "Historique familial")).toBe(true);
  });
});

describe("sync queue concurrency", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.queued.clear();
    Object.defineProperty(navigator, "onLine", { configurable: true, value: false });
  });

  it("replays a section edit queued while an earlier sync request is in flight", async () => {
    let releaseFirstRead: (value: unknown) => void = () => { throw new Error("Read not initialized"); };
    let signalFirstRead: () => void = () => { throw new Error("Signal not initialized"); };
    const firstReadStarted = new Promise<void>((resolve) => { signalFirstRead = resolve; });
    const firstRead = new Promise<unknown>((resolve) => { releaseFirstRead = resolve; });
    let readCount = 0;
    const updatePayloads: unknown[] = [];

    mocks.supabaseFrom.mockImplementation(() => ({
      select: vi.fn(() => {
        const query: MockQuery = {
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
      update: vi.fn((values: { metadata: unknown }) => {
        const query: MockQuery = {
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
    mocks.proofRows.clear();
    mocks.proofUpsert.mockImplementation(async (row) => {
      mocks.proofRows.set(row.storage_path, row);
      return { error: null };
    });
    mocks.supabaseFrom.mockImplementation((table: string) => {
      if (table === "dossiers") {
        const query: MockQuery = {
          eq: vi.fn(() => query),
          single: vi.fn().mockResolvedValue({ data: { id: "dossier-1", user_id: "user-1" }, error: null }),
        };
        return { select: vi.fn(() => query) };
      }
      return {
        upsert: mocks.proofUpsert,
        select: vi.fn(() => ({ eq: vi.fn(async (_key, path) => ({ data: mocks.proofRows.has(path) ? [mocks.proofRows.get(path)] : [], error: null })) })),
      };
    });
  });

  it("keeps a failed proof operation and retries with the same storage path", async () => {
    const operation: TestOp = {
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
      { onConflict: "id", ignoreDuplicates: true },
    );
    expect(mocks.queued.has(operation.id)).toBe(false);
    expect(mocks.queueDelete).toHaveBeenCalledWith(operation.id);
  });

  it("retains a proof upload after a Storage error and retries the same path", async () => {
    const operation: TestOp = {
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
      { onConflict: "id", ignoreDuplicates: true },
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
        const query: MockQuery = {
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
      update: vi.fn((values: { metadata: unknown }) => {
        const query: MockQuery = {
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
    const query: MockQuery = {
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


describe("queued dossier deletion", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.queued.clear();
    Object.defineProperty(navigator, "onLine", { configurable: true, value: true });
    mocks.authGetUser.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
  });

  it("deletes only an owned dossier and removes the operation after success", async () => {
    const operation: TestOp = {
      id: 71,
      kind: "delete_dossier",
      created_at: 100,
      attempts: 0,
      payload: { dossierId: "dossier-1" },
    };
    mocks.queued.set(operation.id!, operation);

    const ownershipQuery: MockQuery = {
      eq: vi.fn(() => ownershipQuery),
      single: vi.fn().mockResolvedValue({
        data: { id: "dossier-1" },
        error: null,
      }),
    };
    let deleteFilters = 0;
    const deletionQuery: MockQuery = {
      eq: vi.fn(() => {
        deleteFilters += 1;
        return deleteFilters === 2 ? Promise.resolve({ error: null }) : deletionQuery;
      }),
    };
    const deleteDossier = vi.fn(() => deletionQuery);
    mocks.supabaseFrom.mockImplementation(() => ({
      select: vi.fn(() => ownershipQuery),
      delete: deleteDossier,
    }));

    await processQueue();

    expect(mocks.supabaseFrom).toHaveBeenCalledWith("dossiers");
    expect(ownershipQuery.eq).toHaveBeenNthCalledWith(1, "id", "dossier-1");
    expect(ownershipQuery.eq).toHaveBeenNthCalledWith(2, "user_id", "user-1");
    expect(deleteDossier).toHaveBeenCalledTimes(1);
    expect(deletionQuery.eq).toHaveBeenNthCalledWith(1, "id", "dossier-1");
    expect(deletionQuery.eq).toHaveBeenNthCalledWith(2, "user_id", "user-1");
    expect(mocks.queued.has(operation.id!)).toBe(false);
    expect(mocks.queueDelete).toHaveBeenCalledWith(operation.id);
  });

  it("keeps the queued deletion when the ownership check fails", async () => {
    const operation: TestOp = {
      id: 72,
      kind: "delete_dossier",
      created_at: 101,
      attempts: 0,
      payload: { dossierId: "dossier-foreign" },
    };
    mocks.queued.set(operation.id!, operation);
    const ownershipQuery: MockQuery = {
      eq: vi.fn(() => ownershipQuery),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: new Error("row not found"),
      }),
    };
    const deleteDossier = vi.fn();
    mocks.supabaseFrom.mockImplementation(() => ({
      select: vi.fn(() => ownershipQuery),
      delete: deleteDossier,
    }));

    await processQueue();

    expect(deleteDossier).not.toHaveBeenCalled();
    expect(mocks.queued.has(operation.id!)).toBe(true);
    expect(mocks.queued.get(operation.id!)?.attempts).toBe(1);
  });
});


describe("sync conflict resolution freshness", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.queued.clear();
    mocks.conflicts.clear();
    mocks.authGetUser.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
  });

  it("refreshes a conflict instead of overwriting a dossier changed since review", async () => {
    mocks.conflicts.set(9, {
      id: 9,
      dossier_id: "dossier-1",
      title: "Titre distant initial",
      fields: ["title"],
      mine: { title: "Mon titre" },
      theirs: { title: "Titre distant initial" },
      remote_updated_at: "2026-10-20T10:00:00Z",
      created_at: 100,
    });

    type ResolveQuery = MockQuery & {
      select: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      single: ReturnType<typeof vi.fn>;
    };
    const query: ResolveQuery = {
      select: vi.fn(() => query),
      update: vi.fn(() => query),
      eq: vi.fn(() => query),
      single: vi.fn().mockResolvedValue({
        data: {
          id: "dossier-1",
          user_id: "user-1",
          title: "Titre distant plus récent",
          description: null,
          location_name: null,
          updated_at: "2026-10-21T07:00:00Z",
        },
        error: null,
      }),
    };
    mocks.supabaseFrom.mockReturnValue(query);

    await expect(resolveConflict(9, { title: "Mon titre" })).rejects.toThrow(
      "Le dossier a changé depuis l'affichage du conflit"
    );

    expect(query.update).not.toHaveBeenCalled();
    expect(mocks.conflictUpdate).toHaveBeenCalledWith(9, expect.objectContaining({
      title: "Titre distant plus récent",
      fields: ["title"],
      theirs: { title: "Titre distant plus récent" },
      remote_updated_at: "2026-10-21T07:00:00Z",
    }));
    expect(mocks.conflicts.has(9)).toBe(true);
  });
});
