# Recipe 7 — Working diagnosis & the reasoning trail

> **Live feature:** when stable, click "Set working dx" in the detail panel.
> Source: `server/domain/engine.ts`, `web/src/DetailPanel.tsx`.

When one hypothesis dominates and the threshold is met, the case
**converges**. The clinician then sets the **working diagnosis** — the
single root-cause the session concludes is most likely, with its
confidence and the evidence path that reached it.

## Setting the working diagnosis

Source: `POST /api/cases/:id/diagnose`, and the "Converged enough?" hint
in `web/src/DetailPanel.tsx`.

The engine may converge on its own (its decision is `converged`), or the
clinician can set it when the differential is stable. When the leading
hypothesis is clear, the detail panel shows a "Converged enough?
**Set working dx**" hint — so the action is discoverable where you are
looking at the leading hypothesis, not buried in a menu.

## The reasoning trail

Source: `buildReasoningTrail` in `server/domain/engine.ts`.

The working diagnosis carries a **reasoning trail**: the path from the
presentation down the tree to the converged hypothesis, plus the pruned
siblings as "considered and ruled out." This is the auditable record a
clinician retraces to defend the conclusion.

```jsonc
// the working diagnosis object
workingDiagnosis: {
  hypothesisId, name,
  confidence,            // 0–1
  reasoningTrail: [       // the path, narrated
    "Presentation",
    "Acute rheumatic fever — branched into ...",
    "Ruled out: Septic arthritis (ruled out by ...)",
    ...
  ],
  concludedAt
}
```

> **The clinician confirms the verdict.** The agent proposes; the
> clinician decides. The working diagnosis is never auto-locked — the
> clinician sets it, and the reasoning trail records why.

---

Previous: [Recipe 6 — Evidence & experts](06-evidence.md) · Next: [Recipe 8 — Treatment plan](08-treatment.md)
