import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  storageRemove: vi.fn(),
  storageUpload: vi.fn(),
  proofDelete: vi.fn(),
  proofDeleteEq: vi.fn(),
  proofInsert: vi.fn(),
  proofSelect: vi.fn(),
  proofSingle: vi.fn(),
  from: vi.fn(),
  authGetUser: vi.fn(async () => ({ data: { user: { id: "user-1" } }, error: null })),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getUser: mocks.authGetUser },
    storage: {
      from: vi.fn(() => ({ remove: mocks.storageRemove, upload: mocks.storageUpload })),
    },
    from: mocks.from,
  },
}));

import { ProofPersistenceError, countProofsByDossier, deleteProof, listProofs, uploadProof } from "@/data/proofs.repo";

describe("proof persistence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.from.mockImplementation((table: string) => table === "dossiers" ? ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { id: "dossier-1", user_id: "user-1" }, error: null }) }) }) }) : ({ delete: mocks.proofDelete, insert: mocks.proofInsert }));
    mocks.proofDelete.mockReturnValue({ eq: mocks.proofDeleteEq });
    mocks.proofDeleteEq.mockResolvedValue({ error: null });
    mocks.storageUpload.mockResolvedValue({ error: null });
    mocks.proofInsert.mockReturnValue({ select: mocks.proofSelect });
    mocks.proofSelect.mockReturnValue({ single: mocks.proofSingle });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("uploads the object and persists a proof attached to the requested Terrain section", async () => {
    vi.spyOn(Date, "now").mockReturnValue(123456);
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const file = new File(["acte"], "titre.pdf", { type: "application/pdf" });
    const savedProof = {
      id: "proof-1",
      dossier_id: "dossier-1",
      storage_path: "user-1/dossier-1/123456-i-titre.pdf",
      metadata: { terrainSectionKey: "documentation" },
    };
    mocks.from.mockReturnValueOnce({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { id: "dossier-1", user_id: "user-1" }, error: null }) }) }) });
    mocks.from.mockReturnValueOnce({ insert: mocks.proofInsert });
    mocks.proofSingle.mockResolvedValue({ data: savedProof, error: null });

    await expect(uploadProof({
      file,
      dossierId: "dossier-1",
      userId: "user-1",
      sectionKey: "documentation",
    })).resolves.toEqual(savedProof);

    expect(mocks.storageUpload).toHaveBeenCalledWith(
      "user-1/dossier-1/123456-i-titre.pdf",
      file,
    );
    expect(mocks.from).toHaveBeenCalledWith("proofs");
    expect(mocks.proofInsert).toHaveBeenCalledWith(expect.objectContaining({
      dossier_id: "dossier-1",
      uploaded_by: "user-1",
      type: "document",
      title: "titre.pdf",
      storage_path: "user-1/dossier-1/123456-i-titre.pdf",
      metadata: { terrainSectionKey: "documentation" },
    }));
  });

  it("preserves the Storage path when the proof row cannot be persisted", async () => {
    vi.spyOn(Date, "now").mockReturnValue(123456);
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const file = new File(["acte"], "titre.pdf", { type: "application/pdf" });
    const databaseError = new Error("database unavailable");
    mocks.from.mockReturnValueOnce({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { id: "dossier-1", user_id: "user-1" }, error: null }) }) }) });
    mocks.from.mockReturnValueOnce({ insert: mocks.proofInsert });
    mocks.proofSingle.mockResolvedValue({ data: null, error: databaseError });

    let thrown: unknown;
    try {
      await uploadProof({
        file,
        dossierId: "dossier-1",
        userId: "user-1",
        sectionKey: "documentation",
      });
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(ProofPersistenceError);
    expect(thrown).toMatchObject({
      storagePath: "user-1/dossier-1/123456-i-titre.pdf",
      cause: databaseError,
    });
    expect(mocks.storageUpload).toHaveBeenCalledOnce();
  });
});

describe("deleteProof", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.from.mockImplementation((table: string) => table === "dossiers" ? ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { id: "dossier-1", user_id: "user-1" }, error: null }) }) }) }) : ({ delete: mocks.proofDelete }));
    mocks.proofDelete.mockReturnValue({ eq: mocks.proofDeleteEq });
    mocks.proofDeleteEq.mockResolvedValue({ error: null });
  });

  it("keeps the proof database record when Storage deletion fails", async () => {
    const storageError = new Error("storage unavailable");
    mocks.storageRemove.mockResolvedValue({ error: storageError });

    await expect(
      deleteProof({ id: "proof-1", dossier_id: "dossier-1", storage_path: "user-1/dossier-1/file.pdf" }),
    ).rejects.toBe(storageError);

    expect(mocks.from).toHaveBeenCalledWith("dossiers");
    expect(mocks.proofDelete).not.toHaveBeenCalled();
  });

  it("deletes the database record only after Storage confirms deletion", async () => {
    mocks.storageRemove.mockResolvedValue({ error: null });

    await deleteProof({ id: "proof-1", dossier_id: "dossier-1", storage_path: "user-1/dossier-1/file.pdf" });

    expect(mocks.from).toHaveBeenCalledWith("proofs");
    expect(mocks.proofDelete).toHaveBeenCalledOnce();
    expect(mocks.proofDeleteEq).toHaveBeenCalledWith("id", "proof-1");
  });

  it("preserves the database error when the file was removed but row deletion fails", async () => {
    const databaseError = new Error("database unavailable");
    mocks.storageRemove.mockResolvedValue({ error: null });
    mocks.proofDeleteEq.mockResolvedValue({ error: databaseError });

    await expect(
      deleteProof({ id: "proof-1", dossier_id: "dossier-1", storage_path: "user-1/dossier-1/file.pdf" }),
    ).rejects.toBe(databaseError);
  });
});


describe("listProofs reload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("restores the persisted proof and its Terrain section attachment from the database", async () => {
    const savedProof = {
      id: "proof-1",
      dossier_id: "dossier-1",
      title: "titre.pdf",
      storage_path: "user-1/dossier-1/123456-i-titre.pdf",
      metadata: { terrainSectionKey: "documentation" },
      verified: false,
    };
    const order = vi.fn().mockResolvedValue({ data: [savedProof], error: null });
    const select = vi.fn(() => ({
      eq: vi.fn(() => ({ order })),
    }));
    mocks.from.mockReturnValue({ select });

    await expect(listProofs("dossier-1")).resolves.toEqual([savedProof]);
    expect(mocks.from).toHaveBeenCalledWith("proofs");
    expect(select).toHaveBeenCalledWith("*");
    expect(order).toHaveBeenCalledWith("created_at", { ascending: false });
  });
});


describe("countProofsByDossier", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("counts every proof visible through RLS, including proofs uploaded by other accepted participants", async () => {
    const select = vi.fn().mockResolvedValue({
      data: [
        { dossier_id: "owned-dossier" },
        { dossier_id: "shared-dossier" },
        { dossier_id: "shared-dossier" },
      ],
      error: null,
    });
    mocks.from.mockReturnValue({ select });

    await expect(countProofsByDossier()).resolves.toEqual({
      "owned-dossier": 1,
      "shared-dossier": 2,
    });

    expect(mocks.from).toHaveBeenCalledWith("proofs");
    expect(select).toHaveBeenCalledWith("dossier_id");
  });
});
