/**
 * Recipe 9 — The agent team. Source: server/domain/agent-definitions.ts.
 */

import { RecipeHeader } from "../RecipeHeader.js";
import { RecipeFooter } from "../RecipeFooter.js";
import { getRecipe } from "../recipes.js";

export default function AgentTeamRecipe() {
  const recipe = getRecipe("agent-team")!;
  return (
    <article className="recipe">
      <RecipeHeader recipe={recipe} />

      <p>
        Arbor is four Corti agents, each with a role, each wired to a set of{" "}
        <strong>registry experts</strong> (the "tools" an agent can call during a
        round). All are created <code>ephemeral</code> (per-session).
      </p>

      <h2 className="docs-h2">The four agents</h2>
      <table className="docs-team">
        <thead>
          <tr><th>Agent</th><th>Role</th><th>Experts (tools)</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>Intake</td>
            <td>captures the structured presentation</td>
            <td><code>interviewing-expert</code></td>
          </tr>
          <tr>
            <td>Hypothesis engine</td>
            <td>generates + Bayesian-updates the differential (the brain)</td>
            <td><code>web-search-expert</code>, <code>medical-calculator-expert</code></td>
          </tr>
          <tr>
            <td>Evidence orchestrator</td>
            <td>fans out to experts, merges findings</td>
            <td><code>pubmed</code>, <code>clinical-trials</code>, <code>medical-calculator</code>, <code>drugbank</code>, <code>coding</code>, <code>web-search</code></td>
          </tr>
          <tr>
            <td>Treatment planner</td>
            <td>management plan + surgical case-finding</td>
            <td><code>pubmed</code>, <code>clinical-trials</code>, <code>web-search</code>, <code>drugbank</code></td>
          </tr>
        </tbody>
      </table>

      <h2 className="docs-h2">The hypothesis engine is the brain</h2>
      <p className="muted small">
        Source: <code>HYPOTHESIS_ENGINE_PROMPT</code> in{" "}
        <code>server/domain/agent-definitions.ts</code>.
      </p>
      <p>
        The engine is instructed to reason in two modes (Croskerry's dual-process
        model): non-analytic pattern matching to generate the initial
        differential fast, then analytic Bayesian updating with each finding. It
        emits structured JSON so the server can build the tree.
      </p>

      <h2 className="docs-h2">The experts, by name</h2>
      <ul>
        <li><strong>pubmed-expert</strong> — literature</li>
        <li><strong>clinical-trials-expert</strong> — studies</li>
        <li><strong>medical-calculator-expert</strong> — risk scores, likelihood ratios</li>
        <li><strong>drugbank-expert</strong> — drugs</li>
        <li><strong>coding-expert</strong> — ICD-10 / SNOMED</li>
        <li><strong>web-search-expert</strong> — prevalence, guidelines</li>
        <li><strong>interviewing-expert</strong> — structured interview</li>
      </ul>

      <div className="docs-callout">
        <strong>Corti is the only LLM dependency.</strong> No external API key.
        The registry experts are the research and literature layer — the same
        platform this experiment is about.
      </div>

      <RecipeFooter slug="agent-team" />
    </article>
  );
}
