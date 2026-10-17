import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  storageRemove: vi.fn(),
  proofDelete: vi.fn(),
  proofDeleteEq: vi.fn(),
  from: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    storage: {
      from: vi.fn(() => ({ remove: mocks.storageRemove })),
    },
    from: mocks.from,
  },
}));

import { deleteProof } from "@/data/proofs.repo";

describe("deleteProof", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.from.mockReturnValue({ delete: mocks.proofDelete });
    mocks.proofDelete.mockReturnValue({ eq: mocks.proofDeleteEq });
    mocks.proofDeleteEq.mockResolvedValue({ error: null });
  });

  it("keeps the proof database record when Storage deletion fails", async () => {
    const storageError = new Error("storage unavailable");
    mocks.storageRemove.mockResolvedValue({ error: storageError });

    await expect(
      deleteProof({ id: "proof-1", storage_path: "user-1/dossier-1/file.pdf" }),
    ).rejects.toBe(storageError);

    expect(mocks.from).not.toHaveBeenCalled();
  });

  it("deletes the database record only after Storage confirms deletion", async () => {
    mocks.storageRemove.mockResolvedValue({ error: null });

    await deleteProof({ id: "proof-1", storage_path: "user-1/dossier-1/file.pdf" });

    expect(mocks.from).toHaveBeenCalledWith("proofs");
    expect(mocks.proofDelete).toHaveBeenCalledOnce();
    expect(mocks.proofDeleteEq).toHaveBeenCalledWith("id", "proof-1");
  });

  it("preserves the database error when the file was removed but row deletion fails", async () => {
    const databaseError = new Error("database unavailable");
    mocks.storageRemove.mockResolvedValue({ error: null });
    mocks.proofDeleteEq.mockResolvedValue({ error: databaseError });

    await expect(
      deleteProof({ id: "proof-1", storage_path: "user-1/dossier-1/file.pdf" }),
    ).rejects.toBe(databaseError);
  });
});
