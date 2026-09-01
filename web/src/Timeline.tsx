/**
 * Timeline — the bottom strip (Clinical Precision "Bottom Timeline"): one dot
 * per round plus intake, the current round highlighted with a primary ring, and
 * critical events (a HITL gate / finding entry) in error red. Driven by the
 * case's round counter + event log. Purely a reading aid — it does not mutate
 * state.
 *
 * In the tutorial (canned snapshots) the round numbers come from the scripted
 * case, so the timeline advances as the user steps.
 */

import type { Case } from "./types.js";

interface Props {
  c: Case;
}

export function Timeline({ c }: Props) {
  const rounds = c.round;
  // Critical events: HITL gates and findings (the moments the clinician acted).
  const criticalRounds = new Set<number>();
  for (const e of c.events) {
    if (e.kind === "finding" || e.kind === "round") criticalRounds.add(e.round);
  }
  // Build nodes: intake (round 0) + one per round up to the current.
  const nodes: { round: number; label: string; current: boolean; critical: boolean }[] = [];
  nodes.push({ round: 0, label: "Intake", current: rounds === 0, critical: false });
  for (let r = 1; r <= rounds; r++) {
    nodes.push({
      round: r,
      label: `Round ${r}`,
      current: r === rounds,
      critical: criticalRounds.has(r),
    });
  }
  // Position evenly across the track; intake at ~10%, current near the right.
  const n = nodes.length;
  return (
    <div className="timeline">
      <span className="timeline-label">Timeline</span>
      <div className="timeline-track">
        <div className="timeline-line" />
        {nodes.map((nd, i) => {
          const left = n <= 1 ? 50 : 10 + (i / (n - 1)) * 80;
          return (
            <div
              key={nd.round}
              className={`timeline-node ${nd.current ? "current" : ""} ${nd.critical ? "critical" : ""}`}
              style={{ left: `${left}%` }}
              title={nd.label}
            >
              <div className="timeline-dot" />
              <span className="timeline-caption">{nd.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
