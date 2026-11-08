import { renderHook, act, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  save: vi.fn(),
  userId: "guest",
  get: vi.fn(),
  cacheGet: vi.fn(),
  cachePut: vi.fn(),
}));

vi.mock("@/features/identity", () => ({ useAuth: () => ({ user: { id: mocks.userId } }) }));
vi.mock("@/data", () => ({ dossiersRepo: { getDossier: mocks.get }, enqueueUpdateDossier: mocks.save }));
vi.mock("@/data/offline/db", () => ({
  db: { cachedDossiers: { put: mocks.cachePut, get: mocks.cacheGet } },
}));

import { useEditDossier } from "./useEditDossier";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.userId = "guest";
  mocks.cacheGet.mockResolvedValue(undefined);
  mocks.get.mockResolvedValue({ id: "terrain-1", user_id: "owner", title: "Original", updated_at: "base" });
});

it("refuses invited-user saves before enqueueing any direct main-field update", async () => {
  const hook = renderHook(() => useEditDossier("terrain-1"));
  await waitFor(() => expect(hook.result.current.loading).toBe(false));
  expect(hook.result.current.dossier?.title).toBe("Original");
  expect(hook.result.current.canEdit).toBe(false);
  await expect(hook.result.current.save({ title: "Correction" })).rejects.toThrow("Only the dossier owner");
  expect(mocks.save).not.toHaveBeenCalled();
  hook.unmount();
});

it("allows the owner to queue changed main fields with the base revision", async () => {
  mocks.userId = "owner";
  const hook = renderHook(() => useEditDossier("terrain-1"));
  await waitFor(() => expect(hook.result.current.loading).toBe(false));
  await act(async () => { expect(await hook.result.current.save({ title: "Correction" })).toBe(true); });
  expect(mocks.save).toHaveBeenCalledWith("terrain-1", { title: "Correction" }, "base");
  expect(mocks.cachePut).toHaveBeenCalledWith(expect.objectContaining({ viewer_user_id: "owner" }));
  hook.unmount();
});

it("does not load an offline dossier cached for another account", async () => {
  mocks.userId = "account-b";
  mocks.get.mockRejectedValue(new Error("offline"));
  mocks.cacheGet.mockResolvedValue({
    id: "terrain-1",
    user_id: "account-a",
    viewer_user_id: "account-a",
    data: { id: "terrain-1", user_id: "account-a", title: "Private dossier", updated_at: "base" },
    cached_at: Date.now(),
  });

  const hook = renderHook(() => useEditDossier("terrain-1"));
  await waitFor(() => expect(hook.result.current.loading).toBe(false));

  expect(hook.result.current.dossier).toBeNull();
  expect(hook.result.current.canEdit).toBe(false);
  await expect(hook.result.current.save({ title: "Leak" })).resolves.toBe(false);
  hook.unmount();
});
