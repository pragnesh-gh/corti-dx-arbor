/**
 * Recipe 6 — Evidence & experts. Source: server/domain/agent-definitions.ts, server/domain/engine.ts.
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
        Source: <code>server/domain/agent-definitions.ts</code>. The hypothesis
        engine and evidence orchestrator delegate to these Corti registry experts.
      </p>
      <ul>
        <li><strong>pubmed-expert</strong> — literature search.</li>
        <li><strong>clinical-trials-expert</strong> — studies and trials.</li>
        <li><strong>medical-calculator-expert</strong> — risk scores, likelihood ratios.</li>
        <li><strong>drugbank-expert</strong> — drug information.</li>
        <li><strong>coding-expert</strong> — ICD-10 / SNOMED codes.</li>
        <li><strong>web-search-expert</strong> — prevalence, guidelines.</li>
      </ul>

      <h2 className="docs-h2">Citations</h2>
      <p>
        Findings from the literature carry a <code>citation</code> (label + url).
        The detail panel renders supporting evidence in green and contradicting
        evidence in red, each linking back to its finding.
      </p>
      <pre className="docs-code">{`// a finding the engine produced from the experts
{ summary: "ASO titer 800 IU/mL (reference <200)",
  direction: "supports",
  hypothesisNames: ["Acute rheumatic fever"],
  citation: { label: "PubMed 12345678", url: "https://..." } }`}</pre>

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
