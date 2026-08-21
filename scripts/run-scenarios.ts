/**
 * Headless scenario runner: drive each example scenario through the engine
 * with canned findings and print a compact per-scenario verdict. Useful for
 * verifying the system end-to-end without the UI.
 *
 * Usage: npm run scenarios
 */

import "dotenv/config";

import { CortiClient } from "../server/corti/client.js";
import { provisionTeam, teardownTeam } from "../server/domain/agent-manager.js";
import { createCase } from "../server/domain/case-factory.js";
import { recordFinding, runRound, setWorkingDiagnosis } from "../server/domain/engine.js";
import type { Case, Presentation } from "../server/domain/types.js";

const SCENARIOS: { title: string; p: Presentation; canned: string[] }[] = [
  {
    title: "fever + migrating joint pain",
    p: {
      chiefComplaint: "Fever and migrating joint pain for 8 days",
      history: "Sore throat 2 weeks ago, now large joints ache and migrate. Fever 38.5–39°C.",
      observations: ["T 38.7°C", "Swollen tender left knee, right ankle"],
      demographics: { ageYears: 19, sex: "male", raceEthnicity: "Northern European", location: "rural Minnesota, USA" },
    },
    canned: ["ASO titer 850 IU/mL (elevated)", "Throat PCR positive for group A strep", "Echo: no vegetations", "ANA/RF negative"],
  },
  {
    title: "chronic cough + weight loss (traveler)",
    p: {
      chiefComplaint: "Cough for 6 weeks and 6 kg weight loss",
      history: "Productive cough, night sweats. Returned 10 wks ago from 3 months in rural East Africa. Ex-smoker.",
      observations: ["Crackles at right apex", "BMI 20.1"],
      demographics: { ageYears: 44, sex: "male", raceEthnicity: "East African", location: "Mombasa, Kenya", comorbidities: ["type 2 diabetes"] },
    },
    canned: ["Chest X-ray: right upper-lobe infiltrate + cavity", "Sputum AFB smear positive", "GeneXpert MTB/RIF: MTB detected, rifampicin susceptible", "HIV test negative"],
  },
];

const MAX_ROUNDS = 4;

function liveSorted(c: Case): Case["hypotheses"][string][] {
  return Object.values(c.hypotheses)
    .filter((h) => h.status === "live")
    .sort((a, b) => b.probability - a.probability);
}

async function runOne(client: CortiClient, agentId: string, title: string, p: Presentation, canned: string[]) {
  const c = createCase(p, title);
  console.log(`\n═══════ ${title} ═══════`);
  console.log(`presentation: ${p.chiefComplaint}`);
  let idx = 0;
  for (let r = 0; r < MAX_ROUNDS; r++) {
    const result = await runRound(client, agentId, c);
    const live = liveSorted(c).slice(0, 5);
    console.log(`round ${r + 1}: ${result.message.slice(0, 100)}`);
    console.log(`  live: ${live.map((h) => `${h.name} ${(h.probability * 100).toFixed(0)}%`).join(" | ")}`);
    if (result.decision.kind === "converged") {
      setWorkingDiagnosis(c, result.decision.hypothesisId, result.decision.confidence, result.message);
      break;
    }
    if (result.decision.kind === "test" && idx < canned.length) {
      recordFinding(c, { summary: canned[idx++], direction: "supports", source: "lab", testId: result.decision.test.id });
    } else if (r === MAX_ROUNDS - 1) {
      const top = liveSorted(c)[0];
      if (top) setWorkingDiagnosis(c, top.id, top.probability, "Converged (max rounds).");
    }
  }
  if (c.workingDiagnosis) {
    console.log(`→ working dx: ${c.workingDiagnosis.name} (${(c.workingDiagnosis.confidence * 100).toFixed(0)}%)`);
    console.log(`  trail: ${c.workingDiagnosis.reasoningTrail.slice(0, 4).join(" → ")}`);
  } else {
    console.log("→ no working dx");
  }
  return c;
}

async function main() {
  const client = CortiClient.fromEnv();
  const team = await provisionTeam(client);
  try {
    for (const s of SCENARIOS) {
      await runOne(client, team.hypothesisEngine.id, s.title, s.p, s.canned);
    }
    console.log("\n[scenarios] ✓ done");
  } finally {
    await teardownTeam(client, team);
  }
}

main().catch((e) => {
  console.error("[scenarios] failed:", e);
  process.exit(1);
});
