/**
 * Recipe 4 — Horses vs zebras. Source: server/domain/agent-definitions.ts (prompt), CONTEXT.md.
 */

import { RecipeHeader } from "../RecipeHeader.js";
import { RecipeFooter } from "../RecipeFooter.js";
import { getRecipe } from "../recipes.js";

export default function HorsesZebrasRecipe() {
  const recipe = getRecipe("horses-zebras")!;
  return (
    <article className="recipe">
      <RecipeHeader recipe={recipe} />

      <p>
        The engine is told to reason the way an expert does:{" "}
        <strong>"when you hear hoofbeats, think horses, not zebras."</strong>{" "}
        Common diagnoses lead by base-rate probability. But a rare diagnosis is
        <strong> never dropped silently</strong> — it is flagged 🦓 and kept on the
        tree at low mass until actively ruled out.
      </p>

      <h2 className="docs-h2">The base-rate prior</h2>
      <p>
        The prevalence of a condition in the patient's demographic stratum (age,
        sex, race/ethnicity, geography) is the <strong>prior</strong>. Each
        finding adjusts the posterior up or down (Bayesian-style). The engine
        states the base-rate assumption it used for each hypothesis.
      </p>

      <h2 className="docs-h2">The zebra flag</h2>
      <p className="muted small">
        Source: the hypothesis engine system prompt in{" "}
        <code>server/domain/agent-definitions.ts</code>.
      </p>
      <pre className="docs-code">{`// from the engine's hard rules:
// 2. But NEVER drop a rare diagnosis silently. Mark zebras with
//    isZebra=true and keep them on the tree at low mass so dangerous
//    rare causes stay visible until actively ruled out.`}</pre>

      <h2 className="docs-h2">Why this matters</h2>
      <p>
        A flat-differential tool will quietly drop a 1% diagnosis. Arbor keeps
        it — because some zebras are dangerous (endocarditis, vasculitis), and
        dropping them early is how rare causes get missed. The zebra stays on
        the tree, dimmed once ruled out, so the clinician can see it was
        considered.
      </p>

      <h2 className="docs-h2">Demographic adjustment</h2>
      <p>
        The same symptom starts from different priors in different people.
        Lyme arthritis is a horse in rural Minnesota and a zebra in Lisbon.
        The engine is instructed to adjust the prior by the patient's
        demographics and to say so in the <code>baseRateNote</code>.
      </p>

      <div className="docs-callout">
        Look for the <span className="zebra-tag">🦓 zebra</span> tag on a
        low-probability node in the tree or list view — it stays until the engine
        rules it out.
      </div>

      <RecipeFooter slug="horses-zebras" />
    </article>
  );
}
