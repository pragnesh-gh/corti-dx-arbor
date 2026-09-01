/**
 * ChatPanel — free-text decision-support Q&A with the engine.
 *
 * The round / diagnose / treat buttons used to live here; they have moved to
 * the NextAction rail, where they sit in the linear path the clinician walks.
 * This panel is now the "ask the engine" channel: "why this hypothesis?",
 * "what test splits the top 2?", "show me the zebra". The engine's per-round
 * narration (engine_message / diagnosis / treatment events) is shown here too.
 *
 * Q&A is rendered as a clear question/answer thread: each user question is
 * echoed as a "you" bubble and the engine's reply follows directly beneath it
 * as an "engine" bubble, so it's always obvious which question an answer
 * responds to.
 */

import { useEffect, useRef, useState } from "react";
import type { Case, CaseEvent } from "./types.js";
import * as api from "./api.js";

interface Props {
  c: Case;
  onUpdated: (c: Case) => void;
  busy: boolean;
  setBusy: (b: boolean) => void;
}

interface QA { q: string; a: string }

export function ChatPanel({ c, onUpdated: _onUpdated, busy, setBusy }: Props) {
  const [msg, setMsg] = useState("");
  const [qa, setQa] = useState<QA[]>([]);
  const streamRef = useRef<HTMLDivElement | null>(null);

  const events = c.events.filter(
    (e) => e.kind === "engine_message" || e.kind === "diagnosis" || e.kind === "treatment",
  );

  // keep the latest Q&A visible by scrolling the stream to the bottom whenever
  // a new answer arrives.
  useEffect(() => {
    const el = streamRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [qa, events.length]);

  async function send() {
    const q = msg.trim();
    if (!q || busy) return;
    setMsg("");
    setBusy(true);
    try {
      const r = await api.chat(c.id, q);
      setQa((prev) => [...prev, { q, a: r.reply }]);
    } catch (e) {
      setQa((prev) => [...prev, { q, a: `⚠️ ${(e as Error).message}` }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="chat-panel">
      <div className="panel-head">
        <h3>Engine Q&amp;A</h3>
      </div>

      <div className="chat-stream" ref={streamRef}>
        {events.length === 0 && qa.length === 0 && (
          <p className="muted small">Ask the engine a question — its answer appears here as a thread.</p>
        )}
        {events.length > 0 && (
          <div className="chat-section-label label-caps">Round narration</div>
        )}
        {events.map((e: CaseEvent) => (
          <div key={e.id} className={`msg ${e.kind} narration`}>
            <div className="msg-role">{labelFor(e.kind)}</div>
            <div className="msg-body">{e.summary}</div>
          </div>
        ))}
        {qa.length > 0 && <div className="chat-section-label label-caps">Your questions</div>}
        {qa.map((pair, i) => (
          <div key={i} className="qa-pair">
            <div className="msg you">
              <div className="msg-role">you</div>
              <div className="msg-body">{pair.q}</div>
            </div>
            <div className="msg engine_message answer">
              <div className="msg-role">engine</div>
              <div className="msg-body">{pair.a}</div>
            </div>
          </div>
        ))}
        {busy && (
          <div className="msg engine_message answer pending">
            <div className="msg-role">engine</div>
            <div className="msg-body"><span className="spinner" /> thinking…</div>
          </div>
        )}
      </div>

      <div className="chat-input">
        <textarea
          placeholder="Ask: “why this hypothesis?”, “what test splits the top 2?”, “show me the zebra”…"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          rows={2}
          onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); send(); } }}
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

