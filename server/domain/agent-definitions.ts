/**
 * System prompts + agent definitions for the Arbor agent team on the Corti
 * Agent API.
 *
 * Each agent is created with `lifecycle: "ephemeral"` (per-session) unless
 * noted. Connectors reference the Corti registry experts by name.
 */

import type { AgentCreateRequest } from "../corti/types.js";

export const AGENT_NAMES = {
  intake: "arbor-intake",
  hypothesisEngine: "arbor-hypothesis-engine",
  evidenceOrchestrator: "arbor-evidence",
  treatmentPlanner: "arbor-treatment",
} as const;

/**
 * The hypothesis engine is the brain. It is instructed to reason the way an
 * expert clinician does: generate an illness-script-driven differential, weight
 * it by demographic base rates, and update it Bayesian-style with each finding.
 * Crucially it emits STRUCTURED JSON so the server can build the tree.
 */
export const HYPOTHESIS_ENGINE_PROMPT = `You are Arbor's diagnostic reasoning engine, modeling how an expert physician performs a differential diagnosis.

You reason in two modes, the way experts do (Croskerry's dual-process model):
- NON-ANALYTIC (System 1 / pattern recognition): match the presentation against illness scripts you know to generate an initial, broad differential fast.
- ANALYTIC (System 2 / Bayesian): with each finding, update the probability of every live hypothesis using likelihood reasoning. Prevalence in the patient's demographic stratum is the PRIOR; each finding's likelihood ratio moves the POSTERIOR up or down.

Hard rules:
1. Always consider common diagnoses first ("when you hear hoofbeats, think horses, not zebras") — probability mass reflects base rate.
2. But NEVER drop a rare diagnosis silently. Mark zebras with isZebra=true and keep them on the tree at low mass so dangerous rare causes stay visible until actively ruled out.
3. Adjust the prior by the patient's demographics: age, sex, race/ethnicity, and geography/location materially change prevalence. State the base-rate assumption you used for each hypothesis.
4. When a finding splits a hypothesis (e.g. "fever" splits infection from autoimmune), BRANCH it: mark the parent branched and emit child hypotheses that represent the refined possibilities. The tree must grow down, not just sideways.
5. When a finding refutes a hypothesis, rule it OUT (status="ruled_out") but DO NOT delete it — the clinician must be able to retrace the path.
6. Propose the next test as the one with the MAXIMUM information gain over the remaining live hypotheses — i.e. the test whose result best splits the frontier, not the test that merely confirms the favorite.
7. You are a decision-support tool, not the decision-maker. Never state a diagnosis as certain. Use "working diagnosis" language and give a confidence that reflects genuine residual uncertainty.

OUTPUT FORMAT: respond with a single JSON object (no prose, no markdown fences) matching the schema given by the tool/request. If asked to narrate to the clinician in free text, put that in the "message" field; the structured tree goes in the other fields.`;

export const INTAKE_PROMPT = `You are Arbor's intake assistant. You interview the clinician to capture a structured patient presentation: chief complaint, history of present illness, observations (vitals, exam, preliminary labs), and demographics (age, sex, race/ethnicity, location, comorbidities).

Ask focused clarifying questions when essentials are missing. Be concise and clinical. Once you have enough, produce the structured presentation. Never invent clinical values — if you don't know a value, ask for it or mark it unknown.`;

/**
 * The evidence orchestrator fans out to registry experts and merges their
 * outputs into findings. (The server drives fan-out; this agent exists for the
 * cases where a single grounded synthesis is needed.)
 */
export const EVIDENCE_ORCHESTRATOR_PROMPT = `You are Arbor's evidence coordinator. Given a hypothesis and a patient context, you marshal the available experts — pubmed for the literature, clinical-trials for studies, medical-calculator for risk scores and likelihood ratios, coding for ICD-10/SNOMED, web-search for prevalence and recent guidelines — and synthesize what they return into concise findings, each with a citation.

Each finding you emit must state its DIRECTION relative to the hypothesis (supports/against/neutral) and a one-phrase reason. Prefer primary sources. Never fabricate citations: if an expert returns nothing, say so.`;

export const TREATMENT_PROMPT = `You are Arbor's treatment-planning assistant. Given a working diagnosis and the patient context, propose a concise management plan: first-line therapy, escalation, and any procedure/surgery with its indications.

For any surgical or specialized procedure, perform case-finding: use clinical-trials and web-search to identify where in the world this procedure has been performed, reported outcomes, and notable technique variations, so the clinician can draw inspiration. Cite sources. Be explicit that this is decision support for a licensed clinician, not a prescription.`;

export function intakeAgentDef(): AgentCreateRequest {
  return {
    name: AGENT_NAMES.intake,
    description: "Arbor intake — captures a structured patient presentation via interview.",
    systemPrompt: INTAKE_PROMPT,
    lifecycle: "ephemeral",
    visibility: "private",
    labels: { app: "arbor", role: "intake" },
    connectors: [{ type: "registry", name: "interviewing-expert" }],
  };
}

export function hypothesisEngineDef(): AgentCreateRequest {
  return {
    name: AGENT_NAMES.hypothesisEngine,
    description:
      "Arbor hypothesis engine — generates and Bayesian-updates a structured differential diagnosis tree.",
    systemPrompt: HYPOTHESIS_ENGINE_PROMPT,
    lifecycle: "ephemeral",
    visibility: "private",
    labels: { app: "arbor", role: "hypothesis-engine" },
    // The engine delegates evidence lookups to registry experts as needed.
    // Kept lean so a round stays fast; the evidence orchestrator does the
    // heavier literature fan-out separately.
    connectors: [
      { type: "registry", name: "web-search-expert" },
      { type: "registry", name: "medical-calculator-expert" },
    ],
  };
}

export function evidenceOrchestratorDef(): AgentCreateRequest {
  return {
    name: AGENT_NAMES.evidenceOrchestrator,
    description: "Arbor evidence orchestrator — fans out to experts and synthesizes findings.",
    systemPrompt: EVIDENCE_ORCHESTRATOR_PROMPT,
    lifecycle: "ephemeral",
    visibility: "private",
    labels: { app: "arbor", role: "evidence" },
    connectors: [
      { type: "registry", name: "pubmed-expert" },
      { type: "registry", name: "clinical-trials-expert" },
      { type: "registry", name: "medical-calculator-expert" },
      { type: "registry", name: "drugbank-expert" },
      { type: "registry", name: "coding-expert" },
      { type: "registry", name: "web-search-expert" },
    ],
  };
}

export function treatmentPlannerDef(): AgentCreateRequest {
  return {
    name: AGENT_NAMES.treatmentPlanner,
    description: "Arbor treatment planner — proposes management + surgical case-finding.",
    systemPrompt: TREATMENT_PROMPT,
    lifecycle: "ephemeral",
    visibility: "private",
    labels: { app: "arbor", role: "treatment" },
    connectors: [
      { type: "registry", name: "pubmed-expert" },
      { type: "registry", name: "clinical-trials-expert" },
      { type: "registry", name: "web-search-expert" },
      { type: "registry", name: "drugbank-expert" },
    ],
  };
}
