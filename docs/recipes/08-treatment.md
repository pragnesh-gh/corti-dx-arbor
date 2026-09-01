# Recipe 8 — Treatment plan & surgical case-finding

> **Live feature:** after diagnosis, click "Build treatment plan".
> Source: `server/domain/treatment.ts`, `server/domain/agent-definitions.ts`.

After a working diagnosis, a **second agent** — the treatment planner —
proposes a management plan: first-line therapy, escalation, and any
procedure or surgery with its indications. It also performs **surgical
case-finding**: searching where in the world the relevant procedure has
been performed, with outcomes and technique notes.

## The treatment plan

Source: `server/domain/treatment.ts`, `POST /api/cases/:id/treat`.

```jsonc
treatmentPlan: {
  summary: "First-line: penicillin G ...",
  steps: [
    { title: "First-line therapy", detail: "...", citation? },
    { title: "Escalation", detail: "..." },
  ],
  caseFinding?: {
    summary: "Where valve replacement has been performed ...",
    sites: [{ label, url?, note? }],
  },
  createdAt
}
```

## Surgical case-finding

For any surgical or specialized procedure, the treatment planner uses
`clinical-trials-expert`, `web-search-expert`, and `pubmed-expert` to
find where the procedure has been performed, reported outcomes, and
notable technique variations — so the clinician can draw inspiration.
Each site carries a citation where available.

## The treatment agent's experts

Source: `treatmentPlannerDef` in `server/domain/agent-definitions.ts`.

- pubmed-expert
- clinical-trials-expert
- web-search-expert
- drugbank-expert

> **Decision support, not a prescription.** The plan is explicit that it
> is for a licensed clinician. The surgical case-finding is inspiration,
> not a recommendation.

---

Previous: [Recipe 7 — Working diagnosis](07-working-diagnosis.md) · Next: [Recipe 9 — The agent team](09-agent-team.md)
