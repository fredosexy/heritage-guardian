import "fake-indexeddb/auto";
import Dexie from "dexie";
import { describe, expect, it } from "vitest";

describe("offline database account-isolation migrations", () => {
  it("clears unbound dossier snapshots and attributes legacy create operations safely", async () => {
    const legacy = new Dexie("memoire-offline");
    legacy.version(3).stores({
      drafts: "++id, localId, user_id, synced, updated_at",
      queue: "++id, kind, created_at",
      cachedDossiers: "id, user_id, cached_at",
      conflicts: "++id, dossier_id, created_at",
    });
    await legacy.open();
    await legacy.table("drafts").add({
      localId: "local-draft-a",
      user_id: "account-a",
      type: "terrain",
      title: "Draft A",
      created_at: 1,
      updated_at: 1,
      synced: 0,
    });
    await legacy.table("queue").add({
      kind: "create_dossier",
      payload: { localId: "local-draft-a" },
      created_at: 1,
      attempts: 0,
    });
    await legacy.table("queue").add({
      kind: "update_dossier",
      payload: { dossierId: "dossier-a", changes: { title: "Private update" } },
      created_at: 2,
      attempts: 0,
    });
    await legacy.table("cachedDossiers").put({
      id: "dossier-a",
      user_id: "account-a",
      data: { id: "dossier-a", title: "Private dossier" },
      cached_at: 1,
    });
    await legacy.table("conflicts").add({
      dossier_id: "dossier-a",
      title: "Private conflict",
      fields: ["title"],
      mine: { title: "Mine" },
      theirs: { title: "Theirs" },
      remote_updated_at: "v1",
      created_at: 1,
    });
    await legacy.close();

    const { db } = await import("./db");
    await db.open();

    expect(db.verno).toBe(5);
    expect(await db.cachedDossiers.count()).toBe(0);

    const operations = await db.queue.toArray();
    const migratedCreate = operations.find((operation) => operation.kind === "create_dossier");
    const unassignedUpdate = operations.find((operation) => operation.kind === "update_dossier");
    expect(migratedCreate?.viewer_user_id).toBe("account-a");
    expect(unassignedUpdate?.viewer_user_id).toBeUndefined();

    // Legacy conflicts are retained but remain unassigned and therefore hidden.
    expect(await db.conflicts.count()).toBe(1);
    expect((await db.conflicts.toArray())[0].viewer_user_id).toBeUndefined();

    await db.delete();
  });
});
