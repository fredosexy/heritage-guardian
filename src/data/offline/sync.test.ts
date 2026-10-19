import { beforeEach, describe, expect, it, vi } from "vitest";

type TestDraft = {
  id: number;
  localId: string;
  user_id: string;
  synced: 0 | 1;
  type: string;
  title: string;
  created_at: number;
  updated_at: number;
};

type TestQueuedOp =
  | {
      id: number;
      kind: "create_dossier";
      payload: { localId: string };
      created_at: number;
      attempts: number;
    }
  | {
      id: number;
      kind: "update_dossier";
      payload: {
        dossierId: string;
        changes: { title: string };
        baseUpdatedAt: string;
      };
      created_at: number;
      attempts: number;
    };

const state = vi.hoisted(() => ({
  queuedOps: [] as TestQueuedOp[],
  draft: {
    id: 10,
    localId: "draft-1",
    user_id: "user-a",
    synced: 0 as const,
    type: "family",
    title: "Test",
    created_at: 1,
    updated_at: 1,
  } as TestDraft,
  mockDb: {
    queue: {
      orderBy: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    drafts: {
      where: vi.fn(),
      update: vi.fn(),
    },
  },
  mockSupabase: {
    auth: { getUser: vi.fn() },
    from: vi.fn(),
  },
}));

state.mockDb.queue.orderBy.mockImplementation(() => ({
  toArray: async () => state.queuedOps,
}));
state.mockDb.drafts.where.mockImplementation(() => ({
  equals: () => ({ first: async () => state.draft }),
}));

vi.mock("@/data/offline/db", () => ({ db: state.mockDb }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: state.mockSupabase }));

import { processQueue } from "./sync";

describe("offline sync auth revalidation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.queuedOps = [{
      id: 1,
      kind: "create_dossier",
      payload: { localId: "draft-1" },
      created_at: 1,
      attempts: 0,
    }];
    state.draft = {
      id: 10,
      localId: "draft-1",
      user_id: "user-a",
      synced: 0,
      type: "family",
      title: "Test",
      created_at: 1,
      updated_at: 1,
    };
    state.mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-a" } },
      error: null,
    });
    state.mockSupabase.from.mockReset();
    state.mockDb.queue.update.mockReset();
    state.mockDb.queue.delete.mockReset();
    state.mockDb.drafts.update.mockReset();
  });

  it("pauses the queue when the session is expired or signed out", async () => {
    state.mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: "JWT expired" },
    });

    await processQueue();

    expect(state.mockSupabase.from).not.toHaveBeenCalled();
    expect(state.mockDb.queue.delete).not.toHaveBeenCalled();
    expect(state.mockDb.queue.update).not.toHaveBeenCalled();
  });

  it("does not replay a queued draft under a different account", async () => {
    state.mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-b" } },
      error: null,
    });

    await processQueue();

    expect(state.mockSupabase.from).not.toHaveBeenCalled();
    expect(state.mockDb.queue.delete).not.toHaveBeenCalled();
    expect(state.mockDb.queue.update).not.toHaveBeenCalled();
  });

  it("keeps the operation queued when the protected API call expires", async () => {
    state.mockSupabase.from.mockReturnValue({
      insert: () => ({
        select: () => ({
          single: async () => ({ data: null, error: { message: "JWT expired" } }),
        }),
      }),
    });

    await processQueue();

    expect(state.mockDb.queue.delete).not.toHaveBeenCalled();
    expect(state.mockDb.queue.update).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ attempts: 1, last_error: "JWT expired" }),
    );
  });

  it("does not update a dossier owned by another account", async () => {
    state.queuedOps = [{
      id: 2,
      kind: "update_dossier",
      payload: {
        dossierId: "dossier-owned-by-a",
        changes: { title: "Changed" },
        baseUpdatedAt: "2026-01-01T00:00:00Z",
      },
      created_at: 1,
      attempts: 0,
    }];
    state.mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-b" } },
      error: null,
    });
    const selectChain = {
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: { message: "Not found" } }),
    };
    const update = vi.fn();
    state.mockSupabase.from.mockReturnValue({
      select: vi.fn(() => selectChain),
      update,
    });

    await processQueue();

    expect(state.mockSupabase.from).toHaveBeenCalledWith("dossiers");
    expect(update).not.toHaveBeenCalled();
    expect(state.mockDb.queue.delete).not.toHaveBeenCalled();
    expect(state.mockDb.queue.update).toHaveBeenCalledWith(
      2,
      expect.objectContaining({ attempts: 1 }),
    );
  });
});
