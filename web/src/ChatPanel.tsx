/**
 * ChatPanel — free-text decision-support Q&A with the engine.
 *
 * The round / diagnose / treat buttons used to live here; they have moved to
 * the NextAction rail, where they sit in the linear path the clinician walks.
 * This panel is now the "ask the engine" channel: "why this hypothesis?",
 * "what test splits the top 2?", "show me the zebra". The engine's per-round
 * narration (engine_message / diagnosis / treatment events) is shown here too.
 */

import { useState } from "react";
import type { Case, CaseEvent } from "./types.js";
import * as api from "./api.js";

interface Props {
  c: Case;
  onUpdated: (c: Case) => void;
  busy: boolean;
  setBusy: (b: boolean) => void;
}

export function ChatPanel({ c, onUpdated: _onUpdated, busy, setBusy }: Props) {
  const [msg, setMsg] = useState("");
  const [reply, setReply] = useState<string | null>(null);

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

  return (
    <div className="chat-panel">
      <div className="panel-head">
        <h3>Engine Q&amp;A</h3>
      </div>

      <div className="chat-stream">
        {events.length === 0 && <p className="muted small">The engine's per-round narration appears here.</p>}
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

      <div className="chat-input">
        <textarea
          placeholder="Ask: “why this hypothesis?”, “what test splits the top 2?”, “show me the zebra”…"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          rows={2}
        />
        <button onClick={send} disabled={busy || !msg.trim()}>
          {busy ? <span className="spinner" /> : null} Send
        </button>
      </div>
    </div>
  );
}

function labelFor(kind: string): string {
  switch (kind) {
    case "engine_message":
      return "engine";
    case "diagnosis":
      return "diagnosis";
    case "treatment":
      return "treatment plan";
    default:
      return kind;
  }
}
