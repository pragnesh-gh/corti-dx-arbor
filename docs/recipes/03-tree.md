# Recipe 3 — The hypothesis tree: branching, kept, retraceable

> **Live feature:** open the Tree view and click a node.
> Source: `web/src/DecisionTree.tsx`, `server/domain/engine.ts`.

The differential is a **tree of hypotheses**, not a flat list. This is
Arbor's headline property: the reasoning is **retraceable**. You can see
which path was taken, and which were pruned and why.

## Nodes are hypotheses

- **live** (blue) — on the active frontier.
- **branched** (violet) — split into refined children.
- **working dx** (green) — the converged hypothesis.
- **ruled out** (grey, struck through) — refuted and kept for the trail.

## Branching

When a finding splits a hypothesis, the engine marks the parent
*branched* and emits child hypotheses that represent the refined
possibilities. The tree grows *down*, not just sideways. Edges are
labelled with the finding that caused the branch.

```jsonc
// a finding that splits "infection" into bacterial vs viral
{ hypotheses: [
    { name: "Bacterial infection", parent: "Infection" },
    { name: "Viral infection",     parent: "Infection" },
  ],
  ... }
```

## Ruled-out branches stay

Source: `normalizeTree` in `server/domain/engine.ts`.

A refuted hypothesis is set to `ruled_out` but is **not deleted**. It
stays on the tree, dimmed, with the reason it was ruled out. This is what
makes the reasoning auditable — the clinician can defend the conclusion
by retracing the path.

## Two views, one tree

The workspace offers a **Tree** view (the graph) and a **List** view
(the ranked differential, top-to-bottom). Both show the same case; click
a node or a row to open its detail (codes, evidence, discriminating
tests) in the right panel.

> **Retraceability** is the difference between Arbor and a flat-
> differential tool. The flat list shows *what* the top candidates are.
> The tree shows *how you got there*.

---

Previous: [Recipe 2 — The round](02-round.md) · Next: [Recipe 4 — Horses vs zebras](04-horses-zebras.md)
