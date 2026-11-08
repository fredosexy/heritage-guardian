import { afterEach, describe, expect, it, vi } from "vitest";
import { clearLegacyPrivatePwaCaches } from "./cachePolicy";

describe("PWA private cache cleanup", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("removes the legacy generic Supabase Storage cache", async () => {
    const deleteCache = vi.fn().mockResolvedValue(true);
    vi.stubGlobal("caches", { delete: deleteCache });

    await clearLegacyPrivatePwaCaches();

    expect(deleteCache).toHaveBeenCalledTimes(1);
    expect(deleteCache).toHaveBeenCalledWith("supabase-storage");
  });

  it("does not fail in browsers without Cache Storage", async () => {
    vi.stubGlobal("caches", undefined);
    await expect(clearLegacyPrivatePwaCaches()).resolves.toBeUndefined();
  });
});
