import "fake-indexeddb/auto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

const mocks = vi.hoisted(() => ({ from: vi.fn(), upload: vi.fn(), userId: "owner", update: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: {
  auth: { getUser: vi.fn(async () => ({ data: { user: { id: mocks.userId } }, error: null })) },
  from: mocks.from,
  storage: { from: vi.fn(() => ({ upload: mocks.upload })) },
} }));
vi.mock("@/data/procedures.repo", () => ({ initializeDossierJourney: vi.fn() }));
import { db } from "./db";
import { enqueueUpdateDossierMetadata, processQueue } from "./sync";
import { useSyncCenter } from "@/features/offline/hooks/useSyncCenter";

describe("IndexedDB offline continuity", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    mocks.userId = "owner";
    await db.open();
    await db.queue.clear();
    await db.conflicts.clear();
    Object.defineProperty(navigator, "onLine", { configurable: true, value: true });
  });
  afterEach(async () => { await db.queue.clear(); await db.conflicts.clear(); db.close(); });

  const seedUpdate = () => db.queue.add({
    kind: "update_dossier", payload: { dossierId: "terrain-1", metadata: { terrain: { sections: { histoire: "Famille" } } } },
    attempts: 2, last_error: "old error", created_at: 1,
  });

  it("retains exact failure and attempts after close/open, then permits manual hook retry", async () => {
    const id = await seedUpdate();
    mocks.from.mockReturnValue({ select: () => {
      const query = { eq: vi.fn(() => query), maybeSingle: vi.fn(async () => ({ data: null, error: { message: "Storage/network temporarily unavailable" } })) };
      return query;
    } });
    await processQueue();
    db.close();
    await db.open();
    const first = renderHook(() => useSyncCenter());
    await waitFor(() => expect(first.result.current.queue[0]?.last_error).toBe("Storage/network temporarily unavailable"));
    expect(first.result.current.queue[0]?.attempts).toBe(3);
    first.unmount();
    db.close();
    await db.open();
    let release: (result: { data: { id: string }; error: null }) => void = () => { throw new Error("not started"); };
    const pending = new Promise<{ data: { id: string }; error: null }>((resolve) => { release = resolve; });
    mocks.from.mockReturnValue({
      select: () => {
        const query = { eq: vi.fn(() => query), maybeSingle: vi.fn(async () => ({ data: { user_id: "owner", metadata: {} }, error: null })) };
        return query;
      },
      update: mocks.update.mockImplementation(() => {
        const query = {
          eq: vi.fn(() => query),
          select: vi.fn(() => ({ maybeSingle: vi.fn(() => pending) })),
        };
        return query;
      }),
    });
    const reopened = renderHook(() => useSyncCenter());
    await waitFor(() => expect(reopened.result.current.queue[0]?.attempts).toBe(3));
    let retry: Promise<void> = Promise.resolve();
    act(() => { retry = reopened.result.current.retry(); });
    await waitFor(() => expect(mocks.update).toHaveBeenCalledOnce());
    expect((await db.queue.get(id))?.last_error).toBe("Storage/network temporarily unavailable");
    await act(async () => { release({ data: { id: "terrain-1", user_id: "owner" }, error: null }); await retry; });
    await waitFor(() => expect(reopened.result.current.queue).toEqual([]));
    reopened.unmount();
  });

  it("does not erase diagnostics or reorder a failed metadata operation when coalescing an offline edit", async () => {
    const id = await seedUpdate();
    Object.defineProperty(navigator, "onLine", { configurable: true, value: false });
    await enqueueUpdateDossierMetadata("terrain-1", { terrain: { sections: { provenance: "Acte" } } });
    expect(await db.queue.get(id)).toMatchObject({ attempts: 2, last_error: "old error", created_at: 1,
      payload: { metadata: { terrain: { sections: { histoire: "Famille", provenance: "Acte" } } } } });
  });

  it("stops dependent operations and does not immediately replay a failed in-flight pass", async () => {
    const id = await seedUpdate();
    let release: (result: { data: null; error: Error }) => void = () => { throw new Error("not started"); };
    const pending = new Promise<{ data: null; error: Error }>((resolve) => { release = resolve; });
    const maybeSingle = vi.fn(() => pending);
    mocks.from.mockReturnValue({ select: () => { const query = { eq: vi.fn(() => query), maybeSingle }; return query; } });
    const first = processQueue();
    await vi.waitFor(() => expect(maybeSingle).toHaveBeenCalledOnce());
    await db.queue.add({ kind: "initialize_journey", payload: { dossierId: "terrain-1" }, attempts: 0, created_at: 2 });
    await processQueue();
    release({ data: null, error: new Error("network failure") });
    await first;
    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(maybeSingle).toHaveBeenCalledOnce();
    expect(await db.queue.count()).toBe(2);
    expect((await db.queue.get(id))?.attempts).toBe(3);
  });

  it("keeps proof path, generated proof identity and Terrain section through reload and failed retries", async () => {
    const path = "owner/terrain-1/acte.pdf";
    const id = await db.queue.add({ kind: "upload_proof", created_at: 1, attempts: 0, payload: {
      file: new Blob(["acte"]), fileName: "acte.pdf", mimeType: "application/pdf", sizeBytes: 4,
      dossierId: "terrain-1", userId: "owner", storagePath: path, sectionKey: "documentation",
    } });
    const upsert = vi.fn(async () => ({ error: new Error("record unavailable") }));
    mocks.from.mockImplementation((table) => {
      if (table === "proofs") return { select: () => ({ eq: async () => ({ data: [], error: null }) }), upsert };
      return { select: () => { const q = { eq: () => q, maybeSingle: async () => ({ data: { id: "terrain-1" }, error: null }) }; return q; } };
    });
    mocks.upload.mockResolvedValue({ error: null });
    await processQueue();
    const failed = await db.queue.get(id);
    if (failed?.kind !== "upload_proof") throw new Error("Proof must remain queued");
    expect(failed.payload.proofId).toEqual(expect.any(String));
    expect(failed.last_error).toBe("record unavailable");
    db.close(); await db.open();
    await processQueue();
    expect(await db.queue.get(id)).toMatchObject({ attempts: 2, last_error: "record unavailable", payload: {
      storagePath: path, proofId: failed.payload.proofId, sectionKey: "documentation",
    } });
    expect(upsert).toHaveBeenNthCalledWith(2, expect.objectContaining({ id: failed.payload.proofId,
      storage_path: path, metadata: { terrainSectionKey: "documentation" } }), { onConflict: "id", ignoreDuplicates: true });
    expect(mocks.upload.mock.calls.map((call) => call[0])).toEqual([path, path]);
    expect(mocks.from.mock.calls.every((call) => ["dossiers", "proofs"].includes(call[0]))).toBe(true);
  });

  it.each(["fields", "metadata"])("never writes a guest's queued %s change directly", async (mode) => {
    mocks.userId = "invited-user";
    await db.queue.add({ kind: "update_dossier", attempts: 0, created_at: 1, payload: {
      dossierId: "terrain-1", ...(mode === "fields" ? { changes: { title: "Correction" }, baseUpdatedAt: "old" } : { metadata: { terrain: {} } }),
    } });
    mocks.from.mockReturnValue({ select: () => {
      const q = { eq: () => q, maybeSingle: async () => ({ data: { user_id: "owner", metadata: {} }, error: null }) }; return q;
    }, update: mocks.update });
    await processQueue();
    expect(mocks.update).not.toHaveBeenCalled();
    expect(await db.queue.count()).toBe(1);
    expect((await db.queue.toArray())[0]).toMatchObject({ attempts: 1, last_error: "Only the dossier owner can modify this dossier" });
  });
});