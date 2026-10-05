import { beforeEach, describe, expect, it, vi } from "vitest";

const mockDb = {
  queue: {
    orderBy: vi.fn(() => ({ toArray: vi.fn(async () => [
      { id: 1, kind: "create_dossier", payload: { localId: "draft-1" }, created_at: 1, attempts: 0 },
    ]) })),
    update: vi.fn(),
    delete: vi.fn(),
  },
  drafts: {
    where: vi.fn(() => ({
      equals: vi.fn(() => ({
        first: vi.fn(async () => ({
          id: 10,
          localId: "draft-1",
          user_id: "user-a",
          synced: 0,
          type: "family",
          title: "Test",
        })),
      })),
    })),
    update: vi.fn(),
  },
};

const mockSupabase = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(),
};

vi.mock("@/data/offline/db", () => ({ db: mockDb }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: mockSupabase }));

import { processQueue } from "./sync";

describe("offline sync auth revalidation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.from.mockReturnValue({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
    });
  });

  it("pauses the queue when the session is expired or signed out", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: "JWT expired" },
    });

    await processQueue();

    expect(mockSupabase.from).not.toHaveBeenCalled();
    expect(mockDb.queue.delete).not.toHaveBeenCalled();
    expect(mockDb.queue.update).not.toHaveBeenCalled();
  });

  it("does not replay a queued operation under a different account", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-b" } },
      error: null,
    });

    await processQueue();

    expect(mockSupabase.from).not.toHaveBeenCalled();
    expect(mockDb.queue.delete).not.toHaveBeenCalled();
    expect(mockDb.queue.update).not.toHaveBeenCalled();
  });
});
