// Types-only shim: src tests import edge-function handlers, which reference the
// Deno global. The real Deno runtime never loads this file.
export {};

declare global {
  const Deno: {
    env: { get(key: string): string | undefined };
    serve(handler: (req: Request) => Response | Promise<Response>): unknown;
  };
}
