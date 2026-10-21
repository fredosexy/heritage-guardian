import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  from: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  select: vi.fn(),
  eq: vi.fn(),
  maybeSingle: vi.fn(),
  single: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getUser: mocks.getUser },
    from: mocks.from,
  },
}));

import {
  createDossier,
  deleteDossier,
  updateDossierMetadata,
  updateDossierScore,
} from "@/data/dossiers.repo";

function makeQuery() {
  const query: Record<string, any> = {};
  query.select = mocks.select.mockImplementation(() => query);
  query.eq = mocks.eq.mockImplementation(() => query);
  query.maybeSingle = mocks.maybeSingle;
  query.single = mocks.single;
  query.insert = mocks.insert.mockImplementation(() => query);
  query.update = mocks.update.mockImplementation(() => query);
  query.delete = mocks.remove.mockImplementation(() => query);
  query.then = (resolve: (value: unknown) => unknown, reject: (reason: unknown) => unknown) =>
    Promise.resolve({ data: null, error: null }).then(resolve, reject);
  return query;
}

describe("dossiers repository ownership guards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getUser.mockResolvedValue({ data: { user: { id: "owner-1" } }, error: null });
    mocks.from.mockImplementation(() => makeQuery());
    mocks.maybeSingle.mockResolvedValue({
      data: { id: "dossier-1", user_id: "owner-1" },
      error: null,
    });
    mocks.single.mockResolvedValue({
      data: { id: "dossier-1", user_id: "owner-1", metadata: {} },
      error: null,
    });
  });

  it("requires an authenticated user before creating a dossier", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });

    await expect(createDossier({
      user_id: "owner-1",
      type: "terrain",
      title: "Dossier test",
    })).rejects.toThrow("Session required");

    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it("rejects creating a dossier for a different user", async () => {
    await expect(createDossier({
      user_id: "someone-else",
      type: "terrain",
      title: "Dossier test",
    })).rejects.toThrow("Cannot create a dossier for another user");

    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it.each([
    ["score update", () => updateDossierScore("dossier-1", 50, "incomplete")],
    ["metadata update", () => updateDossierMetadata("dossier-1", { note: "test" })],
    ["deletion", () => deleteDossier("dossier-1")],
  ])("blocks a non-owner from %s before issuing a mutation", async (_operation, run) => {
    mocks.maybeSingle.mockResolvedValue({
      data: { id: "dossier-1", user_id: "different-owner" },
      error: null,
    });

    await expect(run()).rejects.toThrow("Only the dossier owner can modify this dossier");

    expect(mocks.update).not.toHaveBeenCalled();
    expect(mocks.remove).not.toHaveBeenCalled();
  });

  it("scopes score updates to both dossier ID and authenticated owner", async () => {
    await updateDossierScore("dossier-1", 80, "incomplete");

    expect(mocks.update).toHaveBeenCalledWith({
      completion_score: 80,
      status: "incomplete",
    });
    expect(mocks.eq).toHaveBeenCalledWith("id", "dossier-1");
    expect(mocks.eq).toHaveBeenCalledWith("user_id", "owner-1");
  });

  it("scopes deletion to both dossier ID and authenticated owner", async () => {
    await deleteDossier("dossier-1");

    expect(mocks.remove).toHaveBeenCalledTimes(1);
    expect(mocks.eq).toHaveBeenCalledWith("id", "dossier-1");
    expect(mocks.eq).toHaveBeenCalledWith("user_id", "owner-1");
  });
});
