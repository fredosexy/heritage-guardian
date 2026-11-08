import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Heritis PWA manifest and icons", () => {
  const manifestPath = resolve(process.cwd(), "public/manifest.webmanifest");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as {
    start_url: string;
    scope: string;
    display: string;
    icons: Array<{ src: string; sizes: string; purpose?: string }>;
  };

  it("declares a root-scoped standalone application", () => {
    expect(manifest.start_url).toBe("/");
    expect(manifest.scope).toBe("/");
    expect(manifest.display).toBe("standalone");
  });

  it("ships the declared PNG icons at their expected dimensions", () => {
    for (const icon of manifest.icons) {
      const iconPath = resolve(process.cwd(), "public", icon.src.replace(/^\//, ""));
      expect(existsSync(iconPath), icon.src).toBe(true);
      const png = readFileSync(iconPath);
      expect(png.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))).toBe(true);
      expect(png.readUInt32BE(16)).toBe(Number(icon.sizes.split("x")[0]));
      expect(png.readUInt32BE(20)).toBe(Number(icon.sizes.split("x")[1]));
      expect(icon.purpose).toContain("maskable");
    }
  });
});
