/**
 * DetailPanel (right) — drill into one hypothesis (evidence trail, codes,
 * base-rate, discriminating tests) and show the verdict + treatment plan.
 *
 * Every claim-bearing surface here renders through <Cited>, so the base-rate
 * prior, the illness script, and each step of the reasoning trail carry the
 * markers of the sources behind them. A step with no markers has no grounded
 * source — which is information, not an omission.
 */

import { Cited, SourceChips } from "./Cite.js";
import type { Case, Finding, Hypothesis } from "./types.js";
import * as api from "./api.js";

interface Props {
  c: Case;
  selectedId: string | null;
  onUpdated: (c: Case) => void;
  busy: boolean;
  setBusy: (b: boolean) => void;
}

export function DetailPanel({ c, selectedId, onUpdated, busy, setBusy }: Props) {
  const h: Hypothesis | undefined = selectedId ? c.hypotheses[selectedId] : undefined;
  const findingsById: Record<string, Finding> = {};
  for (const f of c.findings) findingsById[f.id] = f;

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
      {canConverge && (
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
                <li key={i}>
                  <Cited text={t} sources={c.sources} />
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {c.treatmentPlan && (
        <div className="treatment-card">
          <h3>Treatment plan</h3>
          {/* Treatment prose is NOT marker-rewritten (treatment.ts has no
              source pool), so it renders plain: a bracketed number there means
              nothing, and must never resolve to a real paper. */}
          <p>{c.treatmentPlan.summary}</p>
          {c.treatmentPlan.steps.length > 0 && (
            <ol className="steps">
              {c.treatmentPlan.steps.map((s, i) => (
                <li key={i}>
                  <div className="step-title">{s.title}</div>
                  {s.detail && (
                    <div className="muted small">{s.detail}</div>
                  )}
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
            <p>
              <Cited text={h.description} sources={c.sources} />
            </p>
          )}
          <div className="prob-line">
            probability <b>{(h.probability * 100).toFixed(0)}%</b>
            {h.isZebra && <span className="zebra-tag">🦓 zebra</span>}
          </div>
          {h.baseRateNote && (
            <div className="baserate">
              <strong>Base-rate prior</strong>
              <p className="muted small">
                <Cited text={h.baseRateNote} sources={c.sources} />
              </p>
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
                    <Cited
                      text={findingsById[e.findingId]?.summary || e.weight}
                      sources={c.sources}
                    />
                    <SourceChips ids={findingsById[e.findingId]?.sourceIndices} sources={c.sources} />
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
                    <Cited
                      text={findingsById[e.findingId]?.summary || e.weight}
                      sources={c.sources}
                    />
                    <SourceChips ids={findingsById[e.findingId]?.sourceIndices} sources={c.sources} />
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
                    {t.name}{" "}
                    <span className="muted small">
                      — <Cited text={t.rationale} sources={c.sources} />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : (
        !c.workingDiagnosis && (
          <p className="muted small">
            Select a hypothesis node in the tree to inspect its evidence, codes, and base rate.
          </p>
        )
      )}
    </div>
  );
}
