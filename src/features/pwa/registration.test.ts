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
});
