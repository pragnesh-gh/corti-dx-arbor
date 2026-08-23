#!/usr/bin/env node
/* Catch a working window: loop {create + send to a fresh Arbor-shape agent}
 * until BOTH succeed, then immediately run the full UI drive through the
 * server. Prints each attempt so we can see the flap pattern. */
import * as fs from "node:fs";
const env = Object.fromEntries(
  fs.readFileSync(".env", "utf8").split("\n").filter((l) => l && !l.startsWith("#"))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i), l.slice(i + 1)]; })
);
const BASE = "http://localhost:8787";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function freshHeaders() {
  const tok = (await (await fetch("https://auth.dev-weu.corti.app/realms/base/protocol/openid-connect/token", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "client_credentials", scope: "openid",
      client_id: env.AGENT_API_CLIENT_ID_DEV_WEU, client_secret: env.AGENT_API_CLIENT_SECRET_DEV_WEU }),
  })).json()).access_token;
  return { "Content-Type": "application/json", "Tenant-Name": "base", Authorization: `Bearer ${tok}`, "A2A-Version": "1.0" };
}

console.log("Catching a working window (create+send both must succeed)...");
let windowOpen = false;
for (let i = 1; i <= 40; i++) {
  try {
    const H = await freshHeaders();
    const cr = await fetch("https://api.dev-weu.corti.app/v2/agentic/agents", { method: "POST", headers: H,
      body: JSON.stringify({ name: "ARBOR_CATCH_" + Date.now(), description: "x",
        systemPrompt: "Reply briefly.", lifecycle: "ephemeral", visibility: "private",
        connectors: [{ type: "registry", name: "web-search-expert" }, { type: "registry", name: "medical-calculator-expert" }] }),
      signal: AbortSignal.timeout(20000) });
    if (!cr.ok) { console.log(`  ${i}: create ${cr.status}`); await sleep(5000); continue; }
    const id = (await cr.json()).id;
    const s = await fetch(`https://api.dev-weu.corti.app/v2/agentic/agents/${id}/a2a/message:send`, { method: "POST", headers: H,
      body: JSON.stringify({ message: { role: "ROLE_USER", parts: [{ kind: "text", text: "hi" }], messageId: crypto.randomUUID() }, configuration: { historyLength: 10 } }),
      signal: AbortSignal.timeout(90000) });
    console.log(`  ${i}: create 201, send ${s.status}`);
    await fetch(`https://api.dev-weu.corti.app/v2/agentic/agents/${id}`, { method: "DELETE", headers: H, signal: AbortSignal.timeout(10000) }).catch(() => {});
    if (s.ok) { windowOpen = true; console.log("WINDOW OPEN — running UI drive now..."); break; }
  } catch (e) { console.log(`  ${i}: ${String(e.message || e).slice(0, 60)}`); }
  await sleep(5000);
}

if (!windowOpen) { console.log("No working window in ~3.5min. Platform too unstable."); process.exit(1); }

// Window is open — restart server for a fresh team, then drive immediately
await fetch(`${BASE}/api/health`).catch(() => {});
// (server auto-provisions a fresh team on restart; we just drive the existing fresh team)
async function j(fp) { const r = await fp; if (r.ok) return r.json(); throw new Error(`${r.status} ${(await r.text()).slice(0,80)}`); }

const created = await j(fetch(`${BASE}/api/cases`, { method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ title: "UI drive", chiefComplaint: "Fever and migrating joint pain for 8 days",
    history: "Sore throat 2 weeks ago, joints ache and migrate. Fever 38.5-39C.",
    observations: ["T 38.7C, HR 102", "Swollen tender left knee"], demographics: { ageYears: 19, sex: "male", raceEthnicity: "Northern European", location: "rural Minnesota" } }) }));
console.log("case:", created.id);

const r1 = await j(fetch(`${BASE}/api/cases/${created.id}/advance`, { method: "POST" }));
console.log("\nROUND 1:", r1.decision?.kind, r1.decision?.test?.name || "");
console.log("engine:", (r1.message || "").slice(0, 160));
const snap = await j(fetch(`${BASE}/api/cases/${created.id}`));
const live = Object.values(snap.hypotheses).filter(h => h.status === "live").sort((a,b) => b.probability - a.probability);
console.log("\n=== tree ===");
for (const h of live.slice(0, 8)) console.log(`  ${h.name}: ${(h.probability*100).toFixed(0)}%${h.isZebra?" 🦓":""}`);
console.log("\n=== UI DRIVE COMPLETE ===");
