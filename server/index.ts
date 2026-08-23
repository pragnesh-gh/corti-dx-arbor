/**
 * Arbor server — Express API for the differential-diagnosis engine.
 *
 * Endpoints:
 *   POST   /api/cases                  create a case from a presentation
 *   GET    /api/cases                  list cases
 *   GET    /api/cases/:id              full case snapshot (tree + events + verdict)
 *   DELETE /api/cases/:id              delete a case
 *   POST   /api/cases/:id/advance      run one reasoning round (engine)
 *   POST   /api/cases/:id/finding       clinician enters a finding / test result
 *   POST   /api/cases/:id/diagnose     force-converge to a working diagnosis
 *   POST   /api/cases/:id/treat         build the treatment plan (post-diagnosis)
 *   POST   /api/cases/:id/chat         free-text message to the engine (non-stream)
 *   GET    /api/cases/:id/stream       SSE: live events for this case
 *   GET    /api/health                 liveness
 *   GET    /api/registry               list available Corti registry experts
 *
 * The HITL model: after `advance`, if the decision is "test", the case is
 * awaitingHitl and the UI prompts the clinician; they POST /finding with the
 * result, then /advance again. The cycle continues until "converged".
 */

import * as path from "node:path";
import * as fs from "node:fs";
import dotenv from "dotenv";

// Load .env from the repo root, not just the server/ workspace dir. The dev
// script runs `tsx watch index.ts` with cwd=server/, so dotenv/config (which
// reads process.cwd()/.env) would miss the root .env. Walk up to find it.
(function loadRootEnv() {
  let dir = process.cwd();
  for (let i = 0; i < 6; i++) {
    const candidate = path.join(dir, ".env");
    if (fs.existsSync(candidate)) { dotenv.config({ path: candidate }); return; }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  // fall back to default behavior (process.cwd()/.env)
  dotenv.config();
})();
import cors from "cors";
import express from "express";

import { CortiClient } from "./corti/client.js";
import { provisionTeam, teardownTeam, type AgentTeam } from "./domain/agent-manager.js";
import { store } from "./domain/case-store.js";
import { createCase } from "./domain/case-factory.js";
import { recordFinding, runRound, setWorkingDiagnosis, withRetry } from "./domain/engine.js";
import { buildTreatmentPlan } from "./domain/treatment.js";
import type { Case, Presentation } from "./domain/types.js";

const PORT = Number(process.env.PORT || 8787);

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

let client: CortiClient;
let team: AgentTeam;

// ---- SSE fan-out (per-case live subscribers) ------------------------------

const subscribers = new Map<string, Set<(ev: unknown) => void>>();

function emit(caseId: string, event: { kind: string; payload: unknown }): void {
  const subs = subscribers.get(caseId);
  if (subs) for (const s of subs) s(event);
}

// ---- Health & registry ----------------------------------------------------

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, arbor: true, hasClient: !!client, hasTeam: !!team });
});

app.get("/api/registry", async (_req, res) => {
  try {
    const reg = await client.listRegistryConnectors();
    res.json(reg);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

// ---- Cases ----------------------------------------------------------------

app.post("/api/cases", (req, res) => {
  const body = req.body as Partial<Presentation> & { title?: string };
  if (!body?.chiefComplaint) {
    res.status(400).json({ error: "chiefComplaint is required" });
    return;
  }
  const presentation: Presentation = {
    chiefComplaint: body.chiefComplaint,
    history: body.history,
    observations: body.observations || [],
    demographics: body.demographics || {},
  };
  const c = createCase(presentation, body.title);
  emit(c.id, { kind: "presentation", payload: c });
  res.status(201).json(store.snapshot(c.id));
});

app.get("/api/cases", (_req, res) => {
  res.json(store.list());
});

app.get("/api/cases/:id", (req, res) => {
  const c = store.snapshot(req.params.id);
  if (!c) {
    res.status(404).json({ error: "case not found" });
    return;
  }
  res.json(c);
});

app.delete("/api/cases/:id", (req, res) => {
  const ok = store.delete(req.params.id);
  res.status(ok ? 204 : 404).end();
});

// ---- Run a reasoning round ------------------------------------------------

app.post("/api/cases/:id/advance", async (req, res) => {
  const c = store.get(req.params.id);
  if (!c) {
    res.status(404).json({ error: "case not found" });
    return;
  }
  try {
    const result = await runRound(client, team.hypothesisEngine.id, c);
    // Apply the decision's effects.
    if (result.decision.kind === "converged") {
      setWorkingDiagnosis(c, result.decision.hypothesisId, result.decision.confidence, result.message);
    } else if (result.decision.kind === "test") {
      c.awaitingHitl = true;
      c.hitlPrompt = `Order/perform: ${result.decision.test.name} — ${result.decision.test.rationale}`;
      store.update(c.id, () => {});
    } else {
      c.awaitingHitl = false;
      c.hitlPrompt = undefined;
    }
    if (c.status === "intake") c.status = "reasoning";
    store.update(c.id, () => {});
    emit(c.id, { kind: "round", payload: store.snapshot(c.id) });
    res.json(store.snapshot(c.id));
  } catch (e) {
    console.error("[arbor] advance failed:", (e as Error).message);
    res.status(500).json({ error: (e as Error).message });
  }
});

// ---- Clinician enters a finding / test result ----------------------------

app.post("/api/cases/:id/finding", (req, res) => {
  const c = store.get(req.params.id);
  if (!c) {
    res.status(404).json({ error: "case not found" });
    return;
  }
  const body = req.body as {
    summary: string;
    detail?: string;
    direction?: "supports" | "against" | "neutral";
    source?: string;
    hypothesisIds?: string[];
    testId?: string;
  };
  if (!body?.summary) {
    res.status(400).json({ error: "summary is required" });
    return;
  }
  const f = recordFinding(c, {
    summary: body.summary,
    detail: body.detail,
    direction: body.direction,
    source: body.source as never,
    hypothesisIds: body.hypothesisIds,
  });
  if (body.testId) {
    const t = c.tests.find((x) => x.id === body.testId);
    if (t) {
      t.status = "resulted";
      t.resultFindingId = f.id;
    }
  }
  c.awaitingHitl = false;
  c.hitlPrompt = undefined;
  store.update(c.id, () => {});
  emit(c.id, { kind: "finding", payload: f });
  res.json(store.snapshot(c.id));
});

// ---- Force a working diagnosis -------------------------------------------

app.post("/api/cases/:id/diagnose", (req, res) => {
  const c = store.get(req.params.id);
  if (!c) {
    res.status(404).json({ error: "case not found" });
    return;
  }
  const body = req.body as { hypothesisId?: string; confidence?: number; message?: string };
  const topLive = Object.values(c.hypotheses)
    .filter((h) => h.status === "live")
    .sort((a, b) => b.probability - a.probability)[0];
  const hid = body.hypothesisId || topLive?.id;
  if (!hid) {
    res.status(400).json({ error: "no live hypotheses to diagnose" });
    return;
  }
  setWorkingDiagnosis(
    c,
    hid,
    body.confidence ?? topLive?.probability ?? 0.5,
    body.message || "Working diagnosis confirmed by clinician.",
  );
  store.update(c.id, () => {});
  emit(c.id, { kind: "diagnosis", payload: store.snapshot(c.id) });
  res.json(store.snapshot(c.id));
});

// ---- Treatment plan -------------------------------------------------------

app.post("/api/cases/:id/treat", async (req, res) => {
  const c = store.get(req.params.id);
  if (!c) {
    res.status(404).json({ error: "case not found" });
    return;
  }
  if (!c.workingDiagnosis) {
    res.status(400).json({ error: "diagnose the case first" });
    return;
  }
  try {
    const plan = await buildTreatmentPlan(client, team.treatmentPlanner.id, c);
    store.update(c.id, () => {});
    emit(c.id, { kind: "treatment", payload: plan });
    res.json(store.snapshot(c.id));
  } catch (e) {
    console.error("[arbor] treat failed:", (e as Error).message);
    res.status(500).json({ error: (e as Error).message });
  }
});

// ---- Free-text chat with the engine --------------------------------------

app.post("/api/cases/:id/chat", async (req, res) => {
  const c = store.get(req.params.id);
  if (!c) {
    res.status(404).json({ error: "case not found" });
    return;
  }
  const body = req.body as { message: string };
  if (!body?.message) {
    res.status(400).json({ error: "message is required" });
    return;
  }
  try {
    const prompt = `CASE: ${summarize(c)}\n\nCLINICIAN QUESTION: ${body.message}\n\nAnswer concisely as decision support, referencing the current differential where relevant. Do not state diagnoses as certain.`;
    const resp = await withRetry(() =>
      client.sendMessage(team.hypothesisEngine.id, {
        message: { role: "ROLE_USER", parts: [{ kind: "text", text: prompt }] },
      }),
    );
    const text =
      (resp.message?.parts || []).map((p: { text?: string }) => p.text || "").join("\n").trim() ||
      textOf(resp.task?.status?.message);
    store.update(c.id, () => {});
    res.json({ reply: text });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

function summarize(c: Case): string {
  const live = Object.values(c.hypotheses)
    .filter((h) => h.status === "live")
    .sort((a, b) => b.probability - a.probability)
    .map((h) => `${h.name} (${(h.probability * 100).toFixed(0)}%)`)
    .join(", ");
  return `${c.presentation.chiefComplaint}. Live differential: ${live || "(none yet)"}. Findings: ${c.findings.map((f) => f.summary).join("; ") || "(none)"}`;
}

function textOf(msg: unknown): string {
  const m = msg as { status?: { message?: { parts?: { text?: string }[] } } };
  return (m?.status?.message?.parts || []).map((p) => p.text || "").join("").trim();
}

// ---- SSE live stream ------------------------------------------------------

app.get("/api/cases/:id/stream", (req, res) => {
  const c = store.get(req.params.id);
  if (!c) {
    res.status(404).json({ error: "case not found" });
    return;
  }
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  res.write(`event: snapshot\ndata: ${JSON.stringify(store.snapshot(c.id))}\n\n`);

  const sub = (ev: unknown) => {
    res.write(`data: ${JSON.stringify(ev)}\n\n`);
  };
  const set = subscribers.get(c.id) || new Set();
  set.add(sub);
  subscribers.set(c.id, set);

  const keepalive = setInterval(() => res.write(`: keepalive\n\n`), 15_000);
  req.on("close", () => {
    clearInterval(keepalive);
    set.delete(sub);
  });
});

// ---- Boot -----------------------------------------------------------------

async function main() {
  client = CortiClient.fromEnv();
  console.log("[arbor] Corti client ready (dev-weu).");
  team = await provisionTeam(client);
  app.listen(PORT, () => {
    console.log(`[arbor] server listening on http://localhost:${PORT}`);
    console.log(`[arbor] hypothesis engine id: ${team.hypothesisEngine.id}`);
  });

  const shutdown = async (sig: string) => {
    console.log(`\n[arbor] ${sig} received, tearing down…`);
    try {
      await teardownTeam(client, team);
    } catch (e) {
      console.warn("[arbor] teardown error:", (e as Error).message);
    }
    process.exit(0);
  };
  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

main().catch((e) => {
  console.error("[arbor] fatal:", e);
  process.exit(1);
});
