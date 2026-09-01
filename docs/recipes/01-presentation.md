# Recipe 1 — Presentation & intake: how a case starts

> **Live feature:** pick a scenario on the home page to start a case.
> Source: `web/src/scenarios.ts`, `server/domain/case-factory.ts`.

A Case starts from a **Presentation**: the patient's reason for encounter
plus the preliminaries already collected at intake. This is the seed the
whole diagnostic process branches from.

## The four parts of a Presentation

- **Chief complaint** — the reason for the encounter, in the patient's words.
- **History** — the story of the present illness.
- **Observations** — vitals, exam, preliminary labs.
- **Demographics** — age, sex, race/ethnicity, location, comorbidities.
  These set the base-rate priors.

## How a scenario becomes a Case

Source: `web/src/scenarios.ts` (the seed), `server/domain/case-factory.ts`
(the creation).

```ts
// a scenario is just a Presentation + a title
export interface Scenario {
  id: string;
  title: string;
  blurb: string;
  presentation: Presentation;
}

// the UI POSTs it to the server, which creates the Case
POST /api/cases  { chiefComplaint, history, observations, demographics, title }
```

The home page offers pre-authored scenarios so you can start a case in
one click. A Blank case lets you write your own presentation. Either way,
the server creates a Case with an empty tree and the round cycle ready
to run. The first card is a **Guided tour** — a scripted, canned
walk-through that needs no live API.

## Why demographics matter up front

Demographics are not paperwork — they set the **prior**. The prevalence
of a condition in the patient's age, sex, race/ethnicity, and geography is
the base rate before any specific finding. A 19-year-old with chest pain
and a 78-year-old with the same complaint start from very different
priors. See [Recipe 4 — Horses vs zebras](04-horses-zebras.md).

---

Next: [Recipe 2 — The reasoning round](02-round.md)
