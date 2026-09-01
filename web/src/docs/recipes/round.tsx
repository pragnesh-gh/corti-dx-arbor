/**
 * Recipe 2 — The reasoning round. Source: server/domain/engine.ts.
 */

import { RecipeHeader } from "../RecipeHeader.js";
import { RecipeFooter } from "../RecipeFooter.js";
import { getRecipe } from "../recipes.js";

export default function RoundRecipe() {
  const recipe = getRecipe("round")!;
  return (
    <article className="recipe">
      <RecipeHeader recipe={recipe} />

      <p>
        A <strong>Round</strong> is one pass of the reasoning cycle. The clinician
        clicks "Advance a round"; the engine gathers evidence, updates the
        differential, and decides what to do next. A case is a sequence of rounds.
      </p>

      <h2 className="docs-h2">The three steps of a round</h2>
      <ol>
        <li><strong>Gather</strong> — the engine fans out to registry experts (pubmed, web-search, medical-calculator) to ground the top hypotheses.</li>
        <li><strong>Update</strong> — the hypothesis engine re-ranks the differential from the presentation + accumulated findings, branching where a finding splits a hypothesis.</li>
        <li><strong>Decide</strong> — the engine classifies the state:
          <ul>
            <li><em>converged</em> → one hypothesis dominates → set the working diagnosis.</li>
            <li><em>test</em> → propose the next test and pause for HITL.</li>
            <li><em>gather</em> → loop back for more evidence.</li>
          </ul>
        </li>
      </ol>

      <h2 className="docs-h2">The JSON contract</h2>
      <p className="muted small">
        Source: <code>server/domain/engine.ts</code>. The engine is instructed to
        return a single JSON object; the server applies deterministic merge +
        normalization so the tree is always well-formed.
      </p>
      <pre className="docs-code">{`{ // the engine returns this each round
  hypotheses: [{ name, probability(0-100), isZebra?, baseRateNote?,
                 parent?, rulesOut?: [name],
                 discriminatingTests?: [{ name, rationale }] }],
  findings?: [{ summary, detail?, direction?, hypothesisNames?, citation? }],
  message: string,
  decision:
    | { kind: "converged", hypothesisName, confidence? }
    | { kind: "test", name, rationale, discriminatesBetween? }
    | { kind: "gather", reason }
}`}</pre>

      <h2 className="docs-h2">Why a round takes a minute or two</h2>
      <p>
        A round is not a database lookup. The model genuinely reasons, and it
        fans out to expert agents in the process. On the dev-weu platform a round
        can also retry through transient 404 windows (the server's{" "}
        <code>sendMessageReliable</code> recovers the task and polls it). The UI
        shows a "still working" hint after a few seconds so you know it isn't
        hung.
      </p>

      <div className="docs-callout">
        <strong>The clinician's only action in a round is one click.</strong>{" "}
        Advance. The engine does the rest. The next action always shows in the
        NextAction rail — you never have to guess what to do.
      </div>

      <RecipeFooter slug="round" />
    </article>
  );
}
