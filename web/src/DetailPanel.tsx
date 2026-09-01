/**
 * DetailPanel (right) — drill into one hypothesis (evidence trail, codes,
 * base-rate, discriminating tests) and show the verdict + treatment plan.
 */

import { useState } from "react";
import type { Case, Finding, Hypothesis } from "./types.js";
import * as api from "./api.js";

/** Long descriptions are clamped to a few lines with a "show more" toggle so
 *  the panel stays scannable; the full text is one click away. */
const DESC_CLAMP_LINES = 3;

interface Props {
  c: Case;
  selectedId: string | null;
  onUpdated: (c: Case) => void;
  busy: boolean;
  setBusy: (b: boolean) => void;
  /**
   * Whether to show the live API actions (the "Set working dx" convergence
   * button). Defaults true for the live workspace; the Tutorial passes false
   * because the canned case has no backing API call — that button would error.
   * Read-only detail (the bulk of the panel) is always shown.
   */
  interactive?: boolean;
}

export function DetailPanel({ c, selectedId, onUpdated, busy, setBusy, interactive = true }: Props) {
  const h: Hypothesis | undefined = selectedId ? c.hypotheses[selectedId] : undefined;
  const findingsById: Record<string, Finding> = {};
  for (const f of c.findings) findingsById[f.id] = f;
  const [descOpen, setDescOpen] = useState(false);

  // Discoverability for "Set working dx": when reasoning and there is a leading
  // live hypothesis, surface the action where the user is looking at it. This
  // was a buried ghost button in the chat actions; now it explains *when*.
  const topLive = Object.values(c.hypotheses)
    .filter((x) => x.status === "live")
    .sort((a, b) => b.probability - a.probability)[0];
  const canConverge = c.status === "reasoning" && !!topLive && !c.workingDiagnosis;

  async function setWorkingDx() {
    if (busy || !topLive) return;
    setBusy(true);
    try {
      const next = await api.diagnose(c.id, { hypothesisId: topLive.id });
      onUpdated(next);
    } catch {
      /* surfaced by NextAction in practice */
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="detail-panel">
      {interactive && canConverge && (
        <div className="converge-hint">
          <div className="converge-hint-text">
            <strong>Converged enough?</strong>
            <p className="muted small">
              The leading hypothesis is <em>{topLive!.name}</em> at {Math.round(topLive!.probability * 100)}%. If the differential is stable, set the working diagnosis.
            </p>
          </div>
          <button onClick={setWorkingDx} disabled={busy}>
            Set working dx
          </button>
        </div>
      )}
      {c.workingDiagnosis && (
        <div className="verdict-card">
          <h3>Working diagnosis</h3>
          <div className="dx-name">{c.workingDiagnosis.name}</div>
          <div className="dx-conf">confidence {(c.workingDiagnosis.confidence * 100).toFixed(0)}%</div>
          <div className="trail">
            <strong>Reasoning trail</strong>
            <ol>
              {c.workingDiagnosis.reasoningTrail.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {c.treatmentPlan && (
        <div className="treatment-card">
          <h3>Treatment plan</h3>
          <p>{c.treatmentPlan.summary}</p>
          {c.treatmentPlan.steps.length > 0 && (
            <ol className="steps">
              {c.treatmentPlan.steps.map((s, i) => (
                <li key={i}>
                  <div className="step-title">{s.title}</div>
                  {s.detail && <div className="muted small">{s.detail}</div>}
                  {s.citation && (
                    <a className="cite" href={s.citation.url} target="_blank" rel="noreferrer">
                      {s.citation.label}
                    </a>
                  )}
                </li>
              ))}
            </ol>
          )}
          {c.treatmentPlan.caseFinding && (
            <div className="case-finding">
              <strong>Surgical case-finding</strong>
              <p className="muted small">{c.treatmentPlan.caseFinding.summary}</p>
              <ul>
                {c.treatmentPlan.caseFinding.sites.map((s, i) => (
                  <li key={i}>
                    {s.url ? (
                      <a className="cite" href={s.url} target="_blank" rel="noreferrer">
                        {s.label}
                      </a>
                    ) : (
                      s.label
                    )}
                    {s.note && <span className="muted small"> — {s.note}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {h ? (
        <div className="hypo-detail">
          <div className="panel-head">
            <h3>{h.name}</h3>
            <span className={`status-chip ${h.status}`}>{h.status}</span>
          </div>
          {h.description && (
            <>
              {/* The toggle sits outside the clamped paragraph — inside it, the
                  line-clamp hid the very control needed to un-clamp. */}
              <p className={`hypo-desc ${descOpen ? "open" : "clamp"}`}>{h.description}</p>
              <button className="desc-toggle" onClick={() => setDescOpen((v) => !v)}>
                {descOpen ? "show less" : "show more"}
              </button>
            </>
          )}
          <div className="prob-line">
            probability <b>{(h.probability * 100).toFixed(0)}%</b>
            {h.isZebra && <span className="zebra-tag">🦓 zebra</span>}
          </div>
          {h.baseRateNote && (
            <div className="baserate">
              <strong>Base-rate prior</strong>
              <p className="muted small">{h.baseRateNote}</p>
            </div>
          )}
          {h.codes?.length ? (
            <div className="codes">
              <strong>Codes</strong>
              <ul>
                {h.codes.map((c2, i) => (
                  <li key={i}>
                    {c2.system}: <code>{c2.code}</code> {c2.display}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {h.evidenceFor.length > 0 && (
            <div className="ev-block">
              <strong>Supporting evidence</strong>
              <ul>
                {h.evidenceFor.map((e, i) => (
                  <li key={i} className="supports">
                    {findingsById[e.findingId]?.summary || e.weight}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {h.evidenceAgainst.length > 0 && (
            <div className="ev-block">
              <strong>Contradicting evidence</strong>
              <ul>
                {h.evidenceAgainst.map((e, i) => (
                  <li key={i} className="against">
                    {findingsById[e.findingId]?.summary || e.weight}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {h.discriminatingTests?.length ? (
            <div className="ev-block">
              <strong>Discriminating tests</strong>
              <ul>
                {h.discriminatingTests.map((t, i) => (
                  <li key={i}>
                    {t.name} <span className="muted small">— {t.rationale}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : (
        !c.workingDiagnosis && (
          <p className="muted small detail-empty">
            Select a hypothesis node in the tree to inspect its evidence, codes, and base rate.
          </p>
        )
      )}
    </div>
  );
}
