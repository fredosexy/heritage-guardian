import { renderHook, act, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  save: vi.fn(),
  saveMetadata: vi.fn(),
  userId: "guest",
  get: vi.fn(),
  cacheGet: vi.fn(),
  cachePut: vi.fn(),
  queueToArray: vi.fn(),
}));

vi.mock("@/features/identity", () => ({ useAuth: () => ({ user: { id: mocks.userId } }) }));
vi.mock("@/data", () => ({ dossiersRepo: { getDossier: mocks.get }, enqueueUpdateDossier: mocks.save, enqueueUpdateDossierMetadata: mocks.saveMetadata }));
vi.mock("@/data/offline/db", () => ({
  db: {
    cachedDossiers: { put: mocks.cachePut, get: mocks.cacheGet },
    queue: { where: () => ({ equals: () => ({ toArray: mocks.queueToArray }) }) },
  },
}));

import { useEditDossier } from "./useEditDossier";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.userId = "guest";
  mocks.cacheGet.mockResolvedValue(undefined);
  mocks.queueToArray.mockResolvedValue([]);
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

it("restores pending agricultural metadata when reopening a dossier offline", async () => {
  mocks.userId = "owner";
  mocks.get.mockRejectedValue(new Error("offline"));
  mocks.cacheGet.mockResolvedValue({
    id: "farm-1",
    user_id: "owner",
    viewer_user_id: "owner",
    data: {
      id: "farm-1",
      user_id: "owner",
      type: "agricole",
      title: "Plantation",
      updated_at: "base",
      metadata: { agriculturalRural: { family: "plantation" } },
    },
    cached_at: Date.now(),
  });
  mocks.queueToArray.mockResolvedValue([{
    id: 7,
    kind: "update_dossier",
    viewer_user_id: "owner",
    payload: {
      dossierId: "farm-1",
      metadata: {
        agriculturalRural: {
          family: "plantation",
          familyDetails: { cropType: "Cacao", declaredArea: 2 },
          declaredPeople: [],
        },
      },
    },
    created_at: Date.now(),
    attempts: 0,
  }]);

  const hook = renderHook(() => useEditDossier("farm-1"));
  await waitFor(() => expect(hook.result.current.loading).toBe(false));
  expect((hook.result.current.dossier?.metadata as { agriculturalRural: { familyDetails: { cropType: string } } }).agriculturalRural.familyDetails.cropType).toBe("Cacao");
  hook.unmount();
});

it("queues only changed agricultural fields for the dossier owner", async () => {
  mocks.userId = "owner";
  mocks.get.mockResolvedValue({
    id: "farm-1",
    user_id: "owner",
    type: "agricole",
    title: "Plantation",
    updated_at: "base",
    metadata: { agriculturalRural: { family: "plantation", familyDetails: { cropType: "Cacao", declaredArea: 1 } } },
  });
  const hook = renderHook(() => useEditDossier("farm-1"));
  await waitFor(() => expect(hook.result.current.loading).toBe(false));
  await act(async () => {
    expect(await hook.result.current.saveAgricultural({
      family: "plantation",
      familyDetails: { cropType: "Cacao", declaredArea: 2 },
    })).toBe(true);
  });
  expect(mocks.saveMetadata).toHaveBeenCalledWith("farm-1", {
    agriculturalRural: expect.objectContaining({ familyDetails: { declaredArea: 2 } }),
  });
  hook.unmount();
});

it("refuses agricultural metadata writes by a participant who does not own the dossier", async () => {
  mocks.userId = "participant";
  mocks.get.mockResolvedValue({
    id: "farm-1",
    user_id: "owner",
    type: "agricole",
    title: "Plantation",
    updated_at: "base",
    metadata: { agriculturalRural: { family: "plantation" } },
  });
  const hook = renderHook(() => useEditDossier("farm-1"));
  await waitFor(() => expect(hook.result.current.loading).toBe(false));
  expect(hook.result.current.canEdit).toBe(false);
  await expect(hook.result.current.saveAgricultural({ family: "plantation" })).resolves.toBe(false);
  expect(mocks.saveMetadata).not.toHaveBeenCalled();
  hook.unmount();
});
