import { describe, expect, it } from "vitest";
import { canTransition, getJourneySummary } from "@/services/journey-engine";

const step = (id: string, order: number, status: string) => ({
  id, step_order: order, status, territorial_level: "local",
});

describe("journey-engine", () => {
  it("selects the current step and the next actionable step", () => {
    const summary = getJourneySummary([
      step("1", 1, "terminee"),
      step("2", 2, "en_cours"),
      step("3", 3, "a_faire"),
    ]);

    expect(summary.currentStep?.id).toBe("2");
    expect(summary.nextStep?.id).toBe("3");
    expect(summary.progressPercent).toBe(33);
  });

  it("surfaces a blocked step without inventing a next completed state", () => {
    const summary = getJourneySummary([
      step("1", 1, "terminee"),
      step("2", 2, "bloquee"),
      step("3", 3, "a_faire"),
    ]);

    expect(summary.blockedSteps.map((item) => item.id)).toEqual(["2"]);
    expect(summary.currentStep?.id).toBe("2");
    expect(summary.nextStep?.id).toBe("3");
  });

  it("keeps step transitions constrained to the B4 state machine", () => {
    expect(canTransition("a_faire", "en_cours")).toBe(true);
    expect(canTransition("en_cours", "terminee")).toBe(true);
    expect(canTransition("a_faire", "terminee")).toBe(false);
    expect(canTransition("terminee", "en_cours")).toBe(false);
  });
});
