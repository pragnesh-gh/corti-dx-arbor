/**
 * EvidencePanel (left) — the case record: the presentation summary, the
 * findings so far, and the proposed tests.
 *
 * The "add finding / test result" form lives in NextAction, co-located with
 * the HITL gate that asks for it. The ranked differential is *not* repeated
 * here: the reasoning tree in the centre carries every hypothesis and its
 * probability, and the Tree/List toggle gives the same data as a ranked list.
 */

import type { Case, Finding } from "./types.js";

interface Props {
  c: Case;
}

export function EvidencePanel({ c }: Props) {
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

    </div>
  );
}

function dirIcon(d: Finding["direction"]): string {
  return d === "supports" ? "↑" : d === "against" ? "↓" : "•";
}
