# ADR 0003 — Grounded inline citations via a pipelined evidence pass

Date: 2026-09-01
Status: Accepted

## Context

Arbor renders clinical claims — base rates, illness scripts, the reasoning
trail — as bare prose. The one citation slot that existed
(`Finding.citation: {label, url}`) was filled by the **hypothesis engine**,
whose only registry connectors are `web-search-expert` and
`medical-calculator-expert`. Meanwhile `arbor-evidence` — the orchestrator
wired to `pubmed-expert`, `clinical-trials-expert`, `drugbank-expert` and
`coding-expert` — was provisioned at boot by `agent-manager.ts` and **never
sent a single message**. Every "citation" in the product was therefore a label
the reasoning model wrote from memory.

Putting a citation UI on top of that would make unverifiable claims *look*
verified, which in clinical decision support is worse than no citations at all.

## Decision

**1. `Source` becomes a first-class case-level entity.** `case.sources[]` is an
append-only, deduplicated pool. Prose carries inline markers (`[3]`) that index
into it. A Citation is one *use* of a Source; a Source is the artifact itself.

**2. The evidence pass is real, and it is pipelined.** Each round fires the
hypothesis engine and the evidence orchestrator **in parallel**. The
orchestrator's returned sources land immediately as Findings *and* are carried
into the **next** round's hypothesis prompt as a citable pool.

**3. Only the evidence pass may add a Source.** The hypothesis engine is given
the pool as a read-only list and can cite it by ref (`[S3]`), but its response
has no `sources` field: a ref it invents resolves to nothing. A source the
experts did not return does not exist.

**4. Unresolvable markers are stripped server-side and logged**, never
rendered. The log line is the only signal that a model is fabricating refs.

**5. Fetch and apply are separate.** `fetchEvidence` talks to the experts and
mutates nothing; `applyEvidence` folds the result into the Case after the
engine's own merge. So a retried round cannot fire a second pass or double-record
its findings, and evidence findings attach to the differential as it *ends* the
round rather than racing the engine's upserts.

## Considered options for the evidence pass

- **Serial** (orchestrator → engine, same round). Correct citations from round
  one, but roughly doubles a round that already takes 1–3 minutes on dev-WEU.
- **Parallel, unlinked.** Latency flat, but the engine can never cite what it
  hasn't seen; grounded sources would sit in a sidebar the reasoning never
  references.
- **Pipelined** (chosen). Latency stays flat and, from round 2 onward, the
  engine cites grounded literature by ref.

## Consequences

- **Round 1 prose has no literature citations.** This is deliberate and matches
  the domain model: round 1 is System-1 pattern recognition, not literature
  review. Do not "fix" it by making the pass serial without re-reading the
  latency trade-off above.
- The orchestrator leg is bounded (top 3 live hypotheses) and failure-tolerant:
  a timeout or platform flap degrades to a hypothesis-only round rather than
  failing it. Grounding is best-effort; honesty about its absence is not.
- Source indices are stable because the pool is append-only. Never sort,
  compact, or garbage-collect `case.sources[]` — a marker's number would shift
  under a reader who had already cited it.
- The treatment planner (`treatment.ts`) has no source pool and does not rewrite
  markers, so its prose renders plain. Wrapping it in `<Cited>` would let a
  bracketed number resolve to an unrelated paper — worse than no citation.
- Known gap: `RawSource.identifier` is one flat field, so a paper returned once
  by DOI and once by PMID does not dedupe. Splitting it into typed fields is the
  fix when it starts to bite.
