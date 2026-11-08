import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function readJpegDimensions(jpeg: Buffer): { width: number; height: number } | null {
  if (jpeg[0] !== 0xff || jpeg[1] !== 0xd8) return null;
  const startOfFrame = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);
  let offset = 2;
  while (offset < jpeg.length) {
    if (jpeg[offset] !== 0xff) { offset += 1; continue; }
    while (jpeg[offset] === 0xff) offset += 1;
    const marker = jpeg[offset++];
    if (marker === 0xd9 || marker === 0xda) break;
    const length = jpeg.readUInt16BE(offset);
    if (startOfFrame.has(marker)) {
      return { height: jpeg.readUInt16BE(offset + 3), width: jpeg.readUInt16BE(offset + 5) };
    }
    offset += length;
  }
  return null;
}

describe("Heritis PWA manifest and icons", () => {
  const manifestPath = resolve(process.cwd(), "public/manifest.webmanifest");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as {
    start_url: string;
    scope: string;
    display: string;
    icons: Array<{ src: string; sizes: string; type: string; purpose?: string }>;
  };

  it("declares a root-scoped standalone application", () => {
    expect(manifest.start_url).toBe("/");
    expect(manifest.scope).toBe("/");
    expect(manifest.display).toBe("standalone");
  });

  it("ships each icon in its declared format and expected dimensions", () => {
    for (const icon of manifest.icons) {
      const iconPath = resolve(process.cwd(), "public", icon.src.replace(/^\//, ""));
      expect(existsSync(iconPath), icon.src).toBe(true);
      const image = readFileSync(iconPath);
      let dimensions: { width: number; height: number } | null = null;

      if (icon.type === "image/png") {
        expect(image.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))).toBe(true);
        dimensions = { width: image.readUInt32BE(16), height: image.readUInt32BE(20) };
      } else if (icon.type === "image/jpeg") {
        dimensions = readJpegDimensions(image);
      }

      expect(dimensions, icon.src).not.toBeNull();
      expect(dimensions?.width).toBe(Number(icon.sizes.split("x")[0]));
      expect(dimensions?.height).toBe(Number(icon.sizes.split("x")[1]));
      expect(icon.purpose).toContain("maskable");
    }
  });
});
