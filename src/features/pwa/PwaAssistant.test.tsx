import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PwaAssistant } from "./PwaAssistant";

const { usePwaMock } = vi.hoisted(() => ({ usePwaMock: vi.fn() }));

vi.mock("./usePwa", () => ({ usePwa: usePwaMock }));
vi.mock("./registration", () => ({
  applyPwaUpdate: vi.fn(),
  subscribePwaStatus: vi.fn(() => () => undefined),
}));

describe("PwaAssistant offline status", () => {
  beforeEach(() => {
    usePwaMock.mockReturnValue({
      installed: true,
      ios: false,
      android: false,
      online: false,
      canPromptInstall: false,
      install: vi.fn(),
    });
  });

  it("shows an offline message even when no install or update notice is active", () => {
    render(<PwaAssistant />);

    expect(screen.getByRole("status")).toHaveTextContent(/vous êtes hors ligne/i);
    expect(screen.getByLabelText("Assistant PWA Heritis")).toBeInTheDocument();
  });

  it("allows dismissal and restores the offline message after connectivity returns and is lost again", () => {
    const { rerender } = render(<PwaAssistant />);

    fireEvent.click(screen.getByRole("button", { name: /fermer l'assistant pwa/i }));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    usePwaMock.mockReturnValue({
      installed: true,
      ios: false,
      android: false,
      online: true,
      canPromptInstall: false,
      install: vi.fn(),
    });
    rerender(<PwaAssistant />);
    expect(screen.queryByLabelText("Assistant PWA Heritis")).not.toBeInTheDocument();

    usePwaMock.mockReturnValue({
      installed: true,
      ios: false,
      android: false,
      online: false,
      canPromptInstall: false,
      install: vi.fn(),
    });
    rerender(<PwaAssistant />);
    expect(screen.getByRole("status")).toHaveTextContent(/vous êtes hors ligne/i);
  });
});
