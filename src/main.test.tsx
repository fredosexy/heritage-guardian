import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  render: vi.fn(),
  initSync: vi.fn(),
  status: vi.fn(),
}));

vi.mock("react-dom/client", () => ({ createRoot: () => ({ render: mocks.render }) }));
vi.mock("./app/App", () => ({ default: () => null }));
vi.mock("./data/offline/sync", () => ({ initSyncListeners: mocks.initSync }));
vi.mock("./features/pwa/registration", () => ({ publishPwaStatus: mocks.status, setPwaUpdateWorker: vi.fn() }));

describe("preview startup", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    document.body.innerHTML = '<div id="root"></div>';
    vi.stubGlobal("window", {
      self: {}, top: {},
      location: { hostname: "localhost", origin: "http://localhost:8080" },
    });
  });
  afterEach(() => { vi.unstubAllGlobals(); });

  it("starts rendering and sync listeners even when worker lookup never settles", async () => {
    vi.stubGlobal("navigator", {
      serviceWorker: { getRegistrations: () => new Promise(() => {}) },
    });
    await import("./main");
    expect(mocks.render).toHaveBeenCalledOnce();
    expect(mocks.initSync).toHaveBeenCalledOnce();
  });

  it("renders and reports cleanup access failures without an unhandled rejection", async () => {
    vi.stubGlobal("navigator", {
      serviceWorker: { getRegistrations: () => { throw new Error("Access denied"); } },
    });
    await import("./main");
    expect(mocks.render).toHaveBeenCalledOnce();
    expect(mocks.status).toHaveBeenCalledWith("error");
  });

  it("still unregisters same-origin root workers without touching other scopes", async () => {
    const unregister = vi.fn().mockResolvedValue(true);
    const otherUnregister = vi.fn();
    vi.stubGlobal("navigator", { serviceWorker: { getRegistrations: async () => [
      { scope: "http://localhost:8080/", unregister },
      { scope: "http://localhost:8080/messaging/", unregister: otherUnregister },
    ] } });
    await import("./main");
    expect(unregister).toHaveBeenCalledOnce();
    expect(otherUnregister).not.toHaveBeenCalled();
    expect(mocks.render).toHaveBeenCalledOnce();
  });
});