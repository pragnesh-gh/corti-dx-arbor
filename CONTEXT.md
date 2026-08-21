# Arbor — Context (Ubiquitous Language)

A glossary of the domain terms used in Arbor. Implementation-neutral: this
records *what the words mean*, not how the code works. Terms are sharpened as
the design is grilled.

## Presentation & intake

- **Presentation**: the patient's reason for encounter — the chief complaint plus
  the preliminaries already collected at intake (age, sex, race/ethnicity,
  geography, known comorbidities, initial vitals & observations). The seed the
  whole diagnostic process branches from.
- **Intake**: the act of capturing a Presentation into a structured record,
  optionally through a conversation with the interviewing expert.

## The diagnostic process

- **Differential diagnosis (DDx)**: the *process* of enumerating the plausible
  causes of a Presentation and narrowing them. In Arbor this is a *tree*, not a
  flat list.
- **Hypothesis**: one candidate explanation for the Presentation. A node in the
  tree. Carries a name, a probability mass, supporting/contradicting evidence,
  the tests that would confirm or refute it, and a status.
- **Differential**: the current frontier of live Hypotheses ranked by
  probability mass. The set the physician is actively choosing among.
- **Diagnostic session (a Case)**: a single patient workup. It owns the tree,
  the chat, the running evidence log, and the final verdict.
- **Round**: one pass of the reasoning cycle — gather evidence → update
  hypotheses → decide whether to order a test, conclude, or gather more.
- **Branching**: the act of refining one Hypothesis into sub-hypotheses
  (children) when a finding splits its meaning. This is what makes the
  reasoning a *tree* and what makes it *retraceable*.

## Evidence & tests

- **Finding**: an observation or test result that changes the probability of one
  or more Hypotheses. Findings are dated and attributed to a source (clinician,
  lab, literature).
- **Test**: an action that yields a Finding. Tests are chosen for their power to
  *split* the remaining Differential — i.e. their information gain.
- **Likelihood reasoning**: Bayesian-style updating — prevalence is the prior,
  each Finding adjusts posterior probability up or down. Arbor exposes this as
  explicit probability mass, not a black box.

## Demographics & base rates

- **Base rate (prior)**: the prevalence/incidence of a condition in the patient's
  demographic stratum (age, sex, race/ethnicity, geography). The prior before
  any specific Finding.
- **Zebra**: a rare diagnosis. Considered *after* common (horse) diagnoses on
  probability mass, but not forgotten — surfaced explicitly so rare but
  dangerous causes are not dropped prematurely.

## The verdict & hand-off

- **Working diagnosis**: the Hypothesis the Differential has converged on — the
  single root-cause the session concludes is most likely, with its
  confidence and the evidence path that reached it.
- **Reasoning trail (trace)**: the auditable record of every branch taken and
  pruned, every test ordered and what it ruled in/out, and why. The thing the
  physician retraces to defend the conclusion.
- **Treatment plan**: the next phase after a Working diagnosis — the proposed
  management, including any surgical case-finding (where procedures like this
  have been done, outcomes, technique notes drawn from the literature).

## Agents (Corti backbone)

- **Intake agent**: wraps the Corti `interviewing-expert`; turns free text into a
  structured Presentation.
- **Hypothesis engine**: the Corti agent that generates and updates the
  Differential from the Presentation + Findings. The "brain."
- **Evidence experts**: the Corti registry specialists (`pubmed-expert`,
  `clinical-trials-expert`, `medical-calculator-expert`, `coding-expert`,
  `web-search-expert`) fanned out in parallel to ground each Hypothesis in
  literature, statistics, and codes.
- **Memory**: the Corti `memory-expert` storing per-case traces and per-condition
  base rates so the engine sharpens over time.
