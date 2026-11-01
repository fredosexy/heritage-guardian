import { describe, expect, it } from "vitest";
import { DOSSIER_TYPES } from "./dossierTypeMeta";

describe("launch availability", () => {
  it("makes Terrain available", () => {
    expect(DOSSIER_TYPES.find((item) => item.id === "terrain")?.available).toBe(true);
  });

  it.each(["heritage", "volonte", "conflit", "savoir"])(
    "keeps %s in preparation",
    (id) => {
      expect(DOSSIER_TYPES.find((item) => item.id === id)?.available).toBe(false);
    },
  );
});