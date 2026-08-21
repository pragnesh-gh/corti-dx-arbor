/**
 * Probe the Corti registry and list the available expert connectors.
 * Verifies credentials and shows which experts Arbor can fan out to.
 *
 * Usage: npm run probe-registry
 */

import "dotenv/config";

import { CortiClient } from "../server/corti/client.js";

async function main() {
  const client = CortiClient.fromEnv();
  console.log("[probe] listing registry connectors…");
  const reg = await client.listRegistryConnectors();
  console.log(`[probe] ${reg.connectors.length} connectors available:`);
  for (const c of reg.connectors) {
    console.log(`  - ${c.name}${c.type ? ` [${c.type}]` : ""}${c.description ? ` — ${c.description.slice(0, 80)}` : ""}`);
  }
}

main().catch((e) => {
  console.error("[probe] failed:", e);
  process.exit(1);
});
