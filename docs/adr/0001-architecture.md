# ADR 0001 — Arbor architecture: a retraceable differential-diagnosis tree on the Corti Agent API

Date: 2026-08-21
Status: Accepted

## Context

The goal (see the `/goal` directive) is a clinical helper that mirrors how a
physician works a case: take a presentation, branch out a wide set of
possibilities, order tests that split them, narrow to a working diagnosis using
observations + literature + demographic base rates, retrace every step, then
hand off to a treatment plan — with a decision-tree UI and a chat/voice
interface.

We already validated the Corti Agent API (dev-WEU) and `@newsioaps/agent-sdk`
live in a prior session, including: `stateGraph` cyclic refinement, `parallel`
fan-out, declarative `interrupt` HITL, and 13 registry experts. There is no
Anthropic/OpenAI key in this environment, but full Corti dev-WEU credentials
exist. The registry experts (`pubmed`, `clinical-trials`, `medical-calculator`,
`coding`/ICD, `web-search`, `interviewing`, `memory`) map almost one-to-one onto
the DDx research needs.

## Decision

Build **Arbor** as an Express backend + React/Vite frontend in a new repo
(`corti-dx-arbor`), powered by the Corti Agent API. Reuse the proven
`CortiClient` (OAuth2 cache + agent CRUD + A2A send/SSE) from the prior PRIORA
session verbatim.

### The core data structure: the Reasoning Tree

The central artifact is a **tree of Hypotheses**, not a flat differential. This
is the realization of the user's "decision-tree, retrace your steps" ask.

- Each Case has a root Presentation node.
- Hypotheses branch: a finding that splits a hypothesis spawns **children**.
- A hypothesis carries: id, name, probability mass, evidence (for/against),
  discriminating tests, status (`live | confirmed | ruled_out | branched`).
- Pruned branches are **kept, not deleted** — the trace must show "we went down
  this path, here's why we left it." This is what makes reasoning retraceable.

### The reasoning cycle (bounded stateGraph)

A Case advances in **Rounds**, driven by a Corti `stateGraph` (bounded
`maxIterations`) so the cycle always terminates:

1. **Generate/Update** — the hypothesis engine re-ranks the differential from
   the presentation + accumulated findings, branching/refining hypotheses.
2. **Evidence fan-out** — `parallel()` invokes the registry experts
   (pubmed, clinical-trials, medical-calculator, coding, web-search) to ground
   the top hypotheses in literature, base rates, and codes; results merge back
   as findings.
3. **Decide** — the engine classifies the state:
   - *converged* → a single hypothesis dominates and the threshold for
     concluding is met → **Working diagnosis**.
   - *test needed* → emit a proposed test (the one with max information gain over
     the remaining differential) and pause for HITL (clinician orders it / enters
     the result).
   - *insufficient* → loop back with more evidence gathering.
4. **HITL gate** — a Corti `interrupt`/INPUT_REQUIRED lets the clinician inject
   a finding (test result, observation), redirect, or accept. `resumeWorkflow`
   continues the cycle.

### Demographic base rates

The hypothesis engine is instructed to use prevalence/incidence as the **prior**
and to adjust it by the patient's age/sex/race/ethnicity/geography. Zebras are
surfaced explicitly (low mass, kept on the tree) so rare-but-dangerous causes
aren't dropped prematurely — the "horses vs zebras" tension made visible.

### Treatment hand-off

After a Working diagnosis, a second lighter stateGraph proposes a treatment
plan, including **surgical case-finding**: `clinical-trials-expert` +
`web-search-expert` + `pubmed-expert` search where the relevant procedures have
been performed, outcomes, and technique notes.

### UI (split-pane, the decision-tree front and center)

- **Center**: the live decision-tree (nodes = hypotheses sized/colored by
  probability; edges = the finding that branched them; pruned paths dimmed but
  visible). This is the headline "retrace your steps" view.
- **Left**: the case timeline / evidence log (findings, test results, expert
  citations as they land).
- **Right**: the chat/voice interface with the engine — free-text reasoning,
  "order this test", "why this hypothesis", "show me the zebra".
- An interrupt banner gates the HITL moments.

## Consequences

- **Corti is the only LLM dependency** — no external API key needed; experts are
  the research/literature layer the user asked for.
- The tree-with-pruned-branches model is the novelty vs flat-differential tools
  (DXplain/Isabel) and vs our own prior PRIORA (which was adversarial appeals,
  not diagnostic narrowing).
- Bounded `stateGraph` guarantees termination; HITL interrupts make it a tool a
  clinician drives, not an autonomous verdict machine (appropriate for clinical
  safety).
- Demoable end-to-end: run scenarios from a presentation → watch the tree
  branch → order tests → converge → treatment plan.

## Alternatives considered

- **Flat differential list** (DXplain-style) — rejected: loses the
  retraceability and the "which path did we go down" property the user wants.
- **Pure chat, no tree** — rejected: the tree is the explicit ask and is the
  explainability artifact.
- **Autonomous, no HITL** — rejected for clinical safety; the clinician must
  order tests and own the verdict.
- **Build on raw Anthropic/OpenAI** — rejected: no keys present; Corti gives
  the medical experts for free and is the platform this experiment is about.
