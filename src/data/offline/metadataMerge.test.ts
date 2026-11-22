import { expect, it } from "vitest";
import { createAgriculturalRuralPatch, mergeAgriculturalRural, mergeDossierMetadata } from "./metadataMerge";

it("creates field-level patches and explicit deletions for cleared family details", () => {
  const patch = createAgriculturalRuralPatch(
    { family: "plantation", familyDetails: { cropType: "Cacao", declaredArea: 1 }, declarationStatus: "declare" },
    { family: "plantation", familyDetails: { cropType: "Cacao", declaredArea: 2 }, declarationStatus: "declare" },
  );
  expect(patch).toEqual({ familyDetails: { declaredArea: 2 } });
  const cleared = createAgriculturalRuralPatch(
    { familyDetails: { cropType: "Cacao", declaredArea: 1 } },
    { familyDetails: { cropType: "Cacao" } },
  );
  expect(cleared).toEqual({ familyDetails: { declaredArea: null } });
});

it("merges disjoint family fields and preserves append-only history arrays", () => {
  const merged = mergeAgriculturalRural(
    {
      family: "plantation",
      familyDetails: { cropType: "Cacao", declaredArea: 1 },
      events: [{ id: "event-1", type: "planting" }],
      relatedAssets: [{ id: "relation-1", dossierId: "land-1", relationType: "located_on", active: true }],
    },
    {
      familyDetails: { declaredArea: 2 },
      events: [{ id: "event-2", type: "harvest" }],
      relatedAssets: [{ id: "relation-1", dossierId: "land-1", relationType: "located_on", active: false, endedAt: "2026-11-22" }],
    },
  );
  expect(merged.familyDetails).toEqual({ cropType: "Cacao", declaredArea: 2 });
  expect(merged.events).toHaveLength(2);
  expect(merged.relatedAssets).toEqual([
    { id: "relation-1", dossierId: "land-1", relationType: "located_on", active: false, endedAt: "2026-11-22" },
  ]);
});

it("merges agricultural and Terrain metadata without replacing unrelated dossier metadata", () => {
  const merged = mergeDossierMetadata(
    { other: "keep", terrain: { sections: { history: "old" } }, agriculturalRural: { familyDetails: { cropType: "Cacao" } } },
    { terrain: { sections: { boundary: "declared" } }, agriculturalRural: { familyDetails: { declaredArea: 2 } } },
  );
  expect(merged.other).toBe("keep");
  expect(merged.terrain).toEqual({ sections: { history: "old", boundary: "declared" } });
  expect(merged.agriculturalRural).toEqual({ familyDetails: { cropType: "Cacao", declaredArea: 2 } });
});
