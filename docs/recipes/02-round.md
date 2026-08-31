# Recipe 2 — The reasoning round: gather, update, decide

> **Live feature:** advance a round in the workspace and watch the rail.
> Source: `server/domain/engine.ts`.

A **Round** is one pass of the reasoning cycle. The clinician clicks
"Advance a round"; the engine gathers evidence, updates the differential,
and decides what to do next. A case is a sequence of rounds.

## The three steps of a round

1. **Gather** — the engine fans out to registry experts (pubmed,
   web-search, medical-calculator) to ground the top hypotheses.
2. **Update** — the hypothesis engine re-ranks the differential from the
   presentation + accumulated findings, branching where a finding splits
   a hypothesis.
3. **Decide** — the engine classifies the state:
   - *converged* → one hypothesis dominates → set the working diagnosis.
   - *test* → propose the next test and pause for HITL.
   - *gather* → loop back for more evidence.

## The JSON contract

Source: `server/domain/engine.ts`. The engine is instructed to return a
single JSON object; the server applies deterministic merge + normalization
so the tree is always well-formed.

```jsonc
{ // the engine returns this each round
  hypotheses: [{ name, probability(0-100), isZebra?, baseRateNote?,
                 parent?, rulesOut?: [name],
                 discriminatingTests?: [{ name, rationale }] }],
  findings?: [{ summary, detail?, direction?, hypothesisNames?, citation? }],
  message: string,
  decision:
    | { kind: "converged", hypothesisName, confidence? }
    | { kind: "test", name, rationale, discriminatesBetween? }
    | { kind: "gather", reason }
}
```

## Why a round takes a minute or two

A round is not a database lookup. The model genuinely reasons, and it
fans out to expert agents in the process. On the dev-weu platform a round
can also retry through transient 404 windows (the server's
`sendMessageReliable` recovers the task and polls it). The UI shows a
"still working" hint after a few seconds so you know it isn't hung.

> **The clinician's only action in a round is one click.** Advance. The
> engine does the rest. The next action always shows in the NextAction
> rail — you never have to guess what to do.

---

Previous: [Recipe 1 — Presentation](01-presentation.md) · Next: [Recipe 3 — The hypothesis tree](03-tree.md)
