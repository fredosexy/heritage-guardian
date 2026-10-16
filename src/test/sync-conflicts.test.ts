import { describe, expect, it } from "vitest";
import { detectConflictFields, mergeResolution } from "@/services/sync-conflicts";

describe("conflits de synchronisation", () => {
  it("pas de conflit si le serveur n'a pas changé", () => {
    expect(detectConflictFields("t1", { updated_at: "t1", title: "B" }, { title: "A" })).toEqual([]);
  });
  it("conflit sur le champ modifié des deux côtés", () => {
    expect(detectConflictFields("t1", { updated_at: "t2", title: "B", description: "x" }, { title: "A", description: "x" })).toEqual(["title"]);
  });
  it("la fusion respecte le choix par champ", () => {
    expect(mergeResolution({ title: "A", description: "m" }, { title: "B", description: "t" }, { title: "theirs" }))
      .toEqual({ title: "B", description: "m" });
  });
});
