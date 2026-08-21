/**
 * Treatment planning — the hand-off phase after a working diagnosis.
 *
 * Asks the treatment-planner agent to propose a management plan plus surgical
 * case-finding (where the relevant procedures have been done, outcomes,
 * techniques), and parses its structured response.
 */

import type { CortiClient } from "../corti/client.js";
import type { A2AMessage } from "../corti/types.js";
import { appendEvent } from "./case-store.js";
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

function textOf(msg: A2AMessage | undefined): string {
  if (!msg) return "";
  return (msg.parts || [])
    .map((p) => p.text || "")
    .filter(Boolean)
    .join("\n")
    .trim();
}

function extractJson(text: string): unknown | null {
  if (!text) return null;
  let t = text.trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence && fence[1]) t = fence[1].trim();
  try {
    return JSON.parse(t);
  } catch {
    /* fall through */
  }
  const start = t.indexOf("{");
  if (start === -1) return null;
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = start; i < t.length; i++) {
    const ch = t[i];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === "\\") esc = true;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') inStr = true;
    else if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        try {
          return JSON.parse(t.slice(start, i + 1));
        } catch {
          return null;
        }
      }
    }
  }
  return null;
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
