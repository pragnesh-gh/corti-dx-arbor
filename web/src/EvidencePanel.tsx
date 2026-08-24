/**
 * EvidencePanel (left) — the case timeline: the presentation summary, the
 * findings so far, the proposed tests, and the live differential bars.
 *
 * The "add finding / test result" form used to live here; it has moved to
 * NextAction, co-located with the HITL gate that asks for it. This panel now
 * shows the accumulated evidence so the clinician can read the case at a
 * glance — the content the user liked, kept.
 */

import type { Case, Finding, Hypothesis } from "./types.js";

interface Props {
  c: Case;
}

export function EvidencePanel({ c }: Props) {
  const liveHyps = Object.values(c.hypotheses)
    .filter((h) => h.status === "live" || h.status === "branched")
    .sort((a, b) => b.probability - a.probability);

  const supports = c.findings.filter((f) => f.direction === "supports").length;
  const against = c.findings.filter((f) => f.direction === "against").length;

  return (
    <div className="evidence-panel">
      <div className="panel-head">
        <h3>Presentation</h3>
      </div>
      <div className="presentation-card">
        <div className="cc">{c.presentation.chiefComplaint}</div>
        {c.presentation.history && <p className="muted small">{c.presentation.history}</p>}
        <div className="demo">
          {[
            c.presentation.demographics.ageYears != null && `age ${c.presentation.demographics.ageYears}`,
            c.presentation.demographics.sex,
            c.presentation.demographics.raceEthnicity,
            c.presentation.demographics.location,
          ]
            .filter(Boolean)
            .join(" · ")}
        </div>
        {c.presentation.observations?.length ? (
          <ul className="obs">
            {c.presentation.observations.map((o, i) => (
              <li key={i}>{o}</li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="panel-head">
        <h3>Findings</h3>
        <span className="count">{c.findings.length}</span>
      </div>
      <div className="findings-summary muted small">
        {c.findings.length === 0
          ? "No findings yet."
          : `${c.findings.length} finding${c.findings.length === 1 ? "" : "s"} · ${supports} support · ${against} against`}
      </div>
      <div className="findings-list">
        {c.findings.length === 0 && <p className="muted small">Findings appear as the round runs and as you enter results.</p>}
        {c.findings
          .slice()
          .reverse()
          .map((f: Finding) => (
            <div key={f.id} className={`finding ${f.direction}`}>
              <div className="finding-dir">{dirIcon(f.direction)}</div>
              <div>
                <div className="finding-summary">{f.summary}</div>
                {f.detail && <div className="muted small">{f.detail}</div>}
                {f.citation && (
                  <a className="cite" href={f.citation.url} target="_blank" rel="noreferrer">
                    {f.citation.label}
                  </a>
                )}
                <div className="finding-meta">{f.source}</div>
              </div>
            </div>
          ))}
      </div>

      {c.tests.length > 0 && (
        <>
          <div className="panel-head">
            <h3>Proposed tests</h3>
          </div>
          <div className="tests-list">
            {c.tests.map((t) => (
              <div key={t.id} className={`test ${t.status}`}>
                <div className="test-name">{t.name}</div>
                <div className="muted small">{t.rationale}</div>
                <span className={`test-status ${t.status}`}>{t.status}</span>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="panel-head">
        <h3>Live differential</h3>
      </div>
      <div className="diff-list">
        {liveHyps.length === 0 && <p className="muted small">Advance a round to generate hypotheses.</p>}
        {liveHyps.map((h: Hypothesis) => (
          <div key={h.id} className="diff-row">
            <div className="diff-bar" style={{ width: `${Math.max(h.probability * 100, 4)}%` }} />
            <span className="diff-name">{h.name}</span>
            <span className="diff-pct">{(h.probability * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function dirIcon(d: Finding["direction"]): string {
  return d === "supports" ? "↑" : d === "against" ? "↓" : "•";
}
