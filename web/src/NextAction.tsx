/**
 * NextAction — the spine of the workspace. It always shows, in one place,
 * where the case is and what to do next, so the round cycle is a single linear
 * path instead of left/right ping-pong.
 *
 * Modeled on the inspiration demo's GuidedFlow step panel + "next form"
 * suggestion banner: a stage line, a completed-steps trail, and a prominent
 * "next action" card whose content depends on the case state. When the engine
 * is awaiting a test result (the HITL gate), the finding-entry form renders
 * inline right here — co-located with the gate that asked for it.
 */

import { useEffect, useState } from "react";
import type { Case } from "./types.js";
import * as api from "./api.js";

interface Props {
  c: Case;
  onUpdated: (c: Case) => void;
  busy: boolean;
  setBusy: (b: boolean) => void;
  onNewCase: () => void;
}

/** A human label for the current stage of the case. */
function stageLabel(c: Case): string {
  if (c.awaitingHitl) return "awaiting your test result";
  if (c.status === "converged") return "working diagnosis set";
  if (c.status === "treatment" || c.status === "closed") return "treatment plan";
  if (c.round === 0) return "intake";
  return "reasoning";
}

/** Completed steps trail: ✓ Intake · ✓ Round 1 · ✓ Round 2 … */
function completedSteps(c: Case): { label: string; done: boolean }[] {
  const steps: { label: string; done: boolean }[] = [{ label: "Intake", done: true }];
  for (let r = 1; r <= c.round; r++) steps.push({ label: `Round ${r}`, done: true });
  // The current frontier step is "in progress", not done.
  if (steps.length > 0) steps[steps.length - 1]!.done = false;
  return steps;
}

export function NextAction({ c, onUpdated, busy, setBusy, onNewCase }: Props) {
  // ---- inline finding form (the HITL gate) ----
  const [summary, setSummary] = useState("");
  const [detail, setDetail] = useState("");
  const [direction, setDirection] = useState<"supports" | "against" | "neutral">("supports");
  const [testId, setTestId] = useState<string>("");
  const [slow, setSlow] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Reset the inline form when the gate we're answering changes.
  const proposedTests = c.tests.filter((t) => t.status === "proposed");
  useEffect(() => {
    setSummary("");
    setDetail("");
    setTestId(proposedTests[0]?.id ?? "");
    setDirection("supports");
  }, [c.awaitingHitl, c.round, proposedTests.length]);

  // "Still thinking" hint after a few seconds (reused from ChatPanel).
  useEffect(() => {
    if (!busy) { setSlow(false); return; }
    const t = setTimeout(() => setSlow(true), 6000);
    return () => clearTimeout(t);
  }, [busy, c.round]);

  const steps = completedSteps(c);
  const stage = stageLabel(c);

  async function advance() {
    if (busy) return;
    setBusy(true);
    setErr(null);
    try {
      const next = await api.advance(c.id);
      onUpdated(next);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function diagnose() {
    if (busy) return;
    setBusy(true);
    setErr(null);
    try {
      const next = await api.diagnose(c.id, {});
      onUpdated(next);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function treat() {
    if (busy) return;
    setBusy(true);
    setErr(null);
    try {
      const next = await api.treat(c.id);
      onUpdated(next);
    } finally {
      setBusy(false);
    }
  }

  /** Enter the test result the gate asked for, then advance a round. */
  async function addResultAndAdvance() {
    if (busy || !summary.trim()) return;
    setBusy(true);
    setErr(null);
    try {
      const afterFinding = await api.addFinding(c.id, {
        summary,
        detail: detail || undefined,
        direction,
        source: "clinician",
        testId: testId || undefined,
      });
      const afterAdvance = await api.advance(c.id);
      onUpdated(afterAdvance);
      void afterFinding; // the advance snapshot is canonical
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  /** Add a free observation/result without advancing (e.g. a side finding). */
  async function addFindingOnly() {
    if (busy || !summary.trim()) return;
    setBusy(true);
    setErr(null);
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
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="next-action">
      {/* completed-steps trail */}
      <div className="na-trail">
        {steps.map((s, i) => (
          <span key={i} className={`na-step ${s.done ? "done" : "now"}`}>
            {s.done && <span className="na-check">✓</span>}
            {s.label}
          </span>
        ))}
      </div>

      {/* stage line */}
      <div className="na-stage">
        Round {c.round || 0} · <span className="na-stage-label">{stage}</span>
      </div>

      {/* the prominent next-action card */}
      <div className="na-card">
        {c.awaitingHitl ? (
          <>
            <div className="na-card-icon">→</div>
            <div className="na-card-text">
              <div className="na-card-label">The engine proposes a test</div>
              <div className="na-card-reason">{c.hitlPrompt}</div>
            </div>
          </>
        ) : c.round === 0 ? (
          <>
            <div className="na-card-icon">→</div>
            <div className="na-card-text">
              <div className="na-card-label">Start the reasoning</div>
              <div className="na-card-reason">
                Advance a round to generate the first differential from the presentation.
              </div>
            </div>
          </>
        ) : c.status === "converged" ? (
          <>
            <div className="na-card-icon">→</div>
            <div className="na-card-text">
              <div className="na-card-label">Working diagnosis set</div>
              <div className="na-card-reason">
                {c.workingDiagnosis
                  ? `${c.workingDiagnosis.name} (confidence ${Math.round(c.workingDiagnosis.confidence * 100)}%). Build the treatment plan next.`
                  : "Build the treatment plan next."}
              </div>
            </div>
          </>
        ) : c.status === "treatment" || c.status === "closed" ? (
          <>
            <div className="na-card-icon">✓</div>
            <div className="na-card-text">
              <div className="na-card-label">Treatment plan ready</div>
              <div className="na-card-reason">
                The case is complete. Start a new case to run another differential.
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="na-card-icon">→</div>
            <div className="na-card-text">
              <div className="na-card-label">Advance another round</div>
              <div className="na-card-reason">
                Re-rank the differential with the findings so far. Or, if the
                differential is stable, set the working diagnosis.
              </div>
            </div>
          </>
        )}
      </div>

      {/* the action(s) for this state */}
      <div className="na-actions">
        {c.awaitingHitl ? null : c.status === "converged" ? (
          <button onClick={treat} disabled={busy}>
            {busy ? <span className="spinner" /> : null} Build treatment plan
          </button>
        ) : c.status === "treatment" || c.status === "closed" ? (
          <button className="ghost" onClick={onNewCase} disabled={busy}>
            + New case
          </button>
        ) : (
          <>
            <button onClick={advance} disabled={busy}>
              {busy ? <span className="spinner" /> : null}{" "}
              {busy ? "Thinking…" : "Advance a round"}
            </button>
            {c.status === "reasoning" && (
              <button className="ghost" onClick={diagnose} disabled={busy}>
                Set working dx
              </button>
            )}
          </>
        )}
        {busy && slow && (
          <span className="muted small slow-hint">
            still working — the engine fans out to expert agents, and the
            dev-weu platform can retry through 404 windows. This can take a
            minute or two.
          </span>
        )}
        {err && <div className="na-err">⚠️ {err}</div>}
      </div>

      {/* inline HITL finding form, co-located with the gate */}
      {c.awaitingHitl && (
        <div className="na-finding">
          <div className="na-finding-head">Enter the test result</div>
          {proposedTests.length > 0 && (
            <select value={testId} onChange={(e) => setTestId(e.target.value)}>
              {proposedTests.map((t) => (
                <option key={t.id} value={t.id}>
                  result for: {t.name}
                </option>
              ))}
            </select>
          )}
          <input
            placeholder="Finding summary, e.g. “chest X-ray: right lower lobe consolidation”"
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
              <input type="radio" name="nad" checked={direction === "supports"} onChange={() => setDirection("supports")} /> supports
            </label>
            <label className={direction === "against" ? "on" : ""}>
              <input type="radio" name="nad" checked={direction === "against"} onChange={() => setDirection("against")} /> against
            </label>
            <label className={direction === "neutral" ? "on" : ""}>
              <input type="radio" name="nad" checked={direction === "neutral"} onChange={() => setDirection("neutral")} /> neutral
            </label>
          </div>
          <div className="na-finding-actions">
            <button onClick={addResultAndAdvance} disabled={busy || !summary.trim()}>
              {busy ? <span className="spinner" /> : null} Add result &amp; advance
            </button>
            <button className="ghost" onClick={addFindingOnly} disabled={busy || !summary.trim()}>
              Add finding only
            </button>
          </div>
          {err && <div className="na-err">⚠️ {err}</div>}
        </div>
      )}
    </div>
  );
}
