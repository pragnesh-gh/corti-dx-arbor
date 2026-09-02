# Arbor — Demo Brief

A short introduction to Arbor for a live demo. Read this before you show the
tool to colleagues.

Written in [ASD-STE100 Simplified Technical English](https://www.asd-ste100.org/):
short sentences, active voice, one idea per sentence. It uses the domain terms
from [`CONTEXT.md`](../CONTEXT.md), in **bold** at first use.

---

## What Arbor is

Arbor is a differential-diagnosis tool built on the Corti Agent API.

A clinician enters a **Presentation**. This is the patient's chief complaint plus
the facts from **Intake**: age, sex, geography, comorbidities, and vitals.

Arbor then grows a **tree** of **Hypotheses**. Each Hypothesis is one possible
cause. Each one holds a probability mass, the evidence for and against it, and
the **Tests** that can confirm or refute it.

The tool works in **Rounds**. One Round does three things. It gathers evidence.
It updates the probability of each Hypothesis. Then it decides to order a Test,
to conclude, or to gather more.

**Branching** is the key idea. When a **Finding** splits the meaning of a
Hypothesis, Arbor refines that Hypothesis into children. This makes the
reasoning a tree and not a flat list. Therefore the clinician can retrace it.

The result is a **Working diagnosis** with a **Reasoning trail**, and then a
**Treatment plan**. The clinician retraces the trail to defend the conclusion.

## The agents we use

Arbor creates **four** Corti agents at start:

| Agent | Function |
|---|---|
| **Intake agent** | Makes free text into a structured Presentation |
| **Hypothesis engine** | Generates and updates the Differential. This is the brain. |
| **Evidence orchestrator** | Fans out to the specialists in parallel, then merges what they return |
| **Treatment planner** | Builds the Treatment plan after the Working diagnosis |

These agents call **six** specialists from the Corti registry:
`pubmed-expert`, `clinical-trials-expert`, `medical-calculator-expert`,
`drugbank-expert`, `coding-expert`, and `web-search-expert`. The Intake agent
uses `interviewing-expert`.

The definitions are in
[`server/domain/agent-definitions.ts`](../server/domain/agent-definitions.ts).

The **Evidence pass** drives the specialists. It runs in parallel with each
Round. This rule keeps Arbor honest: **a Source that no specialist returned does
not exist.** The engine cannot invent a **Citation**. A test in the suite
asserts this — see `the engine cannot introduce a source` in
[`server/domain/sources.test.ts`](../server/domain/sources.test.ts).

## Two points to show your colleagues

**Horses before zebras.** Common diagnoses lead on **base rate**. But Arbor also
shows the **Zebra** — the rare and dangerous cause. It does not drop it early.

**Time travel.** The timeline at the bottom is a scrubber. Drag it back to see
each earlier step. Press play to watch the Differential build itself. Each step
shows what changed, for example "6 new hypotheses · 1 test proposed". A
clinician with 67 Rounds can look back at all of it in one place.

## Before you demo

Three honest cautions:

1. **One Round takes about two minutes.** A measured live Round took 121
   seconds. Start a case before your colleagues arrive, or use the **Guided
   tour** scenario. The tour is instant, because it is scripted.
2. **Round 1 shows no citation markers.** This is correct. The Evidence pass
   gives the engine its Sources for the *next* Round. Advance one Round to show
   the markers.
3. **The ranked list can show 100%.** `normalizeTree` in
   [`server/domain/engine.ts`](../server/domain/engine.ts) normalizes
   probability inside each group of siblings. So a lone child of a branched
   Hypothesis reads 100%. It means "certain *given* this branch". The ranked
   list shows that number as a flat percentage. This is a known display
   difference and is not yet changed.

## Known difference from CONTEXT.md

`CONTEXT.md` lists a **Memory** agent on the `memory-expert`. That agent is
**not wired** in the code. Do not promise it in a demo. The four agents above
are what run.

## Run it

```bash
npm install     # first time only
npm run dev     # web on :5174, API on :8787
```

Open <http://localhost:5174/> and start with the **Guided tour** scenario.

Check the API and the agent team with:

```bash
curl -s http://localhost:8787/api/health
# {"ok":true,"arbor":true,"hasClient":true,"hasTeam":true}
```

Arbor needs `CORTI_REGION=eu` in `.env`. Copy `.env.example` to `.env` and add
the credentials for that region. The startup log prints `dev-weu` because that
string is hardcoded; the region actually used comes from `CORTI_REGION`.
