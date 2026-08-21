/**
 * Arbor — differential-diagnosis decision-tree UI.
 *
 * Layout: left = presentation + findings + entry form; center = the live
 * decision tree (the headline); right = chat + verdict + hypothesis detail.
 *
 * A clinician picks a scenario (or writes one), advances rounds, enters test
 * results at HITL gates, and watches the tree branch and converge to a
 * working diagnosis, then a treatment plan.
 */

import { useEffect, useRef, useState } from "react";
import { DecisionTree } from "./DecisionTree.js";
import { EvidencePanel } from "./EvidencePanel.js";
import { ChatPanel } from "./ChatPanel.js";
import { DetailPanel } from "./DetailPanel.js";
import { SCENARIOS, type Scenario } from "./scenarios.js";
import * as api from "./api.js";
import type { Case } from "./types.js";

export function App() {
  const [c, setCase] = useState<Case | null>(null);
  const [busy, setBusy] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showScenarios, setShowScenarios] = useState(true);
  const unsubRef = useRef<(() => void) | null>(null);

  // Subscribe to the live SSE stream for the active case.
  useEffect(() => {
    if (!c) return;
    if (unsubRef.current) unsubRef.current();
    unsubRef.current = api.streamCase(c.id, (ev) => {
      if (ev.kind === "snapshot" && ev.payload) {
        setCase(ev.payload as Case);
      } else if (ev.kind === "round" || ev.kind === "finding" || ev.kind === "diagnosis" || ev.kind === "treatment") {
        // Refetch the canonical snapshot (the SSE payload may be partial).
        api.getCase(c.id).then(setCase).catch(() => {});
      }
    });
    return () => {
      if (unsubRef.current) unsubRef.current();
    };
  }, [c?.id]);

  async function startScenario(s: Scenario) {
    setBusy(true);
    try {
      const created = await api.createCase(s.presentation, s.title);
      setCase(created);
      setSelectedId(null);
      setShowScenarios(false);
    } catch (e) {
      alert(`Failed to start: ${(e as Error).message}\nIs the Arbor server running on :8787 with .env set?`);
    } finally {
      setBusy(false);
    }
  }

  async function startBlank() {
    setBusy(true);
    try {
      const created = await api.createCase(
        {
          chiefComplaint: "New presentation",
          observations: [],
          demographics: {},
        },
        "Untitled case",
      );
      setCase(created);
      setSelectedId(null);
      setShowScenarios(false);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="app">
      <header>
        <div className="brand">
          <span className="logo">🌳</span>
          <div>
            <h1>Arbor</h1>
            <p className="tag">retraceable differential diagnosis</p>
          </div>
        </div>
        <div className="header-actions">
          {c && (
            <>
              <span className="case-title">{c.title}</span>
              <span className="round-chip">round {c.round}</span>
              <button className="ghost" onClick={() => setShowScenarios((v) => !v)}>
                {showScenarios ? "Hide scenarios" : "New case"}
              </button>
            </>
          )}
        </div>
      </header>

      {showScenarios || !c ? (
        <div className="scenarios">
          <h2>Choose an example scenario, or start a blank case</h2>
          <p className="muted">
            Each scenario is a patient who just walked in with preliminary tests done. Run rounds,
            order tests at the HITL gates, and watch the tree narrow to a working diagnosis — then a
            treatment plan with surgical case-finding.
          </p>
          <div className="scenario-grid">
            {SCENARIOS.map((s) => (
              <button key={s.id} className="scenario-card" onClick={() => startScenario(s)}>
                <h3>{s.title}</h3>
                <p className="muted small">{s.blurb}</p>
                <div className="demo small">
                  {[
                    s.presentation.demographics.ageYears != null && `age ${s.presentation.demographics.ageYears}`,
                    s.presentation.demographics.sex,
                    s.presentation.demographics.location,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </div>
              </button>
            ))}
            <button className="scenario-card blank" onClick={startBlank}>
              <h3>+ Blank case</h3>
              <p className="muted small">Write your own presentation.</p>
            </button>
          </div>
          {!c && (
            <p className="hint muted small">
              Backend: <code>npm run dev:server</code> (needs Corti dev-WEU creds in <code>.env</code>).
            </p>
          )}
        </div>
      ) : (
        <div className="workspace">
          <aside className="pane left">
            <EvidencePanel c={c} onUpdated={setCase} busy={busy} setBusy={setBusy} />
          </aside>
          <main className="pane center">
            <div className="center-head">
              <h3>Reasoning tree</h3>
              {c.awaitingHitl && <span className="hitl-chip">awaiting your input</span>}
            </div>
            <DecisionTree c={c} selectedId={selectedId} onSelect={setSelectedId} />
          </main>
          <aside className="pane right">
            <ChatPanel c={c} onUpdated={setCase} busy={busy} setBusy={setBusy} />
            <DetailPanel c={c} selectedId={selectedId} />
          </aside>
        </div>
      )}
    </div>
  );
}
