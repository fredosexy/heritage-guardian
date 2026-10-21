import { renderHook, act, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ save: vi.fn(), userId: "guest", get: vi.fn() }));
vi.mock("@/features/identity", () => ({ useAuth: () => ({ user: { id: mocks.userId } }) }));
vi.mock("@/data", () => ({ dossiersRepo: { getDossier: mocks.get }, enqueueUpdateDossier: mocks.save }));
vi.mock("@/data/offline/db", () => ({ db: { cachedDossiers: { put: vi.fn(), get: vi.fn() } } }));
import { useEditDossier } from "./useEditDossier";
beforeEach(() => { vi.clearAllMocks(); mocks.userId = "guest";
  mocks.get.mockResolvedValue({ id: "terrain-1", user_id: "owner", title: "Original", updated_at: "base" }); });
it("refuses invited-user saves before enqueueing any direct main-field update", async () => {
  const hook = renderHook(() => useEditDossier("terrain-1"));
  await waitFor(() => expect(hook.result.current.loading).toBe(false));
  expect(hook.result.current.canEdit).toBe(false);
  await expect(hook.result.current.save({ title: "Correction" })).rejects.toThrow("Only the dossier owner");
  expect(mocks.save).not.toHaveBeenCalled(); hook.unmount();
});
it("allows the owner to queue changed main fields with the base revision", async () => {
  mocks.userId = "owner";
  const hook = renderHook(() => useEditDossier("terrain-1"));
  await waitFor(() => expect(hook.result.current.loading).toBe(false));
  await act(async () => { expect(await hook.result.current.save({ title: "Correction" })).toBe(true); });
  expect(mocks.save).toHaveBeenCalledWith("terrain-1", { title: "Correction" }, "base"); hook.unmount();
});