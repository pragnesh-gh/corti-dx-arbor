# Recipe 4 — Horses vs zebras: base rates and the zebra flag

> **Live feature:** look for the 🦓 zebra tag on a low-probability node.
> Source: `server/domain/agent-definitions.ts` (prompt), `CONTEXT.md`.

The engine is told to reason the way an expert does: **"when you hear
hoofbeats, think horses, not zebras."** Common diagnoses lead by
base-rate probability. But a rare diagnosis is **never dropped silently**
— it is flagged 🦓 and kept on the tree at low mass until actively ruled
out.

## The base-rate prior

The prevalence of a condition in the patient's demographic stratum (age,
sex, race/ethnicity, geography) is the **prior**. Each finding adjusts
the posterior up or down (Bayesian-style). The engine states the
base-rate assumption it used for each hypothesis.

## The zebra flag

Source: the hypothesis engine system prompt in
`server/domain/agent-definitions.ts`.

```jsonc
// from the engine's hard rules:
// 2. But NEVER drop a rare diagnosis silently. Mark zebras with
//    isZebra=true and keep them on the tree at low mass so dangerous
//    rare causes stay visible until actively ruled out.
```

## Why this matters

A flat-differential tool will quietly drop a 1% diagnosis. Arbor keeps
it — because some zebras are dangerous (endocarditis, vasculitis), and
dropping them early is how rare causes get missed. The zebra stays on the
tree, dimmed once ruled out, so the clinician can see it was considered.

## Demographic adjustment

The same symptom starts from different priors in different people. Lyme
arthritis is a horse in rural Minnesota and a zebra in Lisbon. The engine
is instructed to adjust the prior by the patient's demographics and to
say so in the `baseRateNote`.

> Look for the 🦓 zebra tag on a low-probability node in the tree or list
> view — it stays until the engine rules it out.

---

Previous: [Recipe 3 — The tree](03-tree.md) · Next: [Recipe 5 — Tests & HITL](05-tests.md)
