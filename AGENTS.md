# AGENTS.md — orientation for AI agents working on Arbor

Arbor is a **retraceable differential-diagnosis** tool: a clinician and
an agent work a case from **presentation** to **working diagnosis** to
**treatment plan**, keeping every step on a hypothesis **tree** (not a
flat list). It is a reference demo of agentic DDx on the **Corti Agent
API** — Corti is the only LLM dependency; the registry experts are the
research/literature layer.

This file is the entry point for an AI agent starting work here. Read it
first, then the recipes.

## The 30-second model

- A **Case** starts from a **Presentation** (chief complaint, history,
  observations, demographics). Demographics set the base-rate **priors**.
- Each **Round** the hypothesis engine re-ranks the **differential**,
  branches hypotheses when a finding splits them, and decides what's
  next: converge, propose a test, or gather more.
- When the engine proposes a **test**, it pauses at the **HITL gate**:
  the clinician orders the test, enters the **finding** (the result), and
  advances. The agent never orders or records on its own.
- When one hypothesis dominates, the clinician sets the **working
  diagnosis**; the **reasoning trail** records every branch taken and
  pruned so the verdict is auditable.
- A second agent then proposes a **treatment plan** + surgical
  **case-finding**.
- Common diagnoses lead by base rate (horses); rare ones are flagged 🦓
  (zebras) and **kept on the tree** until ruled out — never silently
  dropped.

## How to run it

```bash
npm install              # root workspaces: server + web
npm run typecheck        # both workspaces
npm run dev              # server :8787 + web :5174 (proxies /api → server)
```

The server reads `.env` from the repo root for Corti credentials
(`CORTI_REGION` + `AGENT_API_*_<REGION>`; EU is the working default —
dev-weu's A2A route intermittently 404s). See `.env.example`.

**Without the API:** open the home page and pick the **Guided tour**
scenario (the ★ card). It runs a scripted, canned walk-through of the
full case with instant stepping and teaching cues — no server, no API
key, no wait. It is the fastest way to see every feature.

## Where things live

| Concern | Path |
|---|---|
| Domain types (source of truth) | `server/domain/types.ts` |
| Client types (mirror) | `web/src/types.ts` |
| Hypothesis engine + round logic | `server/domain/engine.ts` |
| Agent definitions + prompts | `server/domain/agent-definitions.ts` |
| Treatment planner | `server/domain/treatment.ts` |
| Corti client (region-routable, resilient) | `server/corti/client.ts` |
| HTTP API | `server/index.ts` |
| Scenarios (seed presentations) | `web/src/scenarios.ts` |
| Guided tutorial (canned snapshots) | `web/src/tutorialCase.ts` |
| Decision tree visualization | `web/src/DecisionTree.tsx` |
| The round-cycle rail | `web/src/NextAction.tsx` |
| In-app docs/recipes (rendered) | `web/src/docs/` |
| Recipe markdown (source of truth, LLM-readable) | `docs/recipes/` |

## The recipes (read these next)

The recipes explain one building block each, name the source file, and
link to the live feature. The **markdown** versions in `docs/recipes/`
are the LLM-readable source of truth; the in-app `/docs` route
(`web/src/docs/recipes/*.tsx`) renders the same content for humans
inside the app. Start at the index:

- **[docs/recipes/README.md](docs/recipes/README.md)** — the building
  blocks, the minimal flow, agent-vs-client, the design decisions.
- 1 → 9 in order: presentation, round, tree, horses-zebras, tests (HITL),
  evidence, working diagnosis, treatment, the agent team.

## Domain language

`CONTEXT.md` is the ubiquitous-language glossary (Presentation,
Hypothesis, Differential, Round, Branching, Finding, Base rate, Zebra,
Working diagnosis, Reasoning trail, Treatment plan, the agents). Read it
to use the project's words precisely.

## Conventions

- **Server is the source of truth** for types and the tree. The client
  mirrors `server/domain/types.ts` in `web/src/types.ts`; keep them in
  sync by convention.
- The tree is **always well-formed**: the engine returns JSON; the
  server applies deterministic merge + normalization (`normalizeTree`).
  Never let the LLM phrasing produce a malformed tree.
- **HITL is load-bearing**: the clinician orders tests, enters results,
  and confirms the verdict. The agent is decision *support*, never the
  decider. Don't add autonomous test-ordering or auto-locked diagnoses.
- **Retraceability**: ruled-out branches stay on the tree (dimmed), not
  deleted. Don't prune them.
- Region routing defaults to **EU** (`CORTI_REGION=eu`); the resilience
  layer (`sendMessageReliable`, stale-agent recreation) survives the
  dev-weu 404 flapping. Keep it.
