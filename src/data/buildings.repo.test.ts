import { describe, expect, it } from "vitest";
import { readBuildingPropertyInput } from "./buildings.repo";

describe("readBuildingPropertyInput", () => {
  it("rejects missing or malformed building metadata", () => {
    expect(readBuildingPropertyInput(undefined)).toBeNull();
    expect(readBuildingPropertyInput({ building: null })).toBeNull();
    expect(readBuildingPropertyInput({ building: { property_kind: "terrain" } })).toBeNull();
  });

  it("normalizes declared property details without inventing optional values", () => {
    expect(readBuildingPropertyInput({
      building: {
        property_kind: "immeuble",
        locality: "  Douala  ",
        address_description: "  Bonanjo  ",
        declared_surface: 420,
        surface_unit: "m2",
      },
    })).toEqual({
      property_kind: "immeuble",
      locality: "Douala",
      address_description: "Bonanjo",
      declared_surface: 420,
      surface_unit: "m2",
    });
  });

  it("keeps invalid or absent surface values empty", () => {
    expect(readBuildingPropertyInput({
      building: { property_kind: "maison", declared_surface: -5, surface_unit: "unknown" },
    })).toEqual({
      property_kind: "maison",
      locality: null,
      address_description: null,
      declared_surface: null,
      surface_unit: "m2",
    });
  });
});
