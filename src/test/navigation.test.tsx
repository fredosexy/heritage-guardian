import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeAll, describe, expect, it, vi } from "vitest";
import i18n from "@/core/i18n";
import { AuthProvider } from "@/features/identity";

/**
 * Les tests de navigation ne doivent toucher aucun vrai service :
 * le client backend est remplacé par un chaînage neutre qui résout
 * toujours avec un tableau vide.
 */
vi.mock("@/integrations/supabase/client", () => {
  const makeChain = (): any => {
    const promise = Promise.resolve({ data: [], error: null });
    const target: any = {
      then: promise.then.bind(promise),
      catch: promise.catch.bind(promise),
      finally: promise.finally.bind(promise),
    };
    const proxy: any = new Proxy(target, {
      get(t, prop) {
        if (prop in t) return t[prop];
        return () => proxy;
      },
    });
    return proxy;
  };
  return {
    supabase: {
      from: () => makeChain(),
      rpc: () => makeChain(),
      channel: () => makeChain(),
      storage: { from: () => makeChain() },
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({
          data: { subscription: { unsubscribe: () => {} } },
        }),
        signOut: async () => ({ error: null }),
      },
    },
  };
});

import { AppRoutes } from "@/app/router";

const HOME_TITLE = "Protégeons ce qui compte pour vous.";
const NOT_FOUND_TITLE = "Cette page n'existe pas";

function renderRoutes(initialEntry: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter initialEntries={[initialEntry]} initialIndex={0}>
          <AppRoutes />
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

describe("navigation", () => {
  it("l'accueil s'ouvre depuis /", async () => {
    renderRoutes("/");
    expect(await screen.findByText(HOME_TITLE)).toBeInTheDocument();
    expect(screen.queryByText(NOT_FOUND_TITLE)).not.toBeInTheDocument();
  });

  it("/index redirige vers l'accueil", async () => {
    renderRoutes("/index");
    expect(await screen.findByText(HOME_TITLE)).toBeInTheDocument();
    expect(screen.queryByText(NOT_FOUND_TITLE)).not.toBeInTheDocument();
  });

  it("le rechargement direct de / et de /index affiche l'accueil", async () => {
    for (const entry of ["/", "/index"]) {
      const { unmount } = renderRoutes(entry);
      await waitFor(() =>
        expect(screen.queryByText(NOT_FOUND_TITLE)).not.toBeInTheDocument()
      );
      expect(await screen.findByText(HOME_TITLE)).toBeInTheDocument();
      unmount();
    }
  });
});
