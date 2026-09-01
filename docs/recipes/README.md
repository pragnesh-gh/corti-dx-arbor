# Arbor Recipes

Arbor is a retraceable differential-diagnosis tool: a clinician and an
agent work a case from **presentation** to **working diagnosis** to
**treatment plan**, keeping every step on a hypothesis tree.

The recipes below are the building blocks. Each one explains a single
feature, names the source file, and links to the live in-app recipe.
These markdown files are the **source of truth** — the in-app `/docs`
route renders the same content, so you can read the docs without running
the app, then run it to see each feature live.

> **For an LLM / agent starting work here:** read `AGENTS.md` at the repo
> root first for orientation, then the recipes in order (1 → 9). Each
> recipe names its source file. The fastest way to *see* a full run
> without the live API is the **Guided tour** scenario on the home page
> (`#/tutorial`) — a scripted, canned walk-through of every feature.

## The building blocks

1. **Presentation** — `web/src/scenarios.ts`. The seed a case branches
   from: chief complaint, history, observations, demographics.
2. **The round** — `server/domain/engine.ts`. One pass: gather evidence
   → update the differential → decide what's next.
3. **The tree** — `web/src/DecisionTree.tsx`. The differential is a tree
   of hypotheses; pruned branches stay visible.
4. **The HITL gate** — `web/src/NextAction.tsx`. When the engine proposes
   a test, the clinician enters the result; the cycle resumes.
5. **The working diagnosis** — the clinician confirms the converged
   hypothesis; the reasoning trail records the path.
6. **The treatment plan** — `server/domain/treatment.ts`. A second agent
   proposes management + surgical case-finding.

## The minimal flow

One full case, start to finish, against the Arbor server:

```
# 1. create a case from a presentation
POST /api/cases            { chiefComplaint, history, observations, demographics }

# 2. advance a round — the engine generates the differential + proposes a test
POST /api/cases/:id/advance

# 3. enter the test result (the HITL gate)
POST /api/cases/:id/finding  { summary, direction, testId }

# 4. advance again — the differential re-ranks; repeat until converged
POST /api/cases/:id/advance

# 5. set the working diagnosis
POST /api/cases/:id/diagnose

# 6. build the treatment plan
POST /api/cases/:id/treat
```

## What the agent does vs what the clinician owns

**Agent side**
- Generates and updates the differential.
- Branches a hypothesis when a finding splits it.
- Proposes the next test (maximum information gain).
- Grounds each hypothesis in literature and base rates via the registry
  experts.

**Client side**
- Orders the test and enters the finding.
- Confirms the working diagnosis.
- Reads the reasoning trail and the treatment plan.
- Holds the verdict — the agent is decision support, never the decider.

## The recipes

1. [Presentation & intake](01-presentation.md) — how a case starts
2. [The reasoning round](02-round.md) — gather, update, decide
3. [The hypothesis tree](03-tree.md) — branching, kept, retraceable
4. [Horses vs zebras](04-horses-zebras.md) — base rates and the zebra flag
5. [Tests as information gain](05-tests.md) — the HITL gate
6. [Evidence & experts](06-evidence.md) — findings, citations, the registry
7. [Working diagnosis](07-working-diagnosis.md) — convergence & the reasoning trail
8. [Treatment plan](08-treatment.md) — management + surgical case-finding
9. [The agent team](09-agent-team.md) — four Corti agents and their experts

## Design decisions

Arbor uses a **tree, not a flat list**, for the differential. A finding
that splits a hypothesis branches it into children; a ruled-out branch is
kept (dimmed), not deleted, so the reasoning trail is auditable: *this is
what I thought to arrive at this conclusion.*

- **Tree, not flat list** — retraceability is the headline property.
  Flat lists (DXplain-style) lose the path.
- **HITL, not autonomous** — the clinician orders tests, enters results,
  and confirms the verdict. Clinical safety.
- **Model-driven merge** — the LLM reasons; the server applies
  deterministic merge + normalization so the tree is always well-formed
  regardless of phrasing.
- **Corti is the only LLM dependency** — registry experts are the
  research/literature layer; no external API key.
