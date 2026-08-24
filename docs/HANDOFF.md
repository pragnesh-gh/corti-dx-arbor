# Arbor — Handoff (for a fresh session)

This is the document to read to pick up work on Arbor in this repo. It tells you
where things live, how to run it, the platform quirks that bite, and what is
open. Arbor is a retraceable differential-diagnosis agent on the Corti Agent
API; the engine works end-to-end and the UI was revamped to make the round cycle
linear.

## How to run

```bash
npm run dev      # server on :8787, web UI on :5174 (concurrently)
```

The server loads `.env` from the repo root (it walks up from `server/` to find
it — see `loadRootEnv` in `server/index.ts`). `.env` needs the Corti dev-WEU
credentials: `AGENT_API_URL_DEV_WEU`, `AGENT_API_AUTH_URL_DEV_WEU`,
`AGENT_API_CLIENT_ID_DEV_WEU`, `AGENT_API_CLIENT_SECRET_DEV_WEU`,
`CORTI_TENANT_NAME`. Copy `.env.example`. The web UI proxies `/api/*` to the
server (see `web/vite.config.ts`).

- Health: `GET http://localhost:8787/api/health` → `{"ok":true,...,"hasTeam":...}`.
- UI: `http://localhost:5174`. Home page is plain English; scenario cards start a
  case; the workspace runs the rounds; `#/docs` is the in-app recipes.
- A single round takes 1–3 min (the model genuinely reasons). That is expected.

## The platform quirk you must know

The dev-WEU platform **flaps between working windows and 404 windows** on a
sub-minute cadence, with two failure modes:

1. **Long-call response 404** — `message:send` returns a plain-text `404 page not
   found` on long-running calls even though the underlying task executes and
   completes (~1–3 min). `CortiClient.sendMessageReliable`
   (`server/corti/client.ts`) recovers the task by `messageId` and polls
   `getTask` to completion. If a round ever errors, retry — the next window is
   usually seconds away.
2. **Stale agents** — agents created in an earlier platform "window" reliably
   404 on `message:send` once the platform flips to a new window, even though
   agent CRUD still returns 200. `sendMessageReliable` invokes an
   `onStaleAgent` callback after 3 consecutive send-404s; the `/advance` handler
   recreates the hypothesis engine in the current window and retries.

The server boots resiliently: it listens immediately, then provisions the agent
team in the background (`getTeam()` / `getHypothesisEngineId()` await it). So
`hasTeam:false` right after boot is normal — it becomes `true` within seconds.

## Where things live

**Engine (the source of truth — do not change lightly):**
- `server/domain/engine.ts` — the round: prompt → `sendMessageReliable` → parse
  JSON → merge → normalize → decide. The JSON contract the engine returns is
  documented in `web/src/docs/recipes/round.tsx`.
- `server/domain/agent-definitions.ts` — the 4 agents + their registry expert
  connectors (the "tools"). The hypothesis engine's system prompt holds the hard
  rules (horses-vs-zebras, base rates, branching, never-drop-a-zebra).
- `server/corti/client.ts` — the Corti Agent API client (OAuth2, agent CRUD,
  A2A send, `sendMessageReliable`, `streamMessage`).
- `server/index.ts` — the Express endpoints and the self-healing `/advance`
  loop.

**UI (the revamped layer):**
- `web/src/App.tsx` — the light router (`home` / `workspace` / `docs` via
  `history.pushState`) and the workspace layout.
- `web/src/NextAction.tsx` — the linear round-progression spine + inline HITL
  finding form. **This is the core of the revamp.**
- `web/src/EvidencePanel.tsx` — left panel content (presentation, findings,
  proposed tests, live differential). The finding form moved out of here into
  NextAction.
- `web/src/DecisionTree.tsx` — the SVG retraceable tree (one of two views).
- `web/src/RankedDifferential.tsx` — the ranked-list view (the other view).
- `web/src/DetailPanel.tsx` — hypothesis detail (codes, evidence for/against,
  discriminating tests, base-rate, zebra) + verdict + treatment. Has a
  "Converged enough? Set working dx" hint.
- `web/src/ChatPanel.tsx` — slimmed to free-text decision-support Q&A only.
- `web/src/Home.tsx` — plain-English home (agent/client split, ubiquitous
  language).
- `web/src/docs/` — the in-app recipes (`recipes.ts` catalog, `Docs.tsx`
  router, `DocsLayout`, `DocsIndex`, `RecipeHeader`, `RecipeFooter`, one file
  per recipe in `docs/recipes/`).
- `web/src/scenarios.ts` — the seed presentations (2 short walk-throughs + the
  originals).
- `web/src/api.ts`, `web/src/types.ts` — the API client and shared types
  (mirror `server/domain/types.ts` by convention).

**Docs:**
- `CONTEXT.md` — the ubiquitous language (the words the home page and recipes
  use). Read this to speak in Arbor's domain terms.
- `docs/adr/0001-architecture.md` — the architecture decision (the tree, the
  bounded cycle, HITL, Corti-only).
- `docs/adr/0002-ui-revamp.md` — this revamp's decision.
- `docs/research/` — the DDx-process research that informed the design.

## The engine's JSON contract (what the LLM returns each round)

The hypothesis engine is instructed to return a single JSON object. The server
parses it with `extractJson` and applies deterministic merge + normalization
(`normalizeTree`) so the tree is always well-formed regardless of phrasing. The
shape:

```
{ hypotheses: [{ name, probability(0-100), isZebra?, baseRateNote?, parent?,
                 rulesOut?: [name], discriminatingTests?: [{ name, rationale }] }],
  findings?: [{ summary, detail?, direction?, hypothesisNames?, citation? }],
  message: string,
  decision: { kind: "converged" | "test" | "gather", ... } }
```

Source: `server/domain/engine.ts` (`EngineRawResponse`).

## Open UX work / next ideas

- The 2–3 min round time is the model reasoning; making rounds *faster* needs
  engine work (out of scope for the revamp). The revamp makes them *intuitive*.
- Voice/dictation input (the inspiration demo's `@corti/dictation-web`) is not
  wired; the finding form is text. A natural follow-up.
- The free-text "Ask the engine" Q&A is non-stream; a streaming chat would feel
  more alive.
- The scenarios are static; a "write your own presentation" Blank case exists
  but has no guided intake interview (the `intake` agent exists but is not
  surfaced in the UI).

## Skills and conventions used here

The home page emulates the `/wait-what` skill: re-pitch in plain Simplified
Technical English using the ubiquitous language from `CONTEXT.md`. The recipes
mirror the inspiration demo's in-app `/docs` structure
(`agent-eval-cases/demo/agentic-form-filling`, branch
`feature/agentic-documenting`). The `improve-codebase-architecture` skill is
reserved for explicit invocation and was not triggered.
