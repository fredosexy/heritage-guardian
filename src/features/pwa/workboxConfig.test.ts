import { describe, expect, it } from "vitest";
import { pwaRuntimeCaching } from "./workboxConfig";

describe("PWA runtime cache allowlist", () => {
  it("allows only the public map library and icon resources", () => {
    const urls = [
      "https://unpkg.com/maplibre-gl@6.16.0/dist/maplibre-gl.js",
      "https://app.example.com/icons/icon-192.png",
    ];

    for (const url of urls) {
      expect(pwaRuntimeCaching.some((rule) => rule.urlPattern.test(url))).toBe(true);
    }
  });

  it("never caches Supabase Storage responses generically", () => {
    const privateFile = "https://project.supabase.co/storage/v1/object/sign/private/dossier/proof.pdf";
    expect(pwaRuntimeCaching.some((rule) => rule.urlPattern.test(privateFile))).toBe(false);
  });
});
