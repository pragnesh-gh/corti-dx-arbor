/**
 * Agent lifecycle manager. Creates the Arbor team on the Corti platform at
 * startup, caches the agent ids, and cleans them up on shutdown.
 *
 * Agents are created ephemerally per server process. We name them with a stable
 * prefix so they're discoverable, and dedupe by exact name on restart.
 */

import type { CortiClient } from "../corti/client.js";
import type { AgentCreateRequest, AgentResponse } from "../corti/types.js";
import { withRetry } from "./engine.js";
import {
  AGENT_NAMES,
  evidenceOrchestratorDef,
  hypothesisEngineDef,
  intakeAgentDef,
  treatmentPlannerDef,
} from "./agent-definitions.js";

export interface AgentTeam {
  intake: AgentResponse;
  hypothesisEngine: AgentResponse;
  evidenceOrchestrator: AgentResponse;
  treatmentPlanner: AgentResponse;
}

const DEFS: Record<keyof AgentTeam, () => AgentCreateRequest> = {
  intake: intakeAgentDef,
  hypothesisEngine: hypothesisEngineDef,
  evidenceOrchestrator: evidenceOrchestratorDef,
  treatmentPlanner: treatmentPlannerDef,
};

async function findByName(
  client: CortiClient,
  name: string,
): Promise<AgentResponse | undefined> {
  let token: string | undefined;
  while (true) {
    let page;
    try {
      page = await client.listAgents({ pageSize: 200, pageToken: token });
    } catch (e) {
      // Listing is best-effort de-dupe. If it flakes (transient 404/5xx),
      // fall through to creating a fresh agent rather than failing boot.
      console.warn(`[arbor] agent list failed (${(e as Error).message.slice(0, 80)}); will create fresh`);
      return undefined;
    }
    const found = page.agents.find((a) => a.name === name);
    if (found) return found;
    token = page.nextPageToken;
    if (!token) return undefined;
  }
}

/** Provision (or reuse) the team. Logs each agent id. */
export async function provisionTeam(client: CortiClient): Promise<AgentTeam> {
  const team = {} as AgentTeam;
  for (const key of Object.keys(DEFS) as (keyof AgentTeam)[]) {
    const def = DEFS[key]();
    const existing = await findByName(client, def.name);
    if (existing) {
      team[key] = existing;
      console.log(`[arbor] reuse agent ${key}: ${existing.id} (${existing.name})`);
    } else {
      const created = await withRetry(() => client.createAgent(def));
      team[key] = created;
      console.log(`[arbor] created agent ${key}: ${created.id} (${created.name})`);
    }
  }
  return team;
}

/** Recreate a single team agent by role, returning the fresh agent. Used to
 * self-heal across dev-weu platform "window" flaps: an agent created in an
 * earlier window reliably 404s on /a2a/message:send once the platform flips
 * to a new window, while a freshly-created agent in the current window works.
 * Deleting the stale one first is best-effort (it often 404s too). */
export async function recreateAgent(
  client: CortiClient,
  team: AgentTeam,
  role: keyof AgentTeam,
): Promise<AgentResponse> {
  const def = DEFS[role]();
  const stale = team[role];
  if (stale) {
    try { await client.deleteAgent(stale.id); }
    catch { /* stale agent often 404s on delete too — ignore */ }
  }
  const created = await withRetry(() => client.createAgent(def));
  team[role] = created;
  console.log(`[arbor] recreated agent ${role}: ${created.id} (${created.name})`);
  return created;
}

/** Delete the team (best effort, on shutdown if ephemeral). */
export async function teardownTeam(client: CortiClient, team: AgentTeam): Promise<void> {
  for (const key of Object.keys(team) as (keyof AgentTeam)[]) {
    const a = team[key];
    try {
      await client.deleteAgent(a.id);
      console.log(`[arbor] deleted agent ${key}: ${a.id}`);
    } catch (e) {
      console.warn(`[arbor] failed to delete agent ${key}: ${(e as Error).message}`);
    }
  }
}

export { AGENT_NAMES };
