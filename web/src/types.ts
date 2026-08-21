/**
 * Shared client-side types — mirror server/domain/types.ts (kept in sync by
 * convention). The server is the source of truth.
 */

export type Sex = "male" | "female" | "intersex" | "unknown";

export interface Demographics {
  ageYears?: number;
  sex?: Sex;
  raceEthnicity?: string;
  location?: string;
  comorbidities?: string[];
}

export interface Presentation {
  chiefComplaint: string;
  history?: string;
  observations?: string[];
  demographics: Demographics;
}

export type HypothesisStatus = "live" | "branched" | "confirmed" | "ruled_out";

export interface Hypothesis {
  id: string;
  name: string;
  description?: string;
  codes?: { system: string; code: string; display?: string }[];
  probability: number;
  status: HypothesisStatus;
  parentId: string | null;
  childIds: string[];
  evidenceFor: { findingId: string; weight: string }[];
  evidenceAgainst: { findingId: string; weight: string }[];
  branchedBecause?: string;
  discriminatingTests?: TestProposal[];
  isZebra?: boolean;
  baseRateNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Finding {
  id: string;
  summary: string;
  detail?: string;
  source: string;
  direction: "supports" | "against" | "neutral";
  hypothesisIds: string[];
  citation?: { label: string; url?: string };
  createdAt: string;
}

export interface TestProposal {
  id: string;
  name: string;
  rationale: string;
  discriminatesBetween: string[];
  status: "proposed" | "ordered" | "resulted";
  resultFindingId?: string;
}

export type CaseStatus =
  | "intake"
  | "reasoning"
  | "converged"
  | "treatment"
  | "closed";

export interface WorkingDiagnosis {
  hypothesisId: string;
  name: string;
  confidence: number;
  reasoningTrail: string[];
  concludedAt: string;
}

export interface TreatmentPlan {
  summary: string;
  steps: { title: string; detail?: string; citation?: { label: string; url?: string } }[];
  caseFinding?: {
    summary: string;
    sites: { label: string; url?: string; note?: string }[];
  };
  createdAt: string;
}

export interface CaseEvent {
  id: string;
  round: number;
  kind: string;
  summary: string;
  payload?: unknown;
  createdAt: string;
}

export interface Case {
  id: string;
  title: string;
  status: CaseStatus;
  presentation: Presentation;
  hypotheses: Record<string, Hypothesis>;
  rootHypothesisIds: string[];
  findings: Finding[];
  tests: TestProposal[];
  events: CaseEvent[];
  workingDiagnosis?: WorkingDiagnosis;
  treatmentPlan?: TreatmentPlan;
  round: number;
  awaitingHitl: boolean;
  hitlPrompt?: string;
  createdAt: string;
  updatedAt: string;
}
