import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ userId: "invited-user", from: vi.fn(), update: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: {
  auth: { getUser: async () => ({ data: { user: { id: mocks.userId } }, error: null }) }, from: mocks.from,
} }));
import { updateDossierMetadata } from "./dossiers.repo";
beforeEach(() => { vi.clearAllMocks(); mocks.from.mockReturnValue({
  select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { user_id: "owner" }, error: null }) }) }),
  update: mocks.update,
}); });
it("rejects direct Terrain metadata writes by an invited user before mutation", async () => {
  await expect(updateDossierMetadata("terrain-1", { terrain: { sections: { histoire: "Correction" } } })).rejects.toThrow("Only the dossier owner");
  expect(mocks.update).not.toHaveBeenCalled();
});