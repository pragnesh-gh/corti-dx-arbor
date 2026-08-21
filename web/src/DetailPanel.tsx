/**
 * DetailPanel (right) — drill into one hypothesis (evidence trail, codes,
 * base-rate, discriminating tests) and show the verdict + treatment plan.
 */

import type { Case, Finding, Hypothesis } from "./types.js";

interface Props {
  c: Case;
  selectedId: string | null;
}

export function DetailPanel({ c, selectedId }: Props) {
  const h: Hypothesis | undefined = selectedId ? c.hypotheses[selectedId] : undefined;
  const findingsById: Record<string, Finding> = {};
  for (const f of c.findings) findingsById[f.id] = f;

  return (
    <div className="detail-panel">
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
          {h.description && <p>{h.description}</p>}
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
          <p className="muted small">
            Select a hypothesis node in the tree to inspect its evidence, codes, and base rate.
          </p>
        )
      )}
    </div>
  );
}
