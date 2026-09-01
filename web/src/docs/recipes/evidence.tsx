/**
 * Recipe 6 — Evidence & experts. Source: server/domain/agent-definitions.ts,
 * server/domain/engine.ts, server/domain/evidence.ts, server/domain/sources.ts.
 */

import { RecipeHeader } from "../RecipeHeader.js";
import { RecipeFooter } from "../RecipeFooter.js";
import { getRecipe } from "../recipes.js";

export default function EvidenceRecipe() {
  const recipe = getRecipe("evidence")!;
  return (
    <article className="recipe">
      <RecipeHeader recipe={recipe} />

      <p>
        A <strong>finding</strong> is an observation or test result that changes
        the probability of one or more hypotheses. Findings are dated and
        attributed to a source (clinician, lab, literature). Each hypothesis
        carries its supporting and contradicting evidence, visible in the detail
        panel.
      </p>

      <h2 className="docs-h2">The registry experts</h2>
      <p className="muted small">
        Source: <code>server/domain/agent-definitions.ts</code>. The{" "}
        <strong>evidence pass</strong> (<code>server/domain/evidence.ts</code>)
        drives these Corti registry experts once per round.
      </p>
      <ul>
        <li><strong>pubmed-expert</strong> — literature search.</li>
        <li><strong>clinical-trials-expert</strong> — studies and trials.</li>
        <li><strong>medical-calculator-expert</strong> — risk scores, likelihood ratios.</li>
        <li><strong>drugbank-expert</strong> — drug information.</li>
        <li><strong>coding-expert</strong> — ICD-10 / SNOMED codes.</li>
        <li><strong>web-search-expert</strong> — prevalence, guidelines.</li>
      </ul>

      <h2 className="docs-h2">The evidence pass</h2>
      <p>
        Every round fires two agents <strong>in parallel</strong>: the hypothesis
        engine updates the differential, and the evidence pass asks the experts
        for real, checkable literature on the top live hypotheses. The pass is
        best-effort — if it times out or the platform flaps, the round still
        completes, just ungrounded.
      </p>
      <p>
        The pass is also <strong>pipelined</strong>. What it returns in round{" "}
        <em>n</em> becomes findings immediately, and the citable source pool for
        round <em>n+1</em>. That keeps round latency flat instead of doubling it —
        the cost is that round 1 has nothing to cite yet, which is honest: round 1
        is pattern recognition, not literature review.
      </p>

      <h2 className="docs-h2">Sources and inline citations</h2>
      <p>
        A <strong>Source</strong> is a citable artifact — a paper, a trial, a
        guideline. A <strong>Citation</strong> is one <em>use</em> of a Source at
        one point in the text. Sources live in one append-only, deduplicated pool
        per case (<code>case.sources</code>), deduped on DOI → PMID → NCT →
        normalized URL → title, so one paper is one number no matter how often it
        is invoked. A source's index <em>is</em> its marker number, and never
        changes.
      </p>
      <p>
        Prose carries inline markers that render as superscript chips: the
        hypothesis description and base-rate note, the discriminating-test
        rationale, each finding, and every step of the reasoning trail.
      </p>
      <pre className="docs-code">{`// what the EVIDENCE PASS returns — the only thing that can add a source
{ sources: [{ ref: "N1", title: "Age-stratified PE prevalence",
              identifier: "PMID:12345678", type: "paper" }],
  findings: [{ summary: "Prevalence rises sharply after 60",
               direction: "supports", sourceRefs: ["N1"] }] }

// next round, the HYPOTHESIS ENGINE sees the pool and cites it by ref
{ hypotheses: [{ name: "Pulmonary embolism",
                 baseRateNote: "Prevalence rises sharply after 60 [S3]." }] }

// what the server stores, after rewriting refs to stable pool indices
{ baseRateNote: "Prevalence rises sharply after 60 [3]." }`}</pre>
      <div className="docs-callout">
        The hypothesis engine has no <code>sources</code> field: it can cite the
        pool, never add to it. A marker naming anything the experts did not
        return is <strong>stripped</strong> server-side and logged, never
        rendered. An uncited claim is honest; a footnote that resolves to
        nothing is not.
      </div>

      <h2 className="docs-h2">Reading the findings</h2>
      <p>
        The findings panel groups findings under the hypothesis each one moves,
        ranked by probability, with a for/against tally per group — so the list
        answers "so what?" rather than just "what happened". A finding bearing on
        several hypotheses appears under each. The <em>Timeline</em> toggle
        restores the plain chronological view.
      </p>

      <h2 className="docs-h2">Codes</h2>
      <p>
        Each hypothesis can carry ICD-10 / SNOMED codes (from the{" "}
        <code>coding-expert</code>), shown in the detail panel. This is how Arbor
        bridges the differential to the billing and record-keeping layer.
      </p>

      <div className="docs-callout">
        Select a hypothesis node in the tree or list to see its full evidence:
        supporting and contradicting findings, codes, base-rate note, and the
        discriminating tests that would confirm or refute it.
      </div>

      <RecipeFooter slug="evidence" />
    </article>
  );
}
