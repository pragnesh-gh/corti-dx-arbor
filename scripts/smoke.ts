/**
 * End-to-end smoke test against the live Corti Agent API (dev-WEU).
 *
 * Provisions the team, creates a case from a scenario, runs rounds until the
 * engine converges or maxRounds, entering canned findings at HITL gates to
 * demonstrate the narrowing. Prints the final tree, working diagnosis, and
 * treatment plan.
 *
 * Usage: npm run smoke
 */

import "dotenv/config";

import { CortiClient } from "../server/corti/client.js";
import { provisionTeam, teardownTeam } from "../server/domain/agent-manager.js";
import { createCase } from "../server/domain/case-factory.js";
import { recordFinding, runRound, setWorkingDiagnosis } from "../server/domain/engine.js";
import { buildTreatmentPlan } from "../server/domain/treatment.js";
import type { Case, Presentation } from "../server/domain/types.js";

const SCENARIO: Presentation = {
  chiefComplaint: "Fever and migrating joint pain for 8 days",
  history:
    "Sore throat 2 weeks ago, now large joints (knees, ankles) ache and migrate over days. Fever 38.5–39°C.",
  observations: ["T 38.7°C, HR 102", "Swollen tender left knee, right ankle", "No tick bite"],
  demographics: {
    ageYears: 19,
    sex: "male",
    raceEthnicity: "Northern European",
    location: "rural Minnesota, USA",
  },
};

const MAX_ROUNDS = 4;

function depthOf(c: Case, id: string): number {
  let d = 0;
  let cur = c.hypotheses[id];
  while (cur?.parentId) {
    d++;
    cur = c.hypotheses[cur.parentId];
  }
  return d;
}

function printTree(c: Case) {
  console.log("\n=== Hypothesis tree ===");
  const sorted = Object.values(c.hypotheses).sort((a, b) => depthOf(c, a.id) - depthOf(c, b.id));
  for (const h of sorted) {
    const indent = "  ".repeat(depthOf(c, h.id));
    const pct = h.status === "live" || h.status === "confirmed" ? ` ${(h.probability * 100).toFixed(0)}%` : "";
    const mark = h.isZebra ? " 🦓" : "";
    const parent = h.parentId ? `  (branch of ${c.hypotheses[h.parentId]?.name})` : "";
    console.log(`${indent}[${h.status.padEnd(9)}] ${h.name}${pct}${mark}${parent}`);
  }
}

async function main() {
  const client = CortiClient.fromEnv();
  console.log("[smoke] provisioning team…");
  const team = await provisionTeam(client);

  try {
    const c = createCase(SCENARIO, "smoke: fever + joint pain");
    console.log(`[smoke] case ${c.id} created`);

    // Canned test results to feed at HITL gates (simulates a clinician).
    const cannedResults = [
      "ASO titer 850 IU/mL (reference <200) — elevated",
      "Throat swab PCR positive for group A streptococcus",
      "Echocardiogram: no valvular vegetations",
      "ANA negative, RF negative",
    ];
    let resultIdx = 0;

    for (let r = 0; r < MAX_ROUNDS; r++) {
      console.log(`\n--- round ${r + 1} ---`);
      const result = await runRound(client, team.hypothesisEngine.id, c);
      console.log(`engine: ${result.message.slice(0, 160)}`);
      console.log(`decision: ${result.decision.kind}${result.decision.kind === "test" ? ` → ${result.decision.test.name}` : ""}`);
      console.log(`new findings: ${result.findings.length}, pruned: ${result.pruned.length}`);

      if (result.decision.kind === "converged") {
        setWorkingDiagnosis(c, result.decision.hypothesisId, result.decision.confidence, result.message);
        break;
      }
      if (result.decision.kind === "test" && resultIdx < cannedResults.length) {
        const f = recordFinding(c, {
          summary: cannedResults[resultIdx],
          direction: "supports",
          source: "lab",
          testId: result.decision.test.id,
        });
        resultIdx++;
        console.log(`[clinician] entered: ${f.summary}`);
      } else if (r === MAX_ROUNDS - 1) {
        const top = Object.values(c.hypotheses)
          .filter((h) => h.status === "live")
          .sort((a, b) => b.probability - a.probability)[0];
        if (top) setWorkingDiagnosis(c, top.id, top.probability, "Converged (max rounds reached).");
      }
    }

    printTree(c);

    if (c.workingDiagnosis) {
      console.log("\n=== Working diagnosis ===");
      console.log(`${c.workingDiagnosis.name} (confidence ${(c.workingDiagnosis.confidence * 100).toFixed(0)}%)`);
      console.log("reasoning trail:");
      for (const step of c.workingDiagnosis.reasoningTrail) console.log(`  - ${step}`);

      console.log("\n[smoke] building treatment plan…");
      const plan = await buildTreatmentPlan(client, team.treatmentPlanner.id, c);
      console.log("plan:", plan.summary.slice(0, 200));
      if (plan.caseFinding) console.log("case-finding sites:", plan.caseFinding.sites.length);
      console.log("\n[smoke] ✓ end-to-end cycle complete");
    } else {
      console.log("\n[smoke] no working diagnosis reached.");
    }
  } finally {
    await teardownTeam(client, team);
  }
}

main().catch((e) => {
  console.error("[smoke] failed:", e);
  process.exit(1);
});
