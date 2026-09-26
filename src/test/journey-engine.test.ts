import { describe, expect, it } from "vitest";
import { canTransition, getJourneySummary, selectProcedure, stepApplies } from "@/services/journey-engine";

describe("journey engine", () => {
  it("selects the latest published procedure for the exact territory", () => {
    const definitions = [
      { dossier_type: "succession", territory: "*", version: 4, status: "publiee" },
      { dossier_type: "succession", territory: "Yaoundé", version: 2, status: "publiee" },
      { dossier_type: "succession", territory: "Yaoundé", version: 3, status: "draft" },
    ];
    expect(selectProcedure(definitions, { dossierType: "succession", territory: "Yaoundé" })?.version).toBe(2);
  });

  it("filters optional configured steps without hardcoding a territorial sequence", () => {
    expect(stepApplies({ bien_type: ["terrain", "parcelle"] }, { bienType: "terrain", creationContext: "propre_bien" })).toBe(true);
    expect(stepApplies({ creation_context: "bien_familial" }, { bienType: "terrain", creationContext: "propre_bien" })).toBe(false);
  });

  it("computes current, next, blocked and progress once", () => {
    const summary = getJourneySummary([
      { id: "3", step_order: 3, status: "a_faire", territorial_level: "departement" },
      { id: "1", step_order: 1, status: "terminee", territorial_level: "rural" },
      { id: "2", step_order: 2, status: "bloquee", territorial_level: "arrondissement" },
    ]);
    expect(summary.currentStep?.id).toBe("2");
    expect(summary.nextStep?.id).toBe("3");
    expect(summary.blockedSteps).toHaveLength(1);
    expect(summary.progressPercent).toBe(33);
    expect(summary.orderedSteps.map((step) => step.territorial_level)).toEqual(["rural", "arrondissement", "departement"]);
  });

  it("allows only the production transition matrix", () => {
    expect(canTransition("en_cours", "terminee")).toBe(true);
    expect(canTransition("terminee", "en_cours")).toBe(false);
    expect(canTransition("a_faire", "terminee")).toBe(false);
  });
});
