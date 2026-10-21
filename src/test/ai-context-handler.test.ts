import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  authorizeAiRequest: vi.fn(),
  readBoundedJsonBody: vi.fn(),
}));

vi.mock("../../supabase/functions/_shared/ai-security.ts", () => ({
  authorizeAiRequest: mocks.authorizeAiRequest,
}));

vi.mock("../../supabase/functions/_shared/request-body.ts", () => ({
  readBoundedJsonBody: mocks.readBoundedJsonBody,
}));

vi.mock("@supabase/supabase-js/cors", () => ({
  corsHeaders: { "Access-Control-Allow-Origin": "*" },
}));

type Handler = (request: Request) => Promise<Response>;
let handler: Handler;
let lovableApiKey: string | undefined;

const dossier = {
  id: "123e4567-e89b-42d3-a456-426614174000",
  user_id: "user-123",
  type: "land",
  title: "Family land",
  status: "active",
  location_name: "Douala",
  description: "A family property",
};

function makeUserClient(dossierData: typeof dossier | null = dossier) {
  const dossierQuery = {
    maybeSingle: vi.fn().mockResolvedValue({ data: dossierData, error: null }),
  };
  const dossierEq = { eq: vi.fn(() => dossierQuery) };
  const dossierSelect = { select: vi.fn(() => dossierEq) };

  const proofsEq = { eq: vi.fn().mockResolvedValue({ count: 2, error: null }) };
  const proofsSelect = { select: vi.fn(() => proofsEq) };
  const participantsEq = { eq: vi.fn().mockResolvedValue({ count: 3, error: null }) };
  const participantsSelect = { select: vi.fn(() => participantsEq) };

  const from = vi.fn((table: string) => {
    if (table === "dossiers") return dossierSelect;
    if (table === "proofs") return proofsSelect;
    if (table === "participants") return participantsSelect;
    throw new Error("Unexpected table queried: " + table);
  });

  return {
    client: { from },
    queries: { from, dossierEq, dossierQuery, proofsEq, participantsEq },
  };
}

beforeAll(async () => {
  vi.stubGlobal("Deno", {
    serve: (registeredHandler: Handler) => {
      handler = registeredHandler;
    },
    env: {
      get: (key: string) => key === "LOVABLE_API_KEY" ? lovableApiKey : undefined,
    },
  });
  await import("../../supabase/functions/ai-context/index.ts");
});

afterAll(() => {
  vi.unstubAllGlobals();
});

beforeEach(() => {
  vi.clearAllMocks();
  lovableApiKey = "test-lovable-key";
  const { client } = makeUserClient();
  mocks.authorizeAiRequest.mockResolvedValue({
    user: { id: "user-123" },
    userClient: client,
  });
  mocks.readBoundedJsonBody.mockImplementation(async (request: Request) => {
    try {
      return { kind: "ok", value: await request.json() };
    } catch {
      return { kind: "invalid" };
    }
  });
  vi.stubGlobal("fetch", vi.fn());
});

function post(body: unknown): Request {
  return new Request("https://example.test/ai-context", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer valid-token" },
    body: JSON.stringify(body),
  });
}

describe("ai-context handler", () => {
  it("rejects non-POST methods before authorization", async () => {
    const response = await handler(new Request("https://example.test/ai-context", { method: "GET" }));

    expect(response.status).toBe(405);
    expect(await response.json()).toEqual({ error: "method_not_allowed" });
    expect(mocks.authorizeAiRequest).not.toHaveBeenCalled();
  });

  it("returns authorization failures without querying dossier data", async () => {
    mocks.authorizeAiRequest.mockResolvedValueOnce({
      response: new Response(JSON.stringify({ error: "authentication_required" }), { status: 401 }),
    });

    const response = await handler(post({ dossier: { id: dossier.id } }));

    expect(response.status).toBe(401);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("rejects malformed dossier identifiers", async () => {
    const response = await handler(post({ dossier: { id: "not-a-uuid" } }));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "invalid_dossier" });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("returns not found when RLS-visible dossier lookup returns no row", async () => {
    const { client } = makeUserClient(null);
    mocks.authorizeAiRequest.mockResolvedValueOnce({
      user: { id: "user-123" },
      userClient: client,
    });

    const response = await handler(post({ dossier: { id: dossier.id } }));

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "dossier_not_found" });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("uses the user-scoped client and sends only bounded dossier context to the gateway", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({
      choices: [{
        message: {
          tool_calls: [{
            function: {
              arguments: JSON.stringify({ suggestions: ["Ajouter une preuve", "Vérifier le titre foncier"] }),
            },
          }],
        },
      }],
    }), { status: 200, headers: { "Content-Type": "application/json" } }));

    const response = await handler(post({ dossier: { id: dossier.id } }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      suggestions: ["Ajouter une preuve", "Vérifier le titre foncier"],
    });
    expect(mocks.authorizeAiRequest).toHaveBeenCalledWith(expect.any(Request), "ai-context", 30);
    expect(fetch).toHaveBeenCalledTimes(1);
    const [, init] = vi.mocked(fetch).mock.calls[0];
    const payload = JSON.parse(String(init?.body));
    expect(payload.messages[0].content).toContain("Family land");
    expect(payload.messages[0].content).toContain("Nombre de preuves enregistrées : 2");
    expect(payload.messages[0].content).toContain("Nombre de participants : 3");
  });

  it("limits and sanitizes generated suggestions", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({
      choices: [{
        message: {
          tool_calls: [{
            function: {
              arguments: JSON.stringify({
                suggestions: ["  Première action  ", "x", 42, "A".repeat(400), "Cinquième action"],
              }),
            },
          }],
        },
      }],
    }), { status: 200 }));

    const response = await handler(post({ dossier: { id: dossier.id } }));

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.suggestions).toHaveLength(3);
    expect(body.suggestions[0]).toBe("Première action");
    expect(body.suggestions[1]).toBe("A".repeat(300));
    expect(body.suggestions[2]).toBeUndefined();
  });
});
