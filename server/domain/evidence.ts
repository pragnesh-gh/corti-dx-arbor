/**
 * The evidence pass — the literature fan-out that grounds Arbor's citations.
 *
 * `arbor-evidence` is wired to pubmed / clinical-trials / drugbank / coding /
 * web-search. Before ADR 0003 it was provisioned at boot and never sent a
 * message, so every "citation" in the product was a label the reasoning model
 * wrote from memory. This module is what actually asks the experts.
 *
 * It runs **in parallel** with the hypothesis engine and is **pipelined**: what
 * it returns this round becomes Findings now, and the citable Source pool for
 * the *next* round's hypothesis prompt. That keeps round latency flat while
 * still letting the engine cite real literature from round 2 onward. See
 * docs/adr/0003-grounded-inline-citations.md.
 *
 * The pass is best-effort by design: a timeout or a dev-WEU platform flap
 * degrades the round to hypothesis-only rather than failing it. Missing
 * grounding is acceptable; pretending to have it is not.
 *
 * It is deliberately split in two. `fetchEvidence` talks to the experts and
 * mutates nothing, so it can run concurrently with the hypothesis engine — and
 * be retried, or abandoned, without leaving half a round behind.
 * `applyEvidence` folds the result into the Case afterwards, when the engine's
 * own merge is done, so findings attach to the differential as it ends the
 * round rather than racing the engine's upserts mid-flight.
 */

import type { CortiClient } from "../corti/client.js";
import type { A2AMessage } from "../corti/types.js";
import { appendEvent, newId } from "./case-store.js";
import { extractJson, textOf } from "./parse.js";
import { mergeSources, resolveRefs, rewriteMarkers, type RawSource } from "./sources.js";
import type { Case, Finding, Source } from "./types.js";

/** How many live hypotheses the pass will research in one round. */
const MAX_HYPOTHESES = 3;
/** Hard ceiling on the pass; the round proceeds without it past this. */
const TIMEOUT_MS = 150_000;

interface RawEvidence {
  sources?: RawSource[];
  findings?: {
    summary: string;
    detail?: string;
    direction?: "supports" | "against" | "neutral";
    hypothesisNames?: string[];
    /** Refs into this response's own `sources[]`, e.g. ["N1"]. */
    sourceRefs?: string[];
  }[];
}

export interface EvidencePassResult {
  sources: Source[];
  findings: Finding[];
}

const EMPTY: EvidencePassResult = { sources: [], findings: [] };

function findByName(c: Case, name: string) {
  const target = name.trim().toLowerCase();
  return Object.values(c.hypotheses).find((h) => h.name.trim().toLowerCase() === target);
}

function buildPrompt(c: Case, targets: { name: string; description?: string }[]): string {
  const d = c.presentation.demographics;
  const demo = [
    d.ageYears != null && `age ${d.ageYears}`,
    d.sex,
    d.raceEthnicity,
    d.location && `location: ${d.location}`,
    d.comorbidities?.length && `comorbidities: ${d.comorbidities.join(", ")}`,
  ]
    .filter(Boolean)
    .join(", ");

  return `PATIENT CONTEXT
Chief complaint: ${c.presentation.chiefComplaint}
${c.presentation.history ? `History: ${c.presentation.history}\n` : ""}${demo ? `Demographics: ${demo}\n` : ""}
HYPOTHESES TO GROUND (round ${c.round})
${targets.map((t) => `- ${t.name}${t.description ? ` — ${t.description}` : ""}`).join("\n")}

TASK
Use your experts to find real, checkable evidence bearing on these hypotheses in
this patient: prevalence/base rates in this demographic, test characteristics
(sensitivity/specificity/likelihood ratios), and any guideline or trial that
supports or argues against a hypothesis.

Rules:
- Every source must be one an expert actually returned. NEVER invent a citation,
  a DOI, a PMID, or a URL. If the experts return nothing useful, return empty
  arrays — that is a valid and useful answer.
- Give each source a local ref "N1", "N2", ... and cite those refs from findings.
- Keep each finding to one sentence, and state its direction for the named
  hypothesis.

Respond with ONLY this JSON object, no prose and no markdown fences:
{"sources":[{"ref":"N1","title":string,"url":string,"identifier":string,"type":"paper"|"trial"|"guideline"|"drug"|"code"|"calculator"|"web","note":string}],
 "findings":[{"summary":string,"detail":string,"direction":"supports"|"against"|"neutral","hypothesisNames":[string],"sourceRefs":["N1"]}]}`;
}

/**
 * Ask the experts for evidence on the case's live hypotheses. Mutates nothing —
 * hand the result to `applyEvidence` once the round's engine leg has landed.
 *
 * Never throws: on timeout, platform error, or unparseable output it returns
 * null and the round continues ungrounded.
 */
export async function fetchEvidence(
  client: CortiClient,
  agentId: string,
  c: Case,
  opts: { onStaleAgent?: (agentId: string) => Promise<string | void> } = {},
): Promise<RawEvidence | null> {
  const targets = Object.values(c.hypotheses)
    .filter((h) => h.status === "live")
    .sort((a, b) => b.probability - a.probability)
    .slice(0, MAX_HYPOTHESES);

  // Round 1 has no differential yet; ground the chief complaint instead so the
  // pool is non-empty by the time round 2 wants to cite it.
  const asked = targets.length
    ? targets.map((h) => ({ name: h.name, description: h.description }))
    : [{ name: c.presentation.chiefComplaint, description: "differential not yet generated" }];

  let raw: RawEvidence | null = null;
  try {
    const resp = await withTimeout(
      client.sendMessageReliable(
        agentId,
        { message: { role: "ROLE_USER", parts: [{ kind: "text", text: buildPrompt(c, asked) }] } },
        { onStaleAgent: opts.onStaleAgent },
      ),
      TIMEOUT_MS,
    );
    const text =
      textOf(resp.message as A2AMessage | undefined) ||
      textOf(resp.task?.status?.message) ||
      (resp.task?.artifacts || [])
        .flatMap((a) => (a.parts || []).map((p) => p.text || ""))
        .filter(Boolean)
        .join("\n")
        .trim();
    raw = extractJson(text) as RawEvidence | null;
  } catch (e) {
    console.warn(`[arbor] evidence pass failed (round continues ungrounded): ${(e as Error).message.slice(0, 140)}`);
    return null;
  }
  return raw;
}

/**
 * Fold a fetched evidence result into the Case: merge its sources into the
 * pool, rewrite its prose markers to stable indices, and attach its findings to
 * the hypotheses they bear on. Synchronous and idempotent-per-call — run it
 * exactly once per round, after the hypothesis engine's own merge.
 */
export function applyEvidence(c: Case, raw: RawEvidence | null): EvidencePassResult {
  if (!raw) return EMPTY;

  const { refMap, added } = mergeSources(c.sources, raw.sources, c.round);
  const now = new Date().toISOString();
  const findings: Finding[] = [];

  for (const rf of raw.findings || []) {
    if (!rf.summary?.trim()) continue;
    const sourceIndices = resolveRefs(refMap, rf.sourceRefs || []);
    // A literature finding with no resolvable source is an unbacked assertion
    // from an agent whose whole job is to bring back sources. Drop it.
    if (!sourceIndices.length) continue;

    // The orchestrator may also cite inline, in its own local refs. Same rule
    // as the engine: rewrite to pool indices, strip whatever doesn't resolve.
    const summary = rewriteMarkers(rf.summary.trim(), refMap, "evidence finding.summary")!;
    const detail = rewriteMarkers(rf.detail?.trim() || undefined, refMap, "evidence finding.detail");

    const f: Finding = {
      id: newId("fnd"),
      summary,
      detail,
      source: "literature",
      direction: rf.direction || "neutral",
      hypothesisIds: [],
      sourceIndices,
      createdAt: now,
    };
    for (const hn of rf.hypothesisNames || []) {
      const h = findByName(c, hn);
      if (h && !f.hypothesisIds.includes(h.id)) f.hypothesisIds.push(h.id);
    }
    c.findings.push(f);
    findings.push(f);

    // Link the finding onto the hypotheses it bears on, same as the engine does.
    for (const hid of f.hypothesisIds) {
      const h = c.hypotheses[hid];
      if (!h) continue;
      if (f.direction === "supports" && !h.evidenceFor.some((e) => e.findingId === f.id)) {
        h.evidenceFor.push({ findingId: f.id, weight: f.summary });
      } else if (f.direction === "against" && !h.evidenceAgainst.some((e) => e.findingId === f.id)) {
        h.evidenceAgainst.push({ findingId: f.id, weight: f.summary });
      }
    }
  }

  if (added.length || findings.length) {
    appendEvent(c, {
      round: c.round,
      kind: "finding",
      summary: `Evidence pass: ${added.length} new source${added.length === 1 ? "" : "s"}, ${findings.length} grounded finding${findings.length === 1 ? "" : "s"}`,
      payload: { sources: added, findings },
    });
  }
  return { sources: added, findings };
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`evidence pass timed out after ${ms}ms`)), ms);
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      },
    );
  });
}
