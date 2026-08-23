/**
 * ChatPanel — free-text conversation with the engine + the HITL gate.
 *
 * Shows the engine's narration per round, lets the clinician ask questions,
 * order a test result, and answer the HITL prompt.
 */

import { useState, useEffect } from "react";
import type { Case, CaseEvent } from "./types.js";
import * as api from "./api.js";

interface Props {
  c: Case;
  onUpdated: (c: Case) => void;
  busy: boolean;
  setBusy: (b: boolean) => void;
}

export function ChatPanel({ c, onUpdated, busy, setBusy }: Props) {
  const [msg, setMsg] = useState("");
  const [reply, setReply] = useState<string | null>(null);
  const [slow, setSlow] = useState(false);

  // While a round is in flight, show a "still thinking" hint after a few
  // seconds so the clinician isn't left guessing whether it's hung. Rounds
  // legitimately take 30–90s (the engine fans out to expert agents); the
  // dev-weu platform can also retry through 404 windows, adding more time.
  useEffect(() => {
    if (!busy) { setSlow(false); return; }
    const t = setTimeout(() => setSlow(true), 6000);
    return () => clearTimeout(t);
  }, [busy, c.round]);

  const events = c.events.filter(
    (e) => e.kind === "engine_message" || e.kind === "diagnosis" || e.kind === "treatment",
  );

  async function send() {
    if (!msg.trim() || busy) return;
    setBusy(true);
    try {
      const r = await api.chat(c.id, msg);
      setReply(r.reply);
    } catch (e) {
      setReply(`⚠️ ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  async function runRound() {
    if (busy) return;
    setBusy(true);
    try {
      const next = await api.advance(c.id);
      onUpdated(next);
    } catch (e) {
      setReply(`⚠️ ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  async function diagnose() {
    if (busy) return;
    setBusy(true);
    try {
      const next = await api.diagnose(c.id, {});
      onUpdated(next);
    } catch (e) {
      setReply(`⚠️ ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  async function treat() {
    if (busy) return;
    setBusy(true);
    try {
      const next = await api.treat(c.id);
      onUpdated(next);
    } catch (e) {
      setReply(`⚠️ ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="chat-panel">
      <div className="panel-head">
        <h3>Conversation</h3>
        <span className={`status-chip ${c.status}`}>{c.status}</span>
      </div>

      <div className="chat-stream">
        {events.length === 0 && <p className="muted">Start a round to see the engine's reasoning.</p>}
        {events.map((e: CaseEvent) => (
          <div key={e.id} className={`msg ${e.kind}`}>
            <div className="msg-role">{labelFor(e.kind)}</div>
            <div className="msg-body">{e.summary}</div>
          </div>
        ))}
        {reply && (
          <div className="msg engine_message">
            <div className="msg-role">engine</div>
            <div className="msg-body">{reply}</div>
          </div>
        )}
      </div>

      {c.awaitingHitl && c.hitlPrompt && (
        <div className="hitl-banner">
          <strong>Awaiting clinician input</strong>
          <p>{c.hitlPrompt}</p>
          <p className="muted small">Enter the result under “Findings / test result” on the left, then advance a round.</p>
        </div>
      )}

      <div className="chat-actions">
        <button onClick={runRound} disabled={busy || c.status === "closed"}>
          {busy ? "Thinking…" : "Advance a round"}
        </button>
        {busy && slow && (
          <span className="muted small slow-hint">
            still working — the engine fans out to expert agents, and the dev-weu
            platform can retry through 404 windows. This can take a minute or two.
          </span>
        )}
        {c.status === "reasoning" && (
          <button onClick={diagnose} disabled={busy} className="ghost">
            Set working dx
          </button>
        )}
        {(c.status === "converged" || c.status === "treatment") && !c.treatmentPlan && (
          <button onClick={treat} disabled={busy} className="ghost">
            Build treatment plan
          </button>
        )}
      </div>

      <div className="chat-input">
        <textarea
          placeholder="Ask the engine: “why this hypothesis?”, “what test splits the top 2?”, “show me the zebra”…"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          rows={2}
        />
        <button onClick={send} disabled={busy || !msg.trim()}>
          Send
        </button>
      </div>
    </div>
  );
}

function labelFor(kind: string): string {
  switch (kind) {
    case "engine_message": return "engine";
    case "diagnosis": return "diagnosis";
    case "treatment": return "treatment plan";
    default: return kind;
  }
}
