import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

const apiUrl = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const functionsUrl = process.env.SUPABASE_FUNCTIONS_URL ?? `${apiUrl}/functions/v1`;

for (const [name, value] of Object.entries({ SUPABASE_URL: apiUrl, SUPABASE_ANON_KEY: anonKey, SUPABASE_SERVICE_ROLE_KEY: serviceKey })) {
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
}

const adminHeaders = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json" };
const anonHeaders = { apikey: anonKey, "Content-Type": "application/json" };
const createdUsers = [];
const createdDossiers = [];
const password = `Edge-test-${randomUUID()}-Aa9!`;

async function jsonRequest(url, init = {}) {
  const response = await fetch(url, init);
  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { /* status assertions still report response text */ }
  return { response, data, text };
}

async function createUser(label) {
  const email = `edge-${label}-${randomUUID()}@example.invalid`;
  const { response, data, text } = await jsonRequest(`${apiUrl}/auth/v1/admin/users`, {
    method: "POST",
    headers: adminHeaders,
    body: JSON.stringify({ email, password, email_confirm: true }),
  });
  assert.equal(response.status, 200, `create user failed: ${response.status} ${text}`);
  const userId = data.id;
  createdUsers.push(userId);
  const login = await jsonRequest(`${apiUrl}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: anonHeaders,
    body: JSON.stringify({ email, password }),
  });
  assert.equal(login.response.status, 200, `login failed: ${login.response.status} ${login.text}`);
  return { id: userId, token: login.data.access_token };
}

async function restInsert(table, row) {
  const { response, text } = await jsonRequest(`${apiUrl}/rest/v1/${table}`, {
    method: "POST",
    headers: { ...adminHeaders, Prefer: "return=minimal" },
    body: JSON.stringify(row),
  });
  assert.ok(response.ok, `insert ${table} failed: ${response.status} ${text}`);
}

async function callFunction(name, token, body) {
  return jsonRequest(`${functionsUrl}/${name}`, {
    method: "POST",
    headers: {
      apikey: anonKey,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

try {
  const owner = await createUser("owner");
  const participant = await createUser("participant");
  const outsider = await createUser("outsider");
  const rateUser = await createUser("rate");
  const dossierId = randomUUID();
  createdDossiers.push(dossierId);

  await restInsert("dossiers", { id: dossierId, user_id: owner.id, type: "terrain", title: "Edge integration test" });
  await restInsert("participants", { dossier_id: dossierId, user_id: participant.id, role: "viewer", accepted_at: new Date().toISOString() });

  // Auth must be enforced by the actual local Edge runtime, not mocked handlers.
  const unauthenticated = await callFunction("ai-chat", null, { messages: [{ role: "user", content: "Bonjour" }] });
  assert.equal(unauthenticated.response.status, 401, `unauthenticated ai-chat: ${unauthenticated.response.status} ${unauthenticated.text}`);

  // With the gateway key intentionally absent, authorized calls reach the handler's
  // configured-service check; inaccessible dossiers must be rejected before that.
  const ownerContext = await callFunction("ai-context", owner.token, { dossier: { id: dossierId } });
  assert.equal(ownerContext.response.status, 200, `owner context: ${ownerContext.response.status} ${ownerContext.text}`);
  assert.deepEqual(ownerContext.data?.suggestions, []);

  const participantContext = await callFunction("ai-context", participant.token, { dossier: { id: dossierId } });
  assert.equal(participantContext.response.status, 200, `participant context: ${participantContext.response.status} ${participantContext.text}`);

  const outsiderContext = await callFunction("ai-context", outsider.token, { dossier: { id: dossierId } });
  assert.equal(outsiderContext.response.status, 404, `outsider context: ${outsiderContext.response.status} ${outsiderContext.text}`);
  assert.equal(outsiderContext.data?.error, "dossier_not_found");

  // Missing gateway credentials make valid requests fail closed with 503.
  const authorizedChat = await callFunction("ai-chat", rateUser.token, { messages: [{ role: "user", content: "Bonjour" }] });
  assert.equal(authorizedChat.response.status, 503, `authorized chat without gateway key: ${authorizedChat.response.status} ${authorizedChat.text}`);

  // ai-chat allows 12 requests/minute per user. The 13th must be rate-limited.
  let last;
  for (let i = 1; i < 13; i++) {
    last = await callFunction("ai-chat", rateUser.token, { messages: [{ role: "user", content: "test" }] });
    if (i < 12) assert.equal(last.response.status, 503, `request ${i}: ${last.response.status} ${last.text}`);
  }
  last = await callFunction("ai-chat", rateUser.token, { messages: [{ role: "user", content: "test" }] });
  assert.equal(last.response.status, 429, `rate limit: ${last.response.status} ${last.text}`);

  console.log("Edge integration passed: unauthenticated, owner, accepted participant, outsider, missing gateway key, rate limit.");
} finally {
  // Cleanup is best-effort and only touches the disposable local stack.
  for (const id of createdDossiers) {
    await jsonRequest(`${apiUrl}/rest/v1/dossiers?id=eq.${id}`, { method: "DELETE", headers: adminHeaders }).catch(() => {});
  }
  for (const id of createdUsers) {
    await jsonRequest(`${apiUrl}/auth/v1/admin/users/${id}`, { method: "DELETE", headers: adminHeaders }).catch(() => {});
  }
}
