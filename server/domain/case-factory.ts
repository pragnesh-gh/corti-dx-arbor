/**
 * Case factory — create a new diagnostic Case from a presentation.
 */

import { appendEvent, newId, store } from "./case-store.js";
import type { Case, Presentation } from "./types.js";

export function createCase(presentation: Presentation, title?: string): Case {
  const now = new Date().toISOString();
  const id = newId("case");
  const c: Case = {
    id,
    title:
      title ||
      `${presentation.chiefComplaint.slice(0, 48)}${presentation.chiefComplaint.length > 48 ? "…" : ""}`,
    status: "intake",
    presentation,
    hypotheses: {},
    rootHypothesisIds: [],
    findings: [],
    sources: [],
    tests: [],
    events: [],
    round: 0,
    awaitingHitl: false,
    createdAt: now,
    updatedAt: now,
  };
  appendEvent(c, {
    round: 0,
    kind: "presentation",
    summary: `Intake: ${presentation.chiefComplaint}`,
    payload: presentation,
  });
  store.create(c);
  return c;
}
