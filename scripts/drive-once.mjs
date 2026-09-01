#!/usr/bin/env node
/* Clean single-round test of sendMessageReliable. Creates a fresh case,
 * advances ONE round, prints the real decision + hypotheses from the case
 * snapshot. Does NOT rely on the in-memory store surviving restarts. */
const BASE = "http://localhost:8787";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function j(fp) { const r = await fp; if (!r.ok) throw new Error(`${r.status} ${(await r.text()).slice(0,120)}`); return r.json(); }

console.log("Creating case...");
const c = await j(fetch(`${BASE}/api/cases`, { method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    title: "reliable-send test",
    chiefComplaint: "Fever and migrating joint pain for 8 days",
    history: "Sore throat 2 weeks ago, now large joints (knees, ankles) ache and migrate. Fever 38.5-39C.",
    observations: ["T 38.7C, HR 102", "Swollen tender left knee, right ankle", "No tick bite"],
    demographics: { ageYears: 19, sex: "male", raceEthnicity: "Northern European", location: "rural Minnesota, USA" },
  }) }));
console.log("case:", c.id);

console.log("Advancing round 1 (may take 1-3 min; the model genuinely thinks)...");
const t0 = Date.now();
try {
  const snap = await j(fetch(`${BASE}/api/cases/${c.id}/advance`, { method: "POST" }));
  const dt = ((Date.now() - t0) / 1000).toFixed(0);
  console.log(`\n=== round 1 done in ${dt}s ===`);
  console.log("case status:", snap.status);
  console.log("round:", snap.round);
  const hyps = Object.values(snap.hypotheses || {});
  console.log("hypotheses:", hyps.length);
  for (const h of hyps.sort((a,b)=>(b.probability||0)-(a.probability||0)).slice(0,8))
    console.log(`  ${h.name}: ${((h.probability||0)*100).toFixed(0)}%${h.isZebra?" 🦓":""} [${h.status}]`);
  const evs = snap.events || [];
  console.log("events:", evs.length);
  for (const e of evs.slice(-3)) console.log("  ev:", e.kind, "-", (e.summary||"").slice(0,100));
  console.log("awaitingHitl:", snap.awaitingHitl, snap.hitlPrompt ? "-> " + snap.hitlPrompt.slice(0,80) : "");
} catch (e) {
  const dt = ((Date.now() - t0) / 1000).toFixed(0);
  console.log(`\n=== round 1 FAILED after ${dt}s ===`);
  console.log(e.message);
}
