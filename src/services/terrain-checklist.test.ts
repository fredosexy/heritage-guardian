import { describe, it, expect } from "vitest";
import { buildTerrainChecklist } from "./terrain-checklist";
describe("terrain checklist gaps", () => {
  it("flags all 9 sections as missing both on an empty dossier", () => {
    const list = buildTerrainChecklist({}, []);
    expect(list).toHaveLength(9);
    expect(list.every((i) => i.gap === "both")).toBe(true);
  });
  it("flags only the missing proof when text is filled", () => {
    const item = buildTerrainChecklist({ histoire: "Héritage familial" }, []).find((i) => i.key === "histoire");
    expect(item?.gap).toBe("proof");
  });
});
