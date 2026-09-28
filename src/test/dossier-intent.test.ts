import { describe, expect, it } from "vitest";
import { resolveRequestedDossierType } from "@/services/dossier-intent";

describe("dossier intent routing", () => {
  it("keeps canonical dossier types", () => {
    expect(resolveRequestedDossierType("succession")).toBe("succession");
    expect(resolveRequestedDossierType("protection")).toBe("protection");
  });

  it("maps legacy home intents to controlled dossier types", () => {
    expect(resolveRequestedDossierType("terrain")).toBe("protection");
    expect(resolveRequestedDossierType("volonte")).toBe("transmission");
    expect(resolveRequestedDossierType("conflit")).toBe("regularisation");
  });

  it("rejects unknown values", () => {
    expect(resolveRequestedDossierType("invalid")).toBeNull();
    expect(resolveRequestedDossierType(null)).toBeNull();
  });
});
