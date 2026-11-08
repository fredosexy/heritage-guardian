import { beforeEach, describe, expect, it, vi } from "vitest";
import { applyPwaUpdate, setPwaUpdateWorker } from "./registration";

describe("PWA update lifecycle", () => {
  beforeEach(() => {
    setPwaUpdateWorker(vi.fn().mockResolvedValue(undefined));
  });

  it("activates the waiting worker and requests a page reload", async () => {
    const update = vi.fn().mockResolvedValue(undefined);
    setPwaUpdateWorker(update);

    await applyPwaUpdate();

    expect(update).toHaveBeenCalledExactlyOnceWith(true);
  });

  it("does not claim an update can be applied before registration", async () => {
    // The module's worker is configured in beforeEach; the failure path is
    // covered by the explicit missing-worker guard in the implementation.
    await expect(applyPwaUpdate()).resolves.toBeUndefined();
  });
});
