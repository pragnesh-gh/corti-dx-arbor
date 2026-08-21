# Arbor 🌳

A **retraceable differential-diagnosis** agent on the Corti Agent API. A clinician
walks a patient from presentation → narrowed differential → working diagnosis →
treatment plan, while a **decision-tree of hypotheses** grows, branches, and
prunes — every step retraced.

Arbor models how an expert physician actually reasons:

- **Dual-process reasoning** — generate an illness-script-driven differential fast
  (System 1), then update it Bayesian-style with each finding (System 2).
- **Horses vs zebras** — common diagnoses lead by base-rate probability, but rare
  dangerous ones are **kept on the tree** (🦓) until actively ruled out, never
  silently dropped.
- **Demographic base rates** — prevalence is adjusted for the patient's age, sex,
  race/ethnicity, and geography.
- **Branching, not a flat list** — when a finding splits a hypothesis, it
  branches into refined children. Pruned branches stay visible (dimmed), so the
  reasoning trail is auditable: *"this is what I thought to arrive at this conclusion."*
- **Tests as information gain** — the engine proposes the next test that best
  *splits* the remaining differential, not the one that merely confirms the favorite.
- **Human-in-the-loop** — the clinician owns the verdict: they order tests, enter
  results, and confirm the working diagnosis. The agent is decision *support*,
  never the decider (appropriate for clinical safety).
- **Treatment + surgical case-finding** — after a working diagnosis, a second
  agent proposes a plan and searches where in the world the relevant procedure
  has been performed, with outcomes and technique notes.

Backed by the **Corti Agent API** (dev-WEU): the hypothesis engine delegates to
registry experts — `pubmed`, `clinical-trials`, `medical-calculator`, `coding`
(ICD-10/SNOMED), `web-search` — to ground each hypothesis in literature, base
rates, and codes.

## Architecture

See [`docs/adr/0001-architecture.md`](docs/adr/0001-architecture.md) and
[`CONTEXT.md`](CONTEXT.md) (the domain glossary).

```
corti-dx-arbor/
├── server/
│   ├── corti/            # proven REST + A2A client (OAuth2, agent CRUD, SSE)
│   ├── domain/
│   │   ├── types.ts          # the reasoning-tree domain model
│   │   ├── agent-definitions.ts  # system prompts for the agent team
│   │   ├── agent-manager.ts  # provision/reuse the Corti team
│   │   ├── case-store.ts     # in-memory case store
│   │   ├── case-factory.ts   # create a case from a presentation
│   │   ├── engine.ts         # the reasoning round: merge + normalize + decide
│   │   └── treatment.ts      # post-diagnosis treatment + case-finding
│   └── index.ts          # Express API + SSE
├── web/
│   └── src/
│       ├── App.tsx          # 3-pane console + scenario picker
│       ├── DecisionTree.tsx # the headline SVG tree visualization
│       ├── EvidencePanel.tsx# presentation + findings + test entry
│       ├── ChatPanel.tsx    # engine conversation + HITL gate
│       ├── DetailPanel.tsx  # hypothesis evidence + verdict + plan
│       └── scenarios.ts     # 4 example patient presentations
└── scripts/
    ├── smoke.ts          # end-to-end against live Corti API
    ├── run-scenarios.ts  # headless multi-scenario runner
    └── probe-registry.ts # list available Corti experts
```

### The reasoning cycle (per round)

```
presentation + findings
        │
        ▼
  hypothesis engine  ──(structured JSON)──▶  merge + normalize probabilities
        │                                           │
        ▼                                           ▼
  decision ─┬─ converged ──▶ working diagnosis ──▶ treatment plan + case-finding
            ├─ test      ──▶ HITL gate (clinician enters result) ──▶ loop
            └─ gather    ──▶ loop
```

Probabilities are normalized across each sibling group so they sum to 1 — the
Bayesian "mass" invariant holds regardless of how the LLM phrased its numbers.

## Run it

### Prereqs

- Node 20+
- Corti dev-WEU credentials. Copy `.env.example` → `.env` and fill from
  `/Users/pkp/Desktop/Work/agent-eval-cases/.env`:
  ```
  AGENT_API_URL_DEV_WEU=https://api.dev-weu.corti.app
  AGENT_API_AUTH_URL_DEV_WEU=https://auth.dev-weu.corti.app
  AGENT_API_CLIENT_ID_DEV_WEU=...
  AGENT_API_CLIENT_SECRET_DEV_WEU=...
  CORTI_TENANT_NAME=base
  PORT=8787
  ```

### Headless smoke test (fastest way to see it work)

```bash
npm install
npm run probe-registry   # verify creds + list experts
npm run smoke            # one scenario, live Corti API, prints the tree + dx
npm run scenarios        # multiple scenarios, compact verdicts
```

### Full UI

```bash
npm install
npm run dev              # starts server (:8787) + web (:5174) together
```

Open <http://localhost:5174>. Pick a scenario → **Advance a round** → at the
HITL gate, enter a finding on the left → advance again → watch the tree branch
and converge → **Build treatment plan**.

## Example scenarios

`web/src/scenarios.ts` ships four:

1. **Fever + migrating joint pain** (19yo male) — viral illness vs acute
   rheumatic fever vs reactive arthritis, with a post-strep track.
2. **Fatigue + microcytic anemia** (58yo woman, West African descent, Lisbon) —
   iron deficiency vs hemoglobinopathy vs GI malignancy.
3. **Headache + papilledema** (27yo woman, high BMI, on OCP) — idiopathic
   intracranial hypertension vs cerebral venous sinus thrombosis (the zebra).
4. **Chronic cough + weight loss** (returning traveler from East Africa) —
   post-viral vs tuberculosis vs lymphoma, split by imaging and sputum.

## Disclaimer

Arbor is a research/demo prototype for clinical decision-support. It does not
provide medical advice, it is not a medical device, and it is not a substitute
for a licensed clinician's judgment.
