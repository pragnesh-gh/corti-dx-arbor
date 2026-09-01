/**
 * Treatment planning — the hand-off phase after a working diagnosis.
 *
 * Asks the treatment-planner agent to propose a management plan plus surgical
 * case-finding (where the relevant procedures have been done, outcomes,
 * techniques), and parses its structured response.
 */

import type { CortiClient } from "../corti/client.js";
import { appendEvent } from "./case-store.js";
import { extractJson, textOf } from "./parse.js";
import { withRetry } from "./engine.js";
import type { Case, TreatmentPlan } from "./types.js";

interface RawPlan {
  summary?: string;
  steps?: { title: string; detail?: string; citation?: { label: string; url?: string } }[];
  caseFinding?: {
    summary?: string;
    sites?: { label: string; url?: string; note?: string }[];
  };
}


export async function buildTreatmentPlan(
  client: CortiClient,
  agentId: string,
  c: Case,
): Promise<TreatmentPlan> {
  const dx = c.workingDiagnosis;
  if (!dx) throw new Error("Cannot plan treatment without a working diagnosis.");

  const prompt = `WORKING DIAGNOSIS: ${dx.name}
PATIENT: age ${c.presentation.demographics.ageYears ?? "?"}, ${c.presentation.demographics.sex ?? "?"}, ${c.presentation.demographics.raceEthnicity ?? ""} ${c.presentation.demographics.location ?? ""}
PRESENTATION: ${c.presentation.chiefComplaint}
CONFIDENCE: ${dx.confidence.toFixed(2)}
KEY FINDINGS: ${c.findings.map((f) => f.summary).join("; ")}

TASK
Propose a concise treatment/management plan. For any surgical or specialized procedure, include case-finding: where in the world this has been performed, reported outcomes, and notable technique variations. Return ONLY JSON: { summary, steps:[{title, detail?, citation?{label,url?}}], caseFinding:{summary, sites:[{label, url?, note?}]} }`;

  const resp = await withRetry(() =>
    client.sendMessage(agentId, {
      message: { role: "ROLE_USER", parts: [{ kind: "text", text: prompt }] },
    }),
  );
  const rawText = textOf(resp.message) || textOf(resp.task?.status?.message);
  const parsed = (extractJson(rawText) as RawPlan) || {};
  const plan: TreatmentPlan = {
    summary: parsed.summary || rawText.slice(0, 500) || "No plan synthesized.",
    steps: parsed.steps || [],
    caseFinding: parsed.caseFinding
      ? {
          summary: parsed.caseFinding.summary || "",
          sites: parsed.caseFinding.sites || [],
        }
      : undefined,
    createdAt: new Date().toISOString(),
  };
  c.treatmentPlan = plan;
  c.status = "closed";
  appendEvent(c, {
    round: c.round,
    kind: "treatment",
    summary: "Treatment plan produced",
    payload: plan,
  });
  return plan;
}
