#!/usr/bin/env node
/* Drive the Arbor server exactly like the UI would: create a case from a
 * scenario, advance a round, enter a finding, advance again. Prints the tree
 * so we can see the UI loop works end to end through the server API. */
const BASE = "http://localhost:8787";

async function j(res) { return res.ok ? res.json() : Promise.reject(new Error(`${res.status} ${await res.text()}`)); }

const created = await j(await fetch(`${BASE}/api/cases`, {
  method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    title: "UI drive: fever + joint pain",
    chiefComplaint: "Fever and migrating joint pain for 8 days",
    history: "Sore throat 2 weeks ago, now large joints (knees, ankles) ache and migrate. Fever 38.5-39C.",
    observations: ["T 38.7C, HR 102", "Swollen tender left knee, right ankle", "No tick bite"],
    demographics: { ageYears: 19, sex: "male", raceEthnicity: "Northern European", location: "rural Minnesota, USA" },
  }),
}));
console.log("created case:", created.id);
console.log("initial hypotheses:", Object.keys(created.hypotheses || {}).length);

// Round 1
const r1 = await j(await fetch(`${BASE}/api/cases/${created.id}/advance`, { method: "POST" }));
console.log("\nround 1 decision:", r1.decision?.kind, r1.decision?.test?.name || "");
console.log("engine:", (r1.message || "").slice(0, 120));

const snap1 = await j(await fetch(`${BASE}/api/cases/${created.id}`));
const live1 = Object.values(snap1.hypotheses).filter(h => h.status === "live");
console.log("live hypotheses after round 1:", live1.length);
for (const h of live1.slice(0, 6)) console.log(`  ${h.name}: ${(h.probability*100).toFixed(0)}%${h.isZebra?" 🦓":""}`);

// Enter a finding (clinician at HITL gate)
const f = await j(await fetch(`${BASE}/api/cases/${created.id}/finding`, {
  method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ note: "ASO titer 850 IU/mL (ref <200) — elevated" }),
}));
console.log("\nfinding entered, awaitingHitl:", f.awaitingHitl);

// Round 2
const r2 = await j(await fetch(`${BASE}/api/cases/${created.id}/advance`, { method: "POST" }));
console.log("\nround 2 decision:", r2.decision?.kind, r2.decision?.test?.name || "");
console.log("engine:", (r2.message || "").slice(0, 120));

const snap2 = await j(await fetch(`${BASE}/api/cases/${created.id}`));
const live2 = Object.values(snap2.hypotheses).filter(h => h.status === "live");
console.log("\n=== tree after round 2 ===");
for (const h of live2.slice(0, 8)) console.log(`  ${h.name}: ${(h.probability*100).toFixed(0)}%${h.isZebra?" 🦓":""}`);

console.log("\n=== UI drive complete — server API loop works ===");
