/**
 * EvidencePanel (left) — the case timeline of findings + a form to enter a
 * finding or test result, plus the presentation summary.
 */

import { useState } from "react";
import type { Case, Finding, Hypothesis } from "./types.js";
import * as api from "./api.js";

interface Props {
  c: Case;
  onUpdated: (c: Case) => void;
  busy: boolean;
  setBusy: (b: boolean) => void;
}

export function EvidencePanel({ c, onUpdated, busy, setBusy }: Props) {
  const [summary, setSummary] = useState("");
  const [detail, setDetail] = useState("");
  const [direction, setDirection] = useState<"supports" | "against" | "neutral">("neutral");
  const [testId, setTestId] = useState<string>("");

  const liveHyps = Object.values(c.hypotheses)
    .filter((h) => h.status === "live" || h.status === "branched")
    .sort((a, b) => b.probability - a.probability);

  async function submit() {
    if (!summary.trim() || busy) return;
    setBusy(true);
    try {
      const next = await api.addFinding(c.id, {
        summary,
        detail: detail || undefined,
        direction,
        source: "clinician",
        testId: testId || undefined,
      });
      onUpdated(next);
      setSummary("");
      setDetail("");
      setTestId("");
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

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
      <div className="findings-list">
        {c.findings.length === 0 && <p className="muted small">No findings yet.</p>}
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

      <div className="panel-head">
        <h3>Add finding / test result</h3>
      </div>
      <div className="finding-form">
        <select value={testId} onChange={(e) => setTestId(e.target.value)}>
          <option value="">(no specific test)</option>
          {c.tests
            .filter((t) => t.status === "proposed")
            .map((t) => (
              <option key={t.id} value={t.id}>
                result for: {t.name}
              </option>
            ))}
        </select>
        <input
          placeholder="Finding summary, e.g. “ASO titer 800 IU/mL”"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />
        <input
          placeholder="Detail (optional), e.g. “reference <200”"
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
        />
        <div className="dir-row">
          <label className={direction === "supports" ? "on" : ""}>
            <input type="radio" name="dir" checked={direction === "supports"} onChange={() => setDirection("supports")} /> supports
          </label>
          <label className={direction === "against" ? "on" : ""}>
            <input type="radio" name="dir" checked={direction === "against"} onChange={() => setDirection("against")} /> against
          </label>
          <label className={direction === "neutral" ? "on" : ""}>
            <input type="radio" name="dir" checked={direction === "neutral"} onChange={() => setDirection("neutral")} /> neutral
          </label>
        </div>
        <button onClick={submit} disabled={busy || !summary.trim()}>
          {busy ? "…" : "Add finding"}
        </button>
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
