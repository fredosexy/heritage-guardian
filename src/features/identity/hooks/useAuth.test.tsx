import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "./useAuth";

const auth = {
  onAuthStateChange: vi.fn(),
  getSession: vi.fn(),
  signOut: vi.fn(),
};

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { auth },
}));

vi.mock("@/services/claim-local-data", () => ({
  claimLocalData: vi.fn(),
}));

function Probe() {
  const { user, loading } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="user">{user?.id ?? "none"}</span>
    </div>
  );
}

describe("AuthProvider session lifecycle", () => {
  let authListener: ((event: string, session: any) => void) | undefined;

  beforeEach(() => {
    vi.clearAllMocks();
    auth.onAuthStateChange.mockImplementation((callback: typeof authListener) => {
      authListener = callback;
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });
    auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
    auth.signOut.mockResolvedValue({ error: null });
  });

  it("does not restore a stale session after a newer auth event", async () => {
    let resolveSession!: (value: any) => void;
    auth.getSession.mockReturnValue(
      new Promise((resolve) => {
        resolveSession = resolve;
      }),
    );

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    const staleSession = { user: { id: "stale-user" } };
    authListener?.("SIGNED_OUT", null);
    resolveSession({ data: { session: staleSession }, error: null });

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
      expect(screen.getByTestId("user")).toHaveTextContent("none");
    });
  });
});
