# Recipe 5 — Tests as information gain: the HITL gate

> **Live feature:** at a gate, enter a result with "Add result & advance".
> Source: `web/src/NextAction.tsx`, `server/index.ts`.

When the differential cannot be split by reasoning alone, the engine
**proposes a test** — not the test that confirms the favorite, but the
one with the **maximum information gain** over the remaining live
hypotheses. Then it pauses. The clinician owns the order and the result.
This is the human-in-the-loop (HITL) gate.

## The gate in the UI

Source: `web/src/NextAction.tsx`. The finding form renders inline with
the gate — no left/right ping-pong.

When the engine proposes a test, the NextAction rail shows the test name
and rationale, and the finding-entry form appears right there. Enter the
result, pick its direction (supports / against / neutral), and click
**"Add result & advance"** — one action enters the finding and advances
the next round.

## The test proposal

```jsonc
// the engine's decision is "test":
decision: {
  kind: "test",
  name: "Urgent arthrocentesis of the most inflamed joint",
  rationale: "Maximum information gain: splits septic from post-streptococcal.",
  discriminatesBetween: ["Septic arthritis", "Post-streptococcal reactive arthritis"],
}
```

## Linking the result to the test

Source: `POST /api/cases/:id/finding` in `server/index.ts`.

When the clinician enters a finding with a `testId`, the server marks
that proposed test `resulted` and links the finding to it. The next round
re-ranks the differential using the new finding.

> **The clinician is the decider at the gate.** The engine proposes; the
> clinician orders the test, reads the result, and enters it. The agent
> never orders a test or records a result on its own — clinical safety.

---

Previous: [Recipe 4 — Horses vs zebras](04-horses-zebras.md) · Next: [Recipe 6 — Evidence & experts](06-evidence.md)
