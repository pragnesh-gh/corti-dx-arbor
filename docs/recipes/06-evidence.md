# Recipe 6 — Evidence & experts: findings, citations, the registry

> **Live feature:** select a hypothesis to see its evidence and codes.
> Source: `server/domain/agent-definitions.ts`, `server/domain/engine.ts`.

A **finding** is an observation or test result that changes the
probability of one or more hypotheses. Findings are dated and attributed
to a source (clinician, lab, literature). Each hypothesis carries its
supporting and contradicting evidence, visible in the detail panel.

## The registry experts

Source: `server/domain/agent-definitions.ts`. The hypothesis engine and
evidence orchestrator delegate to these Corti registry experts.

- **pubmed-expert** — literature search.
- **clinical-trials-expert** — studies and trials.
- **medical-calculator-expert** — risk scores, likelihood ratios.
- **drugbank-expert** — drug information.
- **coding-expert** — ICD-10 / SNOMED codes.
- **web-search-expert** — prevalence, guidelines.

## Citations

Findings from the literature carry a `citation` (label + url). The detail
panel renders supporting evidence in green and contradicting evidence in
red, each linking back to its finding.

```jsonc
// a finding the engine produced from the experts
{ summary: "ASO titer 800 IU/mL (reference <200)",
  direction: "supports",
  hypothesisNames: ["Acute rheumatic fever"],
  citation: { label: "PubMed 12345678", url: "https://..." } }
```

## Codes

Each hypothesis can carry ICD-10 / SNOMED codes (from the
`coding-expert`), shown in the detail panel. This is how Arbor bridges
the differential to the billing and record-keeping layer.

> Select a hypothesis node in the tree or list to see its full evidence:
> supporting and contradicting findings, codes, base-rate note, and the
> discriminating tests that would confirm or refute it.

---

Previous: [Recipe 5 — Tests & HITL](05-tests.md) · Next: [Recipe 7 — Working diagnosis](07-working-diagnosis.md)
