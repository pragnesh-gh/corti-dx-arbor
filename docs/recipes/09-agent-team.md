# Recipe 9 — The agent team: four Corti agents and their experts

> **Live feature:** see the full team in this recipe.
> Source: `server/domain/agent-definitions.ts`.

Arbor is four Corti agents, each with a role, each wired to a set of
**registry experts** (the "tools" an agent can call during a round). All
are created `ephemeral` (per-session).

## The four agents

| Agent | Role | Experts (tools) |
|---|---|---|
| Intake | captures the structured presentation | `interviewing-expert` |
| Hypothesis engine | generates + Bayesian-updates the differential (the brain) | `web-search-expert`, `medical-calculator-expert` |
| Evidence orchestrator | fans out to experts, merges findings | `pubmed`, `clinical-trials`, `medical-calculator`, `drugbank`, `coding`, `web-search` |
| Treatment planner | management plan + surgical case-finding | `pubmed`, `clinical-trials`, `web-search`, `drugbank` |

## The hypothesis engine is the brain

Source: `HYPOTHESIS_ENGINE_PROMPT` in `server/domain/agent-definitions.ts`.

The engine is instructed to reason in two modes (Croskerry's dual-process
model): non-analytic pattern matching to generate the initial
differential fast, then analytic Bayesian updating with each finding. It
emits structured JSON so the server can build the tree.

## The experts, by name

- **pubmed-expert** — literature
- **clinical-trials-expert** — studies
- **medical-calculator-expert** — risk scores, likelihood ratios
- **drugbank-expert** — drugs
- **coding-expert** — ICD-10 / SNOMED
- **web-search-expert** — prevalence, guidelines
- **interviewing-expert** — structured interview

> **Corti is the only LLM dependency.** No external API key. The registry
> experts are the research and literature layer — the same platform this
> experiment is about.

---

Previous: [Recipe 8 — Treatment plan](08-treatment.md) · ↑ [Back to all recipes](README.md)
