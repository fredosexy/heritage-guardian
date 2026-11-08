import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const workerPath = resolve("dist/sw.js");
const migrationPath = resolve("dist/pwa-legacy-cache-cleanup.js");

if (!existsSync(workerPath)) {
  throw new Error("Production service worker was not generated at dist/sw.js");
}
if (!existsSync(migrationPath)) {
  throw new Error("Legacy cache migration script was not copied to dist/");
}

const worker = readFileSync(workerPath, "utf8");
const migration = readFileSync(migrationPath, "utf8");

if (!worker.includes("pwa-legacy-cache-cleanup.js")) {
  throw new Error("Generated service worker does not import the legacy cache migration hook");
}
if (!migration.includes('event.waitUntil(caches.delete("supabase-storage"))')) {
  throw new Error("Legacy cache migration hook does not await private cache deletion");
}

console.log("Verified production service worker imports and awaits legacy private-cache cleanup.");
