import { describe, expect, it } from "vitest";
import { computeCompletionScore, statusFromScore } from "@/services/dossier-scoring";

describe("dossier scoring", () => {
  it("caps completion at 100", () => {
    expect(computeCompletionScore({
      proofsCount: 20,
      hasLocation: true,
      hasDescription: true,
      participantsCount: 20,
    })).toBe(100);
  });

  it("maps score boundaries without ambiguity", () => {
    expect(statusFromScore(39)).toBe("risk");
    expect(statusFromScore(40)).toBe("incomplete");
    expect(statusFromScore(74)).toBe("incomplete");
    expect(statusFromScore(75)).toBe("secure");
  });
});
