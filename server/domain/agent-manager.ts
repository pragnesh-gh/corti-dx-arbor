/**
 * Agent lifecycle manager. Creates the Arbor team on the Corti platform at
 * startup, caches the agent ids, and cleans them up on shutdown.
 *
 * Agents are created ephemerally per server process. We name them with a stable
 * prefix so they're discoverable, and dedupe by exact name on restart.
 */

import type { CortiClient } from "../corti/client.js";
import type { AgentCreateRequest, AgentResponse } from "../corti/types.js";
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
    const page = await client.listAgents({ pageSize: 200, pageToken: token });
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
      const created = await client.createAgent(def);
      team[key] = created;
      console.log(`[arbor] created agent ${key}: ${created.id} (${created.name})`);
    }
  }
  return team;
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
