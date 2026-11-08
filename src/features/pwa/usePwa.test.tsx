import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { usePwa } from "./usePwa";

describe("usePwa", () => {
  beforeEach(() => {
    Object.defineProperty(navigator, "userAgent", { configurable: true, value: "Mozilla/5.0 Chrome/130.0.0.0" });
    Object.defineProperty(navigator, "platform", { configurable: true, value: "Linux x86_64" });
    Object.defineProperty(navigator, "maxTouchPoints", { configurable: true, value: 0 });
    Object.defineProperty(navigator, "onLine", { configurable: true, value: true });
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
  });

  it("captures the browser installation prompt and returns the user's choice", async () => {
    const { result } = renderHook(() => usePwa());
    const prompt = vi.fn().mockResolvedValue(undefined);
    const event = Object.assign(new Event("beforeinstallprompt"), {
      prompt,
      userChoice: Promise.resolve({ outcome: "accepted" as const, platform: "web" }),
    });

    act(() => window.dispatchEvent(event));
    expect(result.current.canPromptInstall).toBe(true);

    let choice: string | undefined;
    await act(async () => { choice = await result.current.install(); });

    expect(prompt).toHaveBeenCalledOnce();
    expect(choice).toBe("accepted");
    expect(result.current.canPromptInstall).toBe(false);
  });

  it("detects a completed installation", () => {
    const { result } = renderHook(() => usePwa());
    act(() => window.dispatchEvent(new Event("appinstalled")));
    expect(result.current.installed).toBe(true);
  });

  it("tracks network transitions without treating connectivity as server availability", () => {
    const { result } = renderHook(() => usePwa());
    act(() => window.dispatchEvent(new Event("offline")));
    expect(result.current.online).toBe(false);
    act(() => window.dispatchEvent(new Event("online")));
    expect(result.current.online).toBe(true);
  });
  it("detects iOS devices for the manual home-screen installation flow", () => {
    Object.defineProperty(navigator, "userAgent", { configurable: true, value: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)" });
    const { result } = renderHook(() => usePwa());
    expect(result.current.ios).toBe(true);
    expect(result.current.canPromptInstall).toBe(false);
  });
});
