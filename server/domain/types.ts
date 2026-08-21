/**
 * Arbor domain model — the reasoning tree and everything that lives on it.
 *
 * This is the wire shape between the server engine and the web UI, and the
 * persisted shape of a Case. It is deliberately self-describing so the UI can
 * render the tree and the reasoning trail with no extra metadata calls.
 */

// ---- Demographics & presentation ----------------------------------------

export type Sex = "male" | "female" | "intersex" | "unknown";

export interface Demographics {
  ageYears?: number;
  sex?: Sex;
  /** Free-text self-identified race/ethnicity, e.g. "Ashkenazi Jewish". */
  raceEthnicity?: string;
  /** Free-text geography/location, e.g. "rural East Africa" or "Stockholm, SE". */
  location?: string;
  /** Known comorbidities / relevant history, free text. */
  comorbidities?: string[];
}

export interface Presentation {
  /** Chief complaint in the clinician's / patient's words. */
  chiefComplaint: string;
  /** Narrative of the presenting story (HPI). */
  history?: string;
  /** Already-collected observations: vitals, exam, prelim labs. */
  observations?: string[];
  demographics: Demographics;
}

// ---- The tree ------------------------------------------------------------

export type HypothesisStatus =
  | "live" // actively in the running
  | "branched" // refined into children; node itself is no longer terminal
  | "confirmed" // the working diagnosis
  | "ruled_out"; // pruned — kept on the tree for the trail

/**
 * One candidate explanation of the presentation. A node in the reasoning tree.
 *
 * Probability is a *mass* (0–1) over the current live siblings; the engine
 * normalizes across the frontier each round. Showing it explicitly is the
 * Bayesian-update, not-a-black-box property.
 */
export interface Hypothesis {
  id: string;
  name: string;
  /** Short plain-language description / illness script. */
  description?: string;
  /** ICD-10 / SNOMED codes from the coding expert, if any. */
  codes?: { system: string; code: string; display?: string }[];
  /** Current probability mass within its sibling frontier. */
  probability: number;
  status: HypothesisStatus;
  /** Parent hypothesis id; null for top-level hypotheses. */
  parentId: string | null;
  /** Child hypothesis ids (when this one branched). */
  childIds: string[];
  /** Findings supporting this hypothesis. */
  evidenceFor: EvidenceRef[];
  /** Findings arguing against it. */
  evidenceAgainst: EvidenceRef[];
  /** The finding/observation that caused this node to be branched or pruned. */
  branchedBecause?: string;
  /** The test(s) that would best confirm/refute this, from the engine. */
  discriminatingTests?: TestProposal[];
  /** Is this a rare ("zebra") diagnosis? Surfaced so it isn't dropped early. */
  isZebra?: boolean;
  /** Base-rate prior used by the engine (prevalence in this demographic). */
  baseRateNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EvidenceRef {
  findingId: string;
  /** Why this finding bears on the hypothesis, in a phrase. */
  weight: string;
}

// ---- Findings & tests -----------------------------------------------------

export type FindingSource =
  | "clinician" // entered by the human
  | "lab" // a test result
  | "exam" // physical exam
  | "literature" // pubmed / trials
  | "calculator" // medical-calculator
  | "web"; // web-search

export type FindingDirection = "supports" | "against" | "neutral";

export interface Finding {
  id: string;
  /** What was found, in a sentence. */
  summary: string;
  /** Structured detail (e.g. a lab value with units). */
  detail?: string;
  source: FindingSource;
  direction: FindingDirection;
  /** Which hypothesis ids this finding bears on. */
  hypothesisIds: string[];
  /** Citation link if literature/web. */
  citation?: { label: string; url?: string };
  createdAt: string;
}

export interface TestProposal {
  id: string;
  name: string;
  /** Why this test — which hypotheses it splits. */
  rationale: string;
  /** Which hypothesis ids it discriminates between. */
  discriminatesBetween: string[];
  status: "proposed" | "ordered" | "resulted";
  resultFindingId?: string;
}

// ---- The verdict ---------------------------------------------------------

export type CaseStatus =
  | "intake" // capturing presentation
  | "reasoning" // cycling the differential
  | "converged" // working diagnosis reached
  | "treatment" // building the plan
  | "closed"; // done

export interface WorkingDiagnosis {
  hypothesisId: string;
  name: string;
  confidence: number; // 0–1
  /** The narrative path from presentation to this conclusion. */
  reasoningTrail: string[];
  concludedAt: string;
}

export interface TreatmentPlan {
  summary: string;
  /** Proposed next actions / management steps. */
  steps: { title: string; detail?: string; citation?: { label: string; url?: string } }[];
  /** Surgical case-finding: where this has been done, outcomes, techniques. */
  caseFinding?: {
    summary: string;
    sites: { label: string; url?: string; note?: string }[];
  };
  createdAt: string;
}

// ---- The Case (session) --------------------------------------------------

export interface CaseEvent {
  id: string;
  /** Sequential round index this event belongs to. */
  round: number;
  /** What happened. */
  kind:
    | "presentation" // intake recorded
    | "hypotheses" // differential updated
    | "finding" // a finding landed
    | "test_proposed" // engine suggests a test
    | "test_ordered" // clinician ordered / result entered
    | "engine_message" // free-text from the engine
    | "hitl" // a human-in-the-loop gate
    | "diagnosis" // working diagnosis reached
    | "treatment"; // plan produced
  /** Human-readable summary. */
  summary: string;
  payload?: unknown;
  createdAt: string;
}

export interface Case {
  id: string;
  title: string;
  status: CaseStatus;
  presentation: Presentation;
  /** The full hypothesis tree, keyed by id. */
  hypotheses: Record<string, Hypothesis>;
  /** Root-level hypothesis ids (the top differential). */
  rootHypothesisIds: string[];
  findings: Finding[];
  tests: TestProposal[];
  events: CaseEvent[];
  workingDiagnosis?: WorkingDiagnosis;
  treatmentPlan?: TreatmentPlan;
  /** Current reasoning round (0 = pre-cycle). */
  round: number;
  /** True when paused for a clinician HITL action. */
  awaitingHitl: boolean;
  /** What the HITL gate is asking for, when awaiting. */
  hitlPrompt?: string;
  createdAt: string;
  updatedAt: string;
}

/** Public snapshot of a Case for the API/UI (everything; secrets never here). */
export type CaseSnapshot = Case;

// ---- Engine state machine decisions --------------------------------------

export type EngineDecision =
  | { kind: "converged"; hypothesisId: string; confidence: number }
  | { kind: "test"; test: TestProposal }
  | { kind: "gather"; reason: string };

export interface EngineRoundResult {
  /** New/updated hypotheses merged into the tree this round. */
  hypotheses: Hypothesis[];
  /** Findings produced this round (from experts / clinician). */
  findings: Finding[];
  /** The engine's free-text narration for the chat. */
  message: string;
  /** What the engine wants to do next. */
  decision: EngineDecision;
  /** Hypothesis ids that were ruled out / branched this round (for the trail). */
  pruned: string[];
}
