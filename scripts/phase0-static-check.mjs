import { existsSync, readFileSync, readdirSync } from "node:fs";

const root = new URL("../", import.meta.url);
const failures = [];

function read(relativePath) {
  return readFileSync(new URL(relativePath, root), "utf8");
}

function requireCondition(condition, message) {
  if (!condition) failures.push(message);
}

requireCondition(!existsSync(new URL(".env", root)), ".env must not be versioned");
requireCondition(existsSync(new URL(".env.example", root)), ".env.example is required");
requireCondition(existsSync(new URL("package-lock.json", root)), "package-lock.json is required");

const packageJson = JSON.parse(read("package.json"));
requireCondition(packageJson.scripts?.typecheck, "typecheck script is required");
requireCondition(packageJson.scripts?.check, "aggregate check script is required");

const gitignore = read(".gitignore");
requireCondition(gitignore.includes(".env.*"), "environment files must be ignored");
requireCondition(gitignore.includes("!.env.example"), ".env.example must remain versioned");

const assistant = read("src/services/assistant.service.ts");
requireCondition(assistant.includes("access_token"), "AI calls must use the authenticated access token");
requireCondition(
  !assistant.includes("Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`"),
  "AI calls must not authenticate with the public key"
);
requireCondition(
  assistant.includes("buildSafeDossierProjection") && !assistant.includes("dossier: params.dossier"),
  "Vita contextual calls must use the safe minimized dossier projection"
);

const edgeSecurity = read("supabase/functions/_shared/security.ts");
requireCondition(
  edgeSecurity.includes("APP_ALLOWED_ORIGINS"),
  "Edge Functions must support an explicit allowed-origin configuration"
);
requireCondition(
  !edgeSecurity.includes('"Access-Control-Allow-Origin": "*"'),
  "Edge Functions must not use wildcard CORS"
);

const edgeConfig = read("supabase/config.toml");
for (const fn of ["ai-chat", "ai-context", "notify-alerts"]) {
  const block = new RegExp(`\\[functions\\.${fn}\\][\\s\\S]*?verify_jwt\\s*=\\s*true`);
  requireCondition(block.test(edgeConfig), `${fn} must require platform JWT verification`);
}

const viteConfig = read("vite.config.ts");
requireCondition(
  !viteConfig.includes("supabase-storage") && !viteConfig.includes("supabase\\.co\\/storage"),
  "Private Supabase Storage responses must not be cached by the service worker"
);

const offlineSync = read("src/data/offline/sync.ts");
requireCondition(
  offlineSync.includes("Unsupported offline operation"),
  "unsupported offline operations must remain visible and retryable"
);

const migrationDir = new URL("supabase/migrations/", root);
const migrations = readdirSync(migrationDir).filter((name) => name.endsWith(".sql")).sort();
requireCondition(migrations.length >= 5, "Phase 0 migrations are missing");
requireCondition(
  migrations.some((name) => name.includes("create_avatars_bucket")),
  "avatars bucket migration is required"
);
requireCondition(
  migrations.some((name) => name.includes("ai_rate_limits")),
  "AI rate-limit migration is required"
);
requireCondition(
  migrations.some((name) => name.includes("dossier_idempotency")),
  "dossier idempotency migration is required"
);

requireCondition(
  offlineSync.includes('onConflict: "user_id,client_operation_id"') ||
    (offlineSync.includes('.rpc("create_dossier"') && offlineSync.includes("p_client_operation_id: draft.localId")),
  "offline dossier creation must be idempotent"
);

for (const relativePath of [
  "supabase/functions/ai-chat/index.ts",
  "supabase/functions/ai-context/index.ts",
  "supabase/functions/notify-alerts/index.ts",
]) {
  requireCondition(existsSync(new URL(relativePath, root)), `${relativePath} is missing`);
}

if (failures.length) {
  console.error(`Phase 0 static checks failed:\n- ${failures.join("\n- ")}`);
  process.exit(1);
}

console.log("Phase 0 static checks passed");
