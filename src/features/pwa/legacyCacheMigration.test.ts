import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { describe, expect, it, vi } from "vitest";

const migrationScript = readFileSync(
  "public/pwa-legacy-cache-cleanup.js",
  "utf8",
);

describe("legacy PWA cache migration worker", () => {
  it("waits for private cache deletion during service-worker activation", async () => {
    let activateHandler: ((event: { waitUntil: (promise: Promise<unknown>) => void }) => void) | undefined;
    const deleteCache = vi.fn().mockResolvedValue(true);

    runInNewContext(migrationScript, {
      self: {
        addEventListener: (type: string, handler: typeof activateHandler) => {
          if (type === "activate") activateHandler = handler;
        },
      },
      caches: { delete: deleteCache },
    });

    expect(activateHandler).toBeTypeOf("function");
    let activationWork: Promise<unknown> | undefined;
    activateHandler?.({ waitUntil: (promise) => { activationWork = promise; } });
    await activationWork;

    expect(deleteCache).toHaveBeenCalledOnce();
    expect(deleteCache).toHaveBeenCalledWith("supabase-storage");
  });

  it("does not mark activation complete before cache deletion settles", async () => {
    let activateHandler: ((event: { waitUntil: (promise: Promise<unknown>) => void }) => void) | undefined;
    let resolveDeletion: ((value: boolean) => void) | undefined;
    const deleteCache = vi.fn(() => new Promise<boolean>((resolve) => { resolveDeletion = resolve; }));

    runInNewContext(migrationScript, {
      self: {
        addEventListener: (type: string, handler: typeof activateHandler) => {
          if (type === "activate") activateHandler = handler;
        },
      },
      caches: { delete: deleteCache },
    });

    let activationWork: Promise<unknown> | undefined;
    activateHandler?.({ waitUntil: (promise) => { activationWork = promise; } });
    expect(activationWork).toBeDefined();
    expect(resolveDeletion).toBeTypeOf("function");
    resolveDeletion?.(true);
    await activationWork;
  });
});
