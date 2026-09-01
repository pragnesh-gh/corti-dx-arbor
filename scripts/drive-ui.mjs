#!/usr/bin/env node
/* Drive the Arbor server exactly like the UI would, with resilience to the
 * dev-weu platform flapping (404 / timeout windows). Retries a round across
 * windows until it succeeds or gives up. Prints the decision tree. */
const BASE = "http://localhost:8787";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function j(fetchPromise) {
  const res = await fetchPromise;
  if (!res || typeof res.text !== "function") {
    throw new Error(`non-Response received: ${String(res).slice(0, 80)}`);
  }
  if (res.ok) return res.json();
  const t = await res.text().catch(() => "");
  throw new Error(`${res.status} ${t.slice(0, 120)}`);
}

async function retry(label, fn, attempts = 30, backoffMs = 8000) {
  for (let i = 1; i <= attempts; i++) {
    try { return await fn(); }
    catch (e) {
      const msg = String(e.message || e).slice(0, 100);
      if (i === attempts) throw e;
      console.log(`  ${label} attempt ${i}/${attempts} failed (${msg}), retrying in ${backoffMs/1000}s...`);
      await sleep(backoffMs);
    }
  }
}

const created = await retry("create", () => j(fetch(`${BASE}/api/cases`, {
  method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    title: "UI drive: fever + joint pain",
    chiefComplaint: "Fever and migrating joint pain for 8 days",
    history: "Sore throat 2 weeks ago, now large joints (knees, ankles) ache and migrate. Fever 38.5-39C.",
    observations: ["T 38.7C, HR 102", "Swollen tender left knee, right ankle", "No tick bite"],
    demographics: { ageYears: 19, sex: "male", raceEthnicity: "Northern European", location: "rural Minnesota, USA" },
  }),
})));
console.log("created case:", created.id);

// Round 1
const r1 = await retry("round1", () => j(fetch(`${BASE}/api/cases/${created.id}/advance`, { method: "POST" })));
console.log("\nround 1 decision:", r1.decision?.kind, r1.decision?.test?.name || "");
console.log("engine:", (r1.message || "").slice(0, 140));

// Enter a finding (clinician at HITL gate)
await retry("finding", () => j(fetch(`${BASE}/api/cases/${created.id}/finding`, {
  method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ note: "ASO titer 850 IU/mL (ref <200) — elevated" }),
})));
console.log("finding entered");

// Round 2
const r2 = await retry("round2", () => j(fetch(`${BASE}/api/cases/${created.id}/advance`, { method: "POST" })));
console.log("\nround 2 decision:", r2.decision?.kind, r2.decision?.test?.name || "");
console.log("engine:", (r2.message || "").slice(0, 140));

// Final snapshot + tree
const snap = await retry("snapshot", () => j(fetch(`${BASE}/api/cases/${created.id}`)));
const live = Object.values(snap.hypotheses).filter(h => h.status === "live").sort((a,b) => b.probability - a.probability);
console.log("\n=== decision tree (live hypotheses) ===");
for (const h of live.slice(0, 10)) console.log(`  ${h.name}: ${(h.probability*100).toFixed(0)}%${h.isZebra?" 🦓":""}`);

console.log("\n=== UI drive complete — server API loop works ===");
