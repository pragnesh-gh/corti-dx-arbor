/**
 * The Arbor reasoning engine.
 *
 * One Round = gather evidence (fan out to experts) → ask the hypothesis engine
 * to update the differential (structured JSON) → merge into the tree → decide
 * what's next (converged / propose a test / gather more).
 *
 * The engine is deliberately model-driven: it calls the Corti hypothesis
 * agent, parses its structured response, and applies deterministic merge +
 * normalization logic so the tree is always well-formed regardless of how the
 * LLM phrased things. The LLM is the reasoner; this module is the discipline.
 */

import type { CortiClient } from "../corti/client.js";
import {
  AGENT_NAMES,
} from "./agent-definitions.js";
import { appendEvent, newId } from "./case-store.js";
import { extractJson, textOf } from "./parse.js";
import {
  citedIndices,
  mergeSources,
  renderSourcePool,
  rewriteMarkers,
  type RawSource,
} from "./sources.js";
import type {
  Case,
  EngineDecision,
  EngineRoundResult,
  Finding,
  Hypothesis,
  Source,
  TestProposal,
} from "./types.js";

// ---- The structured shape we ask the engine to return --------------------

interface EngineRawHypothesis {
  name: string;
  description?: string;
  codes?: { system: string; code: string; display?: string }[];
  /** 0–100 for ergonomics; we normalize to 0–1. */
  probability?: number;
  isZebra?: boolean;
  baseRateNote?: string;
  /** Parent name in the prior differential, if this is a branch refinement. */
  parent?: string;
  /** If set, this hypothesis rules out the named hypothesis. */
  rulesOut?: string[];
  /** Tests that would discriminate this hypothesis. */
  discriminatingTests?: { name: string; rationale: string; discriminatesBetween?: string[] }[];
}

interface EngineRawResponse {
  hypotheses: EngineRawHypothesis[];
  /** Sources the engine newly introduces this round (ref "N1", "N2", ...). */
  sources?: RawSource[];
  /** Findings produced this round (free text + direction). */
  findings?: {
    summary: string;
    detail?: string;
    direction?: "supports" | "against" | "neutral";
    hypothesisNames?: string[];
    citation?: { label: string; url?: string };
    /** Refs into the pool / this response's sources, e.g. ["S1","N2"]. */
    sourceRefs?: string[];
    source?: string;
  }[];
  /** Free-text narration for the clinician chat. */
  message: string;
  decision:
    | { kind: "converged"; hypothesisName: string; confidence?: number }
    | { kind: "test"; name: string; rationale: string; discriminatesBetween?: string[] }
    | { kind: "gather"; reason: string };
}

// ---- Helpers --------------------------------------------------------------

/**
 * Retry a transient-prone Corti call. The platform sometimes resets the
 * HTTP/2 stream on long expert-chained calls (ERR_HTTP2_STREAM_ERROR /
 * NGHTTP2_INTERNAL_ERROR) or times out; a single retry usually succeeds.
 */
export async function withRetry<T>(fn: () => Promise<T>, retries = 3, backoffMs = 3000): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      const msg = (e as Error)?.message || String(e);
      // On the dev-WEU platform the per-agent A2A path intermittently
      // returns a gateway-level "404 page not found" (plain text) right
      // after an agent is created — a routing/propagation hiccup that
      // resolves on retry. Treat it as transient here.
      const transient =
        /timeout|aborted|fetch failed|NGHTTP2|ERR_HTTP2|stream|reset|ECONNRESET|ETIMEDOUT/i.test(msg) ||
        /404 page not found/i.test(msg);
      if (attempt === retries || !transient) throw e;
      console.warn(`[arbor] transient call failure (attempt ${attempt + 1}/${retries + 1}), retrying: ${msg.slice(0, 120)}`);
      await new Promise((r) => setTimeout(r, backoffMs * (attempt + 1)));
    }
  }
  throw lastErr;
}

function summarizePresentation(c: Case): string {
  const p = c.presentation;
  const d = p.demographics;
  const bits: string[] = [];
  bits.push(`Chief complaint: ${p.chiefComplaint}`);
  if (p.history) bits.push(`History: ${p.history}`);
  if (p.observations?.length) bits.push(`Observations: ${p.observations.join("; ")}`);
  const demo: string[] = [];
  if (d.ageYears != null) demo.push(`age ${d.ageYears}`);
  if (d.sex) demo.push(d.sex);
  if (d.raceEthnicity) demo.push(d.raceEthnicity);
  if (d.location) demo.push(`location: ${d.location}`);
  if (d.comorbidities?.length) demo.push(`comorbidities: ${d.comorbidities.join(", ")}`);
  if (demo.length) bits.push(`Demographics: ${demo.join(", ")}`);
  return bits.join("\n");
}

/** Render the current differential as a compact text block for the engine. */
function renderCurrentDifferential(c: Case): string {
  const live = Object.values(c.hypotheses)
    .filter((h) => h.status === "live" || h.status === "branched")
    .sort((a, b) => b.probability - a.probability);
  if (!live.length) return "(No prior differential — this is the first round.)";
  return live
    .map((h) => `- [${h.id}] ${h.name} (p=${h.probability.toFixed(2)}${h.isZebra ? ", zebra" : ""})`)
    .join("\n");
}

function renderFindings(c: Case): string {
  if (!c.findings.length) return "(No findings yet.)";
  return c.findings
    .map((f) => `- [${f.id}] (${f.direction}) ${f.summary}${f.detail ? ` — ${f.detail}` : ""}`)
    .join("\n");
}

// ---- The round ------------------------------------------------------------

/**
 * Run one reasoning round for a case. Returns the round result (also already
 * merged into the case + an event appended).
 */
export async function runRound(
  client: CortiClient,
  agentId: string,
  c: Case,
  opts: { onStaleAgent?: (agentId: string) => Promise<string | void> } = {},
): Promise<EngineRoundResult> {
  c.round += 1;
  const round = c.round;

  const prompt = `CASE CONTEXT
${summarizePresentation(c)}

CURRENT DIFFERENTIAL (round ${round - 1})
${renderCurrentDifferential(c)}

FINDINGS SO FAR
${renderFindings(c)}

SOURCES AVAILABLE TO CITE
${renderSourcePool(c.sources)}

CITATION RULES
- Cite a source available above by writing its ref inline in the prose, e.g.
  "prevalence rises sharply after 60 [S2]". Multiple refs: [S1, S3].
- Citable prose: each hypothesis "description" and "baseRateNote", each
  discriminating test "rationale", and each finding "summary"/"detail".
- If you introduce a source of your own, you MUST declare it in "sources" with a
  ref of the form "N1", "N2", ... and cite it as [N1]. Never cite a ref you have
  not declared: unresolvable markers are stripped before the clinician sees them.
- NEVER invent a DOI, PMID, or URL. An uncited claim is acceptable; a fabricated
  citation is not. If nothing above supports a claim, simply make it uncited.

TASK
Update the differential. Emit the FULL set of live hypotheses with updated probabilities (hypotheses that are now ruled out should be omitted from "hypotheses" but named in rulesOut). Branch (set parent) when a finding splits a hypothesis. Return ONLY the JSON object matching the schema: { hypotheses:[{name, description?, codes?, probability(0-100), isZebra?, baseRateNote?, parent?, rulesOut?:[name], discriminatingTests?:[{name, rationale, discriminatesBetween?:[name]}]}], sources?:[{ref:"N1", title, url?, identifier?, type?, note?}], findings?:[{summary, detail?, direction?, hypothesisNames?, sourceRefs?:["S1"], source?}], message:string, decision:{kind:"converged"|"test"|"gather", ...} }`;

  // Use the reliable send: POST message:send, then poll the task to
  // completion. The dev-weu gateway often returns a plain-text 404 on the
  // send response for long-running calls even though the task runs and
  // completes in the background (~1-3 min). sendMessageReliable recovers
  // the task by messageId and polls it, so we get the result regardless of
  // whether the send response itself 404s.
  const resp = await client.sendMessageReliable(
    agentId,
    { message: { role: "ROLE_USER", parts: [{ kind: "text", text: prompt }] } },
    { onStaleAgent: opts.onStaleAgent },
  );

  const rawText =
    textOf(resp.message) ||
    textOf(resp.task?.status?.message) ||
    (resp.task?.artifacts || [])
      .flatMap((a) => (a.parts || []).map((p) => p.text || ""))
      .filter(Boolean)
      .join("\n")
      .trim();
  const parsed = extractJson(rawText) as EngineRawResponse | null;

  if (!parsed || !Array.isArray(parsed.hypotheses)) {
    // The engine didn't return parseable structured output. Record the raw
    // text as a message and ask for more; the cycle can continue next round.
    appendEvent(c, {
      round,
      kind: "engine_message",
      summary: "(engine returned unparseable output)",
      payload: { raw: rawText.slice(0, 1000) },
    });
    return {
      hypotheses: [],
      findings: [],
      sources: [],
      message: rawText || "(no response from engine)",
      decision: { kind: "gather", reason: "engine output unparseable; retry" },
      pruned: [],
    };
  }

  const result = mergeEngineResponse(c, parsed, round);
  return result;
}

// ---- Merge logic ----------------------------------------------------------

/** Match an engine hypothesis name to an existing hypothesis id by name. */
function findByName(c: Case, name: string): Hypothesis | undefined {
  const target = name.trim().toLowerCase();
  return Object.values(c.hypotheses).find(
    (h) => h.name.trim().toLowerCase() === target,
  );
}

function mergeEngineResponse(
  c: Case,
  raw: EngineRawResponse,
  round: number,
): EngineRoundResult {
  const now = new Date().toISOString();
  const pruned: string[] = [];
  const newFindings: Finding[] = [];

  // 0) Fold the engine's declared sources into the case pool. This yields the
  //    ref -> stable-index map every marker below is rewritten against, so a
  //    marker can only survive if it points at a source that actually exists.
  const { refMap, added: newSources } = mergeSources(c.sources, raw.sources, round);
  const cite = (t: string | undefined) => rewriteMarkers(t, refMap);
  const refsToIndices = (refs: string[] | undefined): number[] | undefined => {
    const ids = [
      ...new Set(
        (refs || [])
          .map((r) => refMap[r.trim().toUpperCase()] ?? refMap[r.trim()])
          .filter((i): i is number => typeof i === "number"),
      ),
    ].sort((a, b) => a - b);
    return ids.length ? ids : undefined;
  };

  // 1) Record findings first (used for evidence refs).
  for (const rf of raw.findings || []) {
    const f: Finding = {
      id: newId("fnd"),
      summary: cite(rf.summary) ?? rf.summary,
      detail: cite(rf.detail),
      source: (rf.source as Finding["source"]) || "literature",
      direction: rf.direction || "neutral",
      hypothesisIds: [],
      citation: rf.citation,
      sourceIds: refsToIndices(rf.sourceRefs),
      createdAt: now,
    };
    // Resolve hypothesis names → ids for the finding.
    for (const hn of rf.hypothesisNames || []) {
      const h = findByName(c, hn);
      if (h) f.hypothesisIds.push(h.id);
    }
    c.findings.push(f);
    newFindings.push(f);
    appendEvent(c, {
      round,
      kind: "finding",
      summary: `Finding (${f.direction}): ${f.summary}`,
      payload: f,
    });
  }

  // 2) Apply rulesOut: prune named hypotheses that a new finding refutes.
  const allRawNames = new Set(raw.hypotheses.map((h) => h.name));
  for (const rh of raw.hypotheses) {
    for (const outName of rh.rulesOut || []) {
      const h = findByName(c, outName);
      if (h && h.status === "live") {
        h.status = "ruled_out";
        h.branchedBecause = `ruled out by finding about ${rh.name}`;
        h.updatedAt = now;
        pruned.push(h.id);
        appendEvent(c, {
          round,
          kind: "hypotheses",
          summary: `Ruled out: ${h.name}`,
          payload: { hypothesisId: h.id, status: "ruled_out" },
        });
      }
    }
  }

  // 3) Upsert hypotheses from the engine response.
  const upserted: Hypothesis[] = [];
  for (const rh of raw.hypotheses) {
    const existing = findByName(c, rh.name);
    const prob = (rh.probability ?? 0) / 100; // 0–100 → 0–1
    // Resolve parent for branching.
    let parentId: string | null = null;
    if (rh.parent) {
      const parent = findByName(c, rh.parent);
      if (parent) {
        parentId = parent.id;
        // Mark parent branched.
        if (parent.status === "live") {
          parent.status = "branched";
          parent.branchedBecause = `branched into refined hypotheses in round ${round}`;
          parent.updatedAt = now;
          appendEvent(c, {
            round,
            kind: "hypotheses",
            summary: `Branched: ${parent.name}`,
            payload: { hypothesisId: parent.id, status: "branched" },
          });
        }
      }
    }
    const discriminatingTests: TestProposal[] | undefined = rh.discriminatingTests?.map((t) => ({
      id: newId("tst"),
      name: t.name,
      rationale: cite(t.rationale) ?? t.rationale,
      discriminatesBetween: (t.discriminatesBetween || [])
        .map((n) => findByName(c, n)?.id)
        .filter((x): x is string => !!x),
      status: "proposed",
    }));

    if (existing) {
      // Update in place.
      existing.probability = prob;
      existing.description = cite(rh.description) ?? existing.description;
      existing.codes = rh.codes ?? existing.codes;
      existing.isZebra = rh.isZebra ?? existing.isZebra;
      existing.baseRateNote = cite(rh.baseRateNote) ?? existing.baseRateNote;
      existing.discriminatingTests = discriminatingTests ?? existing.discriminatingTests;
      existing.updatedAt = now;
      // Attach finding evidence.
      for (const f of newFindings) {
        if (f.hypothesisIds.includes(existing.id)) {
          if (f.direction === "against" && !existing.evidenceAgainst.some((e) => e.findingId === f.id)) {
            existing.evidenceAgainst.push({ findingId: f.id, weight: f.summary });
          } else if (f.direction === "supports" && !existing.evidenceFor.some((e) => e.findingId === f.id)) {
            existing.evidenceFor.push({ findingId: f.id, weight: f.summary });
          }
        }
      }
      upserted.push(existing);
    } else {
      // New hypothesis node.
      const h: Hypothesis = {
        id: newId("hyp"),
        name: rh.name,
        description: cite(rh.description),
        codes: rh.codes,
        probability: prob,
        status: "live",
        parentId,
        childIds: [],
        evidenceFor: [],
        evidenceAgainst: [],
        isZebra: rh.isZebra,
        baseRateNote: cite(rh.baseRateNote),
        discriminatingTests,
        createdAt: now,
        updatedAt: now,
      };
      c.hypotheses[h.id] = h;
      if (parentId) {
        const parent = c.hypotheses[parentId];
        if (parent && !parent.childIds.includes(h.id)) parent.childIds.push(h.id);
      } else {
        c.rootHypothesisIds.push(h.id);
      }
      // Attach finding evidence: the finding referenced this hypothesis by
      // name before the node existed, so link it now that the node does.
      for (const f of newFindings) {
        const namedInFinding = (raw.findings || []).some(
          (rf) => rf.hypothesisNames?.includes(h.name),
        );
        if (namedInFinding && !f.hypothesisIds.includes(h.id)) f.hypothesisIds.push(h.id);
        if (f.hypothesisIds.includes(h.id)) {
          if (f.direction === "supports") h.evidenceFor.push({ findingId: f.id, weight: f.summary });
          else if (f.direction === "against") h.evidenceAgainst.push({ findingId: f.id, weight: f.summary });
        }
      }
      upserted.push(h);
      appendEvent(c, {
        round,
        kind: "hypotheses",
        summary: `${parentId ? "Branched" : "New"} hypothesis: ${h.name}`,
        payload: { hypothesisId: h.id, status: "live", parentId },
      });
    }
  }

  // 4) Normalize probabilities across the live frontier (siblings at each
  //    level) so they sum to 1. This enforces the Bayesian "mass" invariant
  //    even when the LLM's numbers are rough.
  normalizeTree(c, now);

  // 5) Resolve the decision.
  const decision = resolveDecision(c, raw, round);

  // 6) Narrate. The chat message has its markers stripped rather than
  //    rewritten (ADR 0003 / grill Q2): citation chips in a conversational
  //    bubble read as noise, and the same claims are cited where they land on
  //    the tree.
  const message = (rewriteMarkers(raw.message, {}) || "").trim() || `Round ${round} complete`;
  appendEvent(c, {
    round,
    kind: "engine_message",
    summary: message,
    payload: { message },
  });

  return {
    hypotheses: upserted,
    findings: newFindings,
    sources: newSources,
    message,
    decision,
    pruned,
  };
}

/** Normalize sibling-group probabilities so each sibling set sums to 1. */
function normalizeTree(c: Case, _now: string): void {
  // Group live hypotheses by their position in the tree: root hypotheses
  // together, each branched node's children together.
  const groups: Record<string, Hypothesis[]> = {};
  for (const h of Object.values(c.hypotheses)) {
    if (h.status !== "live" && h.status !== "branched") continue;
    const key = h.parentId ?? "__root__";
    (groups[key] ||= []).push(h);
  }
  for (const key of Object.keys(groups)) {
    const group = groups[key];
    if (!group) continue;
    const total = group.reduce((s, h) => s + h.probability, 0);
    if (total > 0) {
      for (const h of group) h.probability = h.probability / total;
    } else {
      const eq = 1 / group.length;
      for (const h of group) h.probability = eq;
    }
  }
  // Branched (non-live) parents carry 0 mass.
  for (const h of Object.values(c.hypotheses)) {
    if (h.status === "branched") h.probability = 0;
    if (h.status === "ruled_out") h.probability = 0;
  }
}

function resolveDecision(c: Case, raw: EngineRawResponse, round: number): EngineDecision {
  const dec = raw.decision;
  if (dec?.kind === "converged") {
    const h = findByName(c, dec.hypothesisName);
    if (h) {
      return { kind: "converged", hypothesisId: h.id, confidence: dec.confidence ?? h.probability };
    }
  }
  if (dec?.kind === "test") {
    const t: TestProposal = {
      id: newId("tst"),
      name: dec.name,
      rationale: dec.rationale,
      discriminatesBetween: (dec.discriminatesBetween || [])
        .map((n) => findByName(c, n)?.id)
        .filter((x): x is string => !!x),
      status: "proposed",
    };
    c.tests.push(t);
    appendEvent(c, {
      round,
      kind: "test_proposed",
      summary: `Propose test: ${t.name}`,
      payload: t,
    });
    return { kind: "test", test: t };
  }
  return { kind: "gather", reason: dec?.kind === "gather" ? dec.reason : "continue gathering" };
}

// ---- Convergence & treatment --------------------------------------------

/** Mark a working diagnosis and finalize the reasoning trail. */
export function setWorkingDiagnosis(
  c: Case,
  hypothesisId: string,
  confidence: number,
  message: string,
): void {
  const h = c.hypotheses[hypothesisId];
  if (!h) return;
  h.status = "confirmed";
  c.status = "converged";
  c.awaitingHitl = false;
  c.workingDiagnosis = {
    hypothesisId,
    name: h.name,
    confidence,
    reasoningTrail: buildReasoningTrail(c, hypothesisId),
    concludedAt: new Date().toISOString(),
  };
  appendEvent(c, {
    round: c.round,
    kind: "diagnosis",
    summary: `Working diagnosis: ${h.name} (confidence ${confidence.toFixed(2)})`,
    payload: c.workingDiagnosis,
  });
  appendEvent(c, {
    round: c.round,
    kind: "engine_message",
    summary: message,
  });
}

/**
 * Walk the tree up from a hypothesis to the root, narrating the path.
 *
 * Each step carries the markers of the sources actually behind it, so the trail
 * is the defensible artifact ADR 0003 promises: a physician can retrace not
 * just *what* was concluded but *what it rests on*. Steps with no grounded
 * evidence get no markers — visibly, which is the point.
 */
function buildReasoningTrail(c: Case, hypothesisId: string): string[] {
  const findingsById = new Map(c.findings.map((f) => [f.id, f]));
  /** Every pool index cited by the evidence attached to a hypothesis. */
  const marker = (h: Hypothesis): string => {
    const ids = new Set<number>();
    for (const e of [...h.evidenceFor, ...h.evidenceAgainst]) {
      for (const i of findingsById.get(e.findingId)?.sourceIds || []) ids.add(i);
    }
    for (const i of citedIndices(h.baseRateNote)) ids.add(i);
    for (const i of citedIndices(h.description)) ids.add(i);
    return ids.size ? ` [${[...ids].sort((a, b) => a - b).join(", ")}]` : "";
  };

  const trail: string[] = [];
  let cur: Hypothesis | undefined = c.hypotheses[hypothesisId];
  while (cur) {
    const why = cur.branchedBecause ? `${cur.name} — ${cur.branchedBecause}` : cur.name;
    trail.unshift(`${why}${marker(cur)}`);
    cur = cur.parentId ? c.hypotheses[cur.parentId] : undefined;
  }
  // Append the pruned siblings as "considered and ruled out".
  const pruned = Object.values(c.hypotheses).filter((h) => h.status === "ruled_out");
  for (const p of pruned) {
    trail.push(
      `Ruled out: ${p.name}${p.branchedBecause ? ` (${p.branchedBecause})` : ""}${marker(p)}`,
    );
  }
  return trail;
}

/** Record a clinician-entered finding (test result or observation). */
export function recordFinding(
  c: Case,
  input: {
    summary: string;
    detail?: string;
    direction?: "supports" | "against" | "neutral";
    source?: Finding["source"];
    hypothesisIds?: string[];
  },
): Finding {
  const f: Finding = {
    id: newId("fnd"),
    summary: input.summary,
    detail: input.detail,
    source: input.source || "clinician",
    direction: input.direction || "neutral",
    hypothesisIds: input.hypothesisIds || [],
    createdAt: new Date().toISOString(),
  };
  c.findings.push(f);
  appendEvent(c, {
    round: c.round,
    kind: "finding",
    summary: `Finding (${f.direction}): ${f.summary}`,
    payload: f,
  });
  return f;
}

/** Mark a proposed test as ordered/ resulted with a finding id. */
export function resultTest(c: Case, testId: string, resultFindingId: string): void {
  const t = c.tests.find((x) => x.id === testId);
  if (!t) return;
  t.status = "resulted";
  t.resultFindingId = resultFindingId;
  appendEvent(c, {
    round: c.round,
    kind: "test_ordered",
    summary: `Test resulted: ${t.name}`,
    payload: t,
  });
}

export { AGENT_NAMES };
