import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  userId: "invited-user",
  from: vi.fn(),
  update: vi.fn(),
  del: vi.fn(),
  getUser: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getUser: mocks.getUser },
    from: mocks.from,
  },
}));

import { deleteDossier, updateDossierMetadata, updateDossierScore } from "./dossiers.repo";

describe("dossier ownership enforcement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.userId = "invited-user";
    mocks.getUser.mockResolvedValue({ data: { user: { id: mocks.userId } }, error: null });
    mocks.from.mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: { user_id: "owner" }, error: null }),
          single: async () => ({ data: { user_id: "owner" }, error: null }),
        }),
      }),
      update: mocks.update,
      delete: mocks.del,
    }));
  });

  it("rejects direct Terrain metadata writes by an invited user before mutation", async () => {
    await expect(updateDossierMetadata("terrain-1", { terrain: { sections: { histoire: "Correction" } } })).rejects.toThrow("Only the dossier owner");
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it("rejects score changes and deletion attempts from non-owners before any mutation", async () => {
    await expect(updateDossierScore("terrain-1", 100, "complete")).rejects.toThrow("Only the dossier owner");
    await expect(deleteDossier("terrain-1")).rejects.toThrow("Only the dossier owner");
    expect(mocks.update).not.toHaveBeenCalled();
    expect(mocks.del).not.toHaveBeenCalled();
  });
});
