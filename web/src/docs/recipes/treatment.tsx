/**
 * Recipe 8 — Treatment plan & surgical case-finding. Source: server/domain/treatment.ts, server/domain/agent-definitions.ts.
 */

import { RecipeHeader } from "../RecipeHeader.js";
import { RecipeFooter } from "../RecipeFooter.js";
import { getRecipe } from "../recipes.js";

export default function TreatmentRecipe() {
  const recipe = getRecipe("treatment")!;
  return (
    <article className="recipe">
      <RecipeHeader recipe={recipe} />

      <p>
        After a working diagnosis, a <strong>second agent</strong> — the treatment
        planner — proposes a management plan: first-line therapy, escalation, and
        any procedure or surgery with its indications. It also performs{" "}
        <strong>surgical case-finding</strong>: searching where in the world the
        relevant procedure has been performed, with outcomes and technique notes.
      </p>

      <h2 className="docs-h2">The treatment plan</h2>
      <p className="muted small">
        Source: <code>server/domain/treatment.ts</code>, <code>POST /api/cases/:id/treat</code>.
      </p>
      <pre className="docs-code">{`treatmentPlan: {
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
}`}</pre>

      <h2 className="docs-h2">Surgical case-finding</h2>
      <p>
        For any surgical or specialized procedure, the treatment planner uses{" "}
        <code>clinical-trials-expert</code>, <code>web-search-expert</code>, and{" "}
        <code>pubmed-expert</code> to find where the procedure has been performed,
        reported outcomes, and notable technique variations — so the clinician
        can draw inspiration. Each site carries a citation where available.
      </p>

      <h2 className="docs-h2">The treatment agent's experts</h2>
      <p className="muted small">
        Source: <code>treatmentPlannerDef</code> in{" "}
        <code>server/domain/agent-definitions.ts</code>.
      </p>
      <ul>
        <li>pubmed-expert</li>
        <li>clinical-trials-expert</li>
        <li>web-search-expert</li>
        <li>drugbank-expert</li>
      </ul>

      <div className="docs-callout">
        <strong>Decision support, not a prescription.</strong> The plan is explicit
        that it is for a licensed clinician. The surgical case-finding is
        inspiration, not a recommendation.
      </div>

      <RecipeFooter slug="treatment" />
    </article>
  );
}
