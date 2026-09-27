import { readFileSync, readdirSync } from "node:fs";

const root = new URL("../", import.meta.url);
const migrationDir = new URL("supabase/migrations/", root);
const types = readFileSync(new URL("src/integrations/supabase/types.ts", root), "utf8");

const migrations = readdirSync(migrationDir)
  .filter((name) => name.endsWith(".sql"))
  .sort()
  .map((name) => readFileSync(new URL(`supabase/migrations/${name}`, root), "utf8"))
  .join("\n");

const createdTables = new Set(
  [...migrations.matchAll(/create\s+table\s+(?:if\s+not\s+exists\s+)?public\.([a-zA-Z0-9_]+)/gi)]
    .map((match) => match[1])
);

const missingTables = [...createdTables].filter(
  (table) => !types.includes(`      ${table}:`)
);

const criticalFunctions = [
  "consume_ai_quota",
  "has_effective_permission",
  "create_dossier",
  "register_document_version",
  "claim_command_idempotency",
  "register_inbox_event",
  "claim_outbox_batch",
];

const missingFunctions = criticalFunctions.filter(
  (fn) => !types.includes(`      ${fn}:`)
);

if (missingTables.length || missingFunctions.length) {
  const lines = [];
  if (missingTables.length) lines.push(`Missing Supabase table types: ${missingTables.join(", ")}`);
  if (missingFunctions.length) lines.push(`Missing Supabase function types: ${missingFunctions.join(", ")}`);
  console.error(lines.join("\n"));
  process.exit(1);
}

console.log(`Supabase types synchronized: ${createdTables.size} migrated tables checked.`);
