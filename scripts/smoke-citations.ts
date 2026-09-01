/**
 * Live smoke test for the citation pipeline (ADR 0003).
 *
 * Runs two rounds against the real Corti dev platform, firing the hypothesis
 * engine and the evidence pass in parallel exactly as the /advance handler
 * does, then prints what the pipeline actually produced: the source pool, which
 * prose carries markers, and — the point of the whole exercise — whether every
 * rendered marker resolves to a real source.
 *
 * Round 2 is what proves the pipelining: it should be able to cite the sources
 * round 1's evidence pass gathered.
 *
 * Usage: npx tsx scripts/smoke-citations.ts
 */

import "dotenv/config";

import { CortiClient } from "../server/corti/client.js";
import { provisionTeam } from "../server/domain/agent-manager.js";
import { createCase } from "../server/domain/case-factory.js";
import { runRound } from "../server/domain/engine.js";
import { applyEvidence, fetchEvidence } from "../server/domain/evidence.js";
import { citedIndices } from "../server/domain/sources.js";
import type { Case, Presentation } from "../server/domain/types.js";

const SCENARIO: Presentation = {
  chiefComplaint: "Sudden pleuritic chest pain and breathlessness for 6 hours",
  history: "Long-haul flight 3 days ago. No cough, no fever. Mild left calf ache.",
  observations: ["HR 112, RR 24, SpO2 92% on air", "BP 118/74", "Calf mildly tender, no swelling"],
  demographics: {
    ageYears: 64,
    sex: "female",
    raceEthnicity: "White British",
    location: "Manchester, UK",
    comorbidities: ["hypertension", "on combined HRT"],
  },
};

/** Every marker rendered anywhere in the case, with the prose it came from. */
function allMarkers(c: Case): { where: string; text: string; indices: number[] }[] {
  const out: { where: string; text: string; indices: number[] }[] = [];
  const add = (where: string, text?: string) => {
    const idx = citedIndices(text);
    if (idx.length) out.push({ where, text: text!, indices: idx });
  };
  for (const h of Object.values(c.hypotheses)) {
    add(`hypothesis(${h.name}).description`, h.description);
    add(`hypothesis(${h.name}).baseRateNote`, h.baseRateNote);
    for (const t of h.discriminatingTests || []) add(`test(${t.name}).rationale`, t.rationale);
  }
  for (const f of c.findings) {
    add(`finding.summary`, f.summary);
    add(`finding.detail`, f.detail);
  }
  return out;
}

async function main() {
  const client = CortiClient.fromEnv();
  console.log("provisioning team...");
  const team = await provisionTeam(client);

  const c = createCase(SCENARIO, "Citation smoke — suspected PE");

  for (const round of [1, 2]) {
    console.log(`\n=== round ${round}: engine + evidence pass in parallel ===`);
    const t0 = Date.now();
    const poolBefore = c.sources.length;
    // Same shape as the /advance handler: fetch concurrently, apply after.
    const evidenceFetch = fetchEvidence(client, team.evidenceOrchestrator.id, c);
    const engine = await Promise.allSettled([runRound(client, team.hypothesisEngine.id, c)]).then(
      (r) => r[0]!,
    );
    const evidence = applyEvidence(c, await evidenceFetch);
    const secs = ((Date.now() - t0) / 1000).toFixed(1);

    console.log(`wall clock: ${secs}s (parallel — NOT the sum of both legs)`);
    console.log(
      `engine: ${engine.status}${engine.status === "fulfilled" ? ` — ${engine.value.hypotheses.length} hypotheses` : ` — ${engine.reason}`}`,
    );
    console.log(
      `evidence pass: ${evidence.sources.length} new sources, ${evidence.findings.length} grounded findings`,
    );
    console.log(`source pool: ${poolBefore} -> ${c.sources.length}`);
  }

  console.log("\n=== source pool ===");
  for (const s of c.sources) {
    console.log(`  [${s.index}] (${s.type}, round ${s.addedRound}) ${s.title}`);
    console.log(`       ${s.identifier || "no id"} ${s.url || ""}`);
  }

  console.log("\n=== prose carrying inline markers ===");
  const markers = allMarkers(c);
  if (!markers.length) console.log("  (none — the model cited nothing)");
  for (const m of markers) console.log(`  ${m.where} -> [${m.indices.join(", ")}]\n    "${m.text}"`);

  console.log("\n=== the invariant: every rendered marker resolves ===");
  const valid = new Set(c.sources.map((s) => s.index));
  const dangling = markers.flatMap((m) =>
    m.indices.filter((i) => !valid.has(i)).map((i) => `${m.where} -> [${i}]`),
  );
  if (dangling.length) {
    console.log(`  FAIL — ${dangling.length} dangling marker(s):`);
    for (const d of dangling) console.log(`    ${d}`);
    process.exitCode = 1;
  } else {
    console.log(`  PASS — ${markers.length} cited passage(s), 0 dangling, ${c.sources.length} sources`);
  }
}

main().catch((e) => {
  console.error("smoke failed:", e);
  process.exit(1);
});
