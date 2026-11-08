import { describe, expect, it } from "vitest";
import { pwaRuntimeCaching } from "./workboxConfig";

describe("PWA runtime cache allowlist", () => {
  it("allows the pinned public map library and same-origin icon resources only", () => {
    const mapRule = pwaRuntimeCaching.find((rule) => rule.options.cacheName === "maplibre-library");
    expect(mapRule?.urlPattern instanceof RegExp).toBe(true);
    if (mapRule?.urlPattern instanceof RegExp) {
      expect(mapRule.urlPattern.test("https://unpkg.com/maplibre-gl@6.16.0/dist/maplibre-gl.js")).toBe(true);
    }

    const iconRule = pwaRuntimeCaching.find((rule) => rule.options.cacheName === "icons");
    expect(iconRule).toBeDefined();
    const matchesIcon = iconRule?.urlPattern as (context: { url: URL }) => boolean;
    expect(matchesIcon({ url: new URL("/icons/icon-192.png", self.location.origin) })).toBe(true);
    expect(matchesIcon({ url: new URL("https://external.example/icons/icon.png") })).toBe(false);
  });

  it("never caches Supabase Storage responses generically", () => {
    const privateFile = new URL("https://project.supabase.co/storage/v1/object/sign/private/dossier/proof.pdf");
    const matchesAnyRule = pwaRuntimeCaching.some((rule) =>
      rule.urlPattern instanceof RegExp
        ? rule.urlPattern.test(privateFile.href)
        : rule.urlPattern({ url: privateFile } as { url: URL }),
    );
    expect(matchesAnyRule).toBe(false);
  });
});
