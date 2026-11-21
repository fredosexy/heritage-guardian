import { expect, it } from "vitest";
import {
  activateAgriculturalRelation,
  endAgriculturalRelation,
  getActiveAgriculturalRelation,
  updateActiveAgriculturalRelationType,
} from "./agricultural-relations";

it("ends a relation without deleting its historical record", () => {
  const initial = [{ id: "rel-1", dossierId: "land-1", relationType: "located_on", active: true }];
  const ended = endAgriculturalRelation(initial, "land-1", "2026-11-22T10:00:00.000Z");
  expect(ended).toEqual([{
    id: "rel-1", dossierId: "land-1", relationType: "located_on",
    active: false, endedAt: "2026-11-22T10:00:00.000Z",
  }]);
});

it("creates a new relation record when a previously ended relationship is reactivated", () => {
  const ended = [{ id: "rel-1", dossierId: "land-1", relationType: "located_on", active: false, endedAt: "2026-11-01T00:00:00.000Z" }];
  const next = activateAgriculturalRelation(ended, "land-1", "associated_asset", "rel-2", "2026-11-22T10:00:00.000Z");
  expect(next).toHaveLength(2);
  expect(next[0]).toEqual(ended[0]);
  expect(getActiveAgriculturalRelation(next, "land-1")?.id).toBe("rel-2");
});

it("updates only the active relationship", () => {
  const initial = [
    { id: "old", dossierId: "land-1", relationType: "located_on", active: false },
    { id: "new", dossierId: "land-1", relationType: "associated_asset", active: true },
  ];
  const next = updateActiveAgriculturalRelationType(initial, "land-1", "installed_on");
  expect(next[0]).toEqual(initial[0]);
  expect(next[1].relationType).toBe("installed_on");
});
