import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: mocks.createClient,
}));

vi.mock("@supabase/supabase-js/cors", () => ({
  corsHeaders: { "Access-Control-Allow-Origin": "*" },
}));

import { authorizeAiRequest } from "../../supabase/functions/_shared/ai-security.ts";

const validUser = { id: "user-123" };

describe("authorizeAiRequest", () => {
  let env: Record<string, string | undefined>;
  let userClient: { auth: { getUser: ReturnType<typeof vi.fn> } };
  let serviceClient: { rpc: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createClient.mockReset();
    env = {
      SUPABASE_URL: "https://project.example.test",
      SUPABASE_ANON_KEY: "anon-test-key",
      SUPABASE_SERVICE_ROLE_KEY: "service-test-key",
    };
    vi.stubGlobal("Deno", {
      env: { get: (key: string) => env[key] },
    });

    userClient = { auth: { getUser: vi.fn() } };
    userClient.auth.getUser.mockResolvedValue({ data: { user: validUser }, error: null });
    serviceClient = { rpc: vi.fn() };
    serviceClient.rpc.mockResolvedValue({ data: true, error: null });
    mocks.createClient
      .mockReturnValueOnce(userClient)
      .mockReturnValueOnce(serviceClient);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("rejects requests without a bearer token before creating clients", async () => {
    const result = await authorizeAiRequest(new Request("https://example.test"), "ai-chat", 12);

    expect("response" in result && result.response.status).toBe(401);
    expect(mocks.createClient).not.toHaveBeenCalled();
  });

  it("returns service unavailable when required Supabase configuration is missing", async () => {
    delete env.SUPABASE_SERVICE_ROLE_KEY;

    const result = await authorizeAiRequest(
      new Request("https://example.test", { headers: { Authorization: "Bearer token" } }),
      "ai-chat",
      12,
    );

    expect("response" in result && result.response.status).toBe(503);
    expect(mocks.createClient).not.toHaveBeenCalled();
  });

  it("rejects an invalid or expired user token", async () => {
    userClient.auth.getUser.mockResolvedValue({ data: { user: null }, error: { message: "invalid token" } });

    const result = await authorizeAiRequest(
      new Request("https://example.test", { headers: { Authorization: "Bearer expired-token" } }),
      "ai-chat",
      12,
    );

    expect("response" in result && result.response.status).toBe(401);
    expect(userClient.auth.getUser).toHaveBeenCalledWith("expired-token");
    expect(mocks.createClient).toHaveBeenCalledTimes(1);
  });

  it("fails closed when the server-side quota RPC returns an error", async () => {
    serviceClient.rpc.mockResolvedValue({ data: null, error: { message: "database unavailable" } });

    const result = await authorizeAiRequest(
      new Request("https://example.test", { headers: { Authorization: "Bearer valid-token" } }),
      "ai-context",
      30,
    );

    expect("response" in result && result.response.status).toBe(503);
    expect(serviceClient.rpc).toHaveBeenCalledWith("consume_ai_request", {
      p_user_id: validUser.id,
      p_function_name: "ai-context",
      p_limit: 30,
      p_window_seconds: 60,
    });
  });

  it("rejects requests when the server-side quota is exhausted", async () => {
    serviceClient.rpc.mockResolvedValue({ data: false, error: null });

    const result = await authorizeAiRequest(
      new Request("https://example.test", { headers: { Authorization: "Bearer valid-token" } }),
      "ai-chat",
      12,
    );

    expect("response" in result && result.response.status).toBe(429);
  });

  it("returns the verified user and user-scoped client when authorized", async () => {
    const result = await authorizeAiRequest(
      new Request("https://example.test", { headers: { Authorization: "bEaReR valid-token" } }),
      "ai-chat",
      12,
    );

    expect(result).toEqual({ user: validUser, userClient });
    expect(userClient.auth.getUser).toHaveBeenCalledWith("valid-token");
    expect(serviceClient.rpc).toHaveBeenCalledWith("consume_ai_request", {
      p_user_id: validUser.id,
      p_function_name: "ai-chat",
      p_limit: 12,
      p_window_seconds: 60,
    });
    expect(mocks.createClient).toHaveBeenCalledTimes(2);
  });
});
