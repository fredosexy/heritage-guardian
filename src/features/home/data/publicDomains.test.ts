import { describe, expect, it } from "vitest";
import { PUBLIC_DOMAINS_V1 } from "./publicDomains";

describe("public V1 domain catalogue", () => {
  it("exposes exactly the four approved business domains", () => {
    expect(PUBLIC_DOMAINS_V1.map((domain) => domain.id)).toEqual([
      "patrimoine",
      "succession",
      "volontes",
      "conflits",
    ]);
  });

  it("keeps public domains separate from technical dossier types", () => {
    expect(PUBLIC_DOMAINS_V1.map((domain) => domain.previewModuleId)).toEqual([
      "terrain",
      "heritage",
      "volonte",
      "conflit",
    ]);
    expect(PUBLIC_DOMAINS_V1.some((domain) => domain.id === "savoir")).toBe(false);
  });

  it("routes the assets domain to the available Land journey", () => {
    expect(PUBLIC_DOMAINS_V1[0].previewModuleId).toBe("terrain");
  });
});
