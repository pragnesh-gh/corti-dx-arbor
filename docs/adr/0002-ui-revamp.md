# ADR 0002 — UI revamp: a linear Next-action rail + in-app recipes

Date: 2026-08-24
Status: Accepted

## Context

Arbor's engine works end-to-end — a round completes with a full hypothesis
differential, zebra flagging, and a HITL test gate. But the **demo experience
was unintuitive** (the user's words: "a little unintuitive how we go through the
different rounds"):

- The round cycle had no single path. "Advance a round," the findings form, the
  test gate, and "set working dx" / "build treatment plan" were scattered across
  a left panel (EvidencePanel) and a right panel (ChatPanel), forcing left/right
  ping-pong.
- "Add finding / test result" was a loose form on the left, detached from the
  HITL gate that asked for it.
- "Set working dx" was a ghost button buried in chat actions with no explanation
  of *when* to use it.
- There were no recipes / how-to docs. The inspiration demo
  (`agent-eval-cases/demo/agentic-form-filling`, branch
  `feature/agentic-documenting`) turns the runnable app *into* its own
  documentation via an in-app `/docs` route with numbered recipes, each linking to
  a live feature. Arbor had none.
- The home page dropped the user straight into a scenario grid with no plain
  explanation of what the agent does vs what the clinician owns.

The user's directive: revamp the UI so rounds are intuitive (keeping *all* the
data-rich content — proposed tests, live differential %, hypothesis detail with
codes / evidence / discriminating tests, findings), add an in-app `/docs`
recipes tab, write a handoff doc, and emulate the `/wait-what` skill on the home
page (plain Simplified Technical English, Arbor's ubiquitous language, an
agent-side vs client-side split). The engine and the HTTP contract stay out of
scope.

## Decision

### 1. A linear "Next action" rail owns round progression

Replace the scattered round controls with a single `NextAction` component that
always shows, in one place, where the case is and what to do next — modeled on
the inspiration demo's `GuidedFlow` step panel + "next form" suggestion banner:

- A **completed-steps trail** (`✓ Intake · ✓ Round 1 …`) and a **stage line**
  (`Round N · {status}`) so the user always knows where they are.
- A prominent **next-action card** whose content depends on state: advance,
  awaiting-test-result, converged, treatment, new case.
- The **HITL finding form renders inline with the gate** — "Add result &
  advance" is one action. This fixes the clunky detached form.
- "Set working dx" is surfaced two ways: as a side action on the rail while
  reasoning, and as a "Converged enough?" hint in the detail panel where the
  user is looking at the leading hypothesis.

### 2. Reorganize the panels — content kept, structure fixed

The workspace becomes: left rail (NextAction + the existing EvidencePanel
content, minus the moved form), main view with a **Tree/List toggle** (both the
SVG tree and a ranked list — the user values both), and the right DetailPanel
unchanged. The content the user liked (presentation, findings, proposed tests,
live differential bars, hypothesis detail with codes/evidence/discriminating
tests, verdict, treatment) is preserved exactly — only the arrangement and the
co-location of the finding form change.

### 3. A plain-English home page

`Home.tsx` emulates the `/wait-what` skill: plain Simplified Technical English,
Arbor's ubiquitous language (from `CONTEXT.md`), and the four questions a new
reader asks — what the agent does, what the clinician owns, what we split
against, what it's useful for. Then the scenario cards bridge into the
workspace.

### 4. In-app `/docs` recipes

A Vite client-side route (`#/docs`) renders a docs shell with a numbered sidebar
and a recipe catalog (`recipes.ts`), mirroring the inspiration demo's
`RecipeMeta`. Each recipe has a `Recipe N` badge, a "See live feature →" link,
code snippets, and a "Next recipe" footer. The docs index holds the building
blocks, the minimal flow, the agent-vs-client split, and a "Design decisions"
note (the ADR-equivalent). No new runtime dependency — routing is a small `view`
state plus `history.pushState`.

### 5. A handoff doc + this ADR

`docs/HANDOFF.md` lets a fresh session pick up in this repo; this ADR records
the decisions (mirroring how the `feature/agentic-documenting` branch records
"Design decisions").

## Consequences

- The round cycle is one linear path. The user never guesses what to do next.
- The finding form is co-located with the gate that asks for it — no ping-pong.
- "Set working dx" is discoverable from two places where the user is actually
  looking.
- The home page explains Arbor in plain words before the console — better
  onboarding, and a better demo opening.
- The in-app recipes are co-located with the runnable demo (the inspiration
  demo's philosophy: the demo app *is* the documentation), each linking back to
  a live feature.
- The engine, the HTTP contract, and the data-rich content are all untouched —
  the revamp is purely structural.

## Alternatives considered

- **Keep the three-pane layout, add only a top stage bar.** Rejected: the user
  explicitly said the *structure* is the problem, not just the missing context.
  The data panels are good; their arrangement is not. A stage bar alone leaves
  the ping-pong.
- **Ranked list primary, tree secondary (drop the tree as headline).**
  Rejected as the sole approach: the tree is the retraceability headline
  (Arbor's differentiator). Offered instead as a toggle, so both lenses are
  available.
- **Docs as repo markdown only, no in-app tab.** Rejected: the user explicitly
  wanted the recipes in-app like the inspiration demo.
- **Engine changes to make rounds faster.** Out of scope by the user's
  directive; the 2–3 min round time is the model reasoning. The revamp makes
  rounds intuitive, not faster.
