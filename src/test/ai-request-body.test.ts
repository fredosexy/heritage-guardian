import { readBoundedJsonBody } from "../../supabase/functions/_shared/request-body.ts";

describe("readBoundedJsonBody", () => {
  it("parses valid JSON when the UTF-8 payload fits the byte limit", async () => {
    const payload = JSON.stringify({ message: "Héritage au Cameroun 🇨🇲" });
    const byteLength = new TextEncoder().encode(payload).byteLength;
    const request = new Request("https://example.test", { method: "POST", body: payload });

    await expect(readBoundedJsonBody(request, byteLength)).resolves.toEqual({
      kind: "ok",
      value: { message: "Héritage au Cameroun 🇨🇲" },
    });
  });

  it("rejects a declared Content-Length over the limit before reading the body", async () => {
    const request = new Request("https://example.test", {
      method: "POST",
      headers: { "content-length": "101" },
      body: "{}",
    });

    await expect(readBoundedJsonBody(request, 100)).resolves.toEqual({ kind: "too_large" });
  });

  it("enforces the limit against actual streamed bytes when Content-Length is absent", async () => {
    const payload = JSON.stringify({ text: "x".repeat(200) });
    const request = new Request("https://example.test", { method: "POST", body: payload });

    await expect(readBoundedJsonBody(request, 32)).resolves.toEqual({ kind: "too_large" });
  });

  it("returns invalid for malformed JSON", async () => {
    const request = new Request("https://example.test", { method: "POST", body: "{not-json" });

    await expect(readBoundedJsonBody(request, 100)).resolves.toEqual({ kind: "invalid" });
  });

  it("rejects invalid UTF-8 instead of silently replacing invalid bytes", async () => {
    const request = new Request("https://example.test", {
      method: "POST",
      body: new Uint8Array([0x7b, 0x22, 0x78, 0x22, 0x3a, 0xff, 0x7d]),
    });

    await expect(readBoundedJsonBody(request, 100)).resolves.toEqual({ kind: "invalid" });
  });

  it("rejects a missing body", async () => {
    const request = new Request("https://example.test", { method: "POST" });

    await expect(readBoundedJsonBody(request, 100)).resolves.toEqual({ kind: "invalid" });
  });
});
