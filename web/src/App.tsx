/**
 * Arbor — differential-diagnosis decision-tree UI.
 *
 * The app shell (Clinical Precision chrome) wraps every view: a top app bar +
 * an optional left side-nav. Inside it, a light hash-router switches between
 * Home, the Workspace (live case console), the Tutorial (canned walk-through),
 * and Docs (in-app recipes). The Workspace is a linear NextAction rail over a
 * data-rich EvidencePanel, a Tree/List canvas toggle, a DetailPanel, and a
 * bottom Timeline.
 *
 * Routing is a small `view` state plus history state so the back button and
 * shareable URLs work — no router dependency.
 */

import { useEffect, useRef, useState } from "react";
import { DecisionTree } from "./DecisionTree.js";
import { EvidencePanel } from "./EvidencePanel.js";
import { ChatPanel } from "./ChatPanel.js";
import { DetailPanel } from "./DetailPanel.js";
import { NextAction } from "./NextAction.js";
import { RankedDifferential } from "./RankedDifferential.js";
import { Home } from "./Home.js";
import { Docs } from "./docs/Docs.js";
import { Tutorial } from "./Tutorial.js";
import { AppShell, type View } from "./AppShell.js";
import { Timeline } from "./Timeline.js";
import { SCENARIOS, type Scenario, findScenario } from "./scenarios.js";
import { TUTORIAL_STEPS } from "./tutorialCase.js";
import * as api from "./api.js";
import type { Case } from "./types.js";

function viewFromHash(): View {
  const h = window.location.hash.replace(/^#\/?/, "");
  if (h.startsWith("docs")) return "docs";
  if (h.startsWith("tutorial")) return "tutorial";
  if (h.startsWith("workspace")) return "workspace";
  return "home";
}

export function App() {
  const [view, setView] = useState<View>(() => viewFromHash());
  const [c, setCase] = useState<Case | null>(null);
  const [busy, setBusy] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [treeVsList, setTreeVsList] = useState<"tree" | "list">("tree");
  const [chatOpen, setChatOpen] = useState(false);
  const [section, setSection] = useState<string>("diagnostics");
  const unsubRef = useRef<(() => void) | null>(null);

  // Keep the view in sync with the hash (back button, shareable URL).
  useEffect(() => {
    const onPop = () => setView(viewFromHash());
    window.addEventListener("popstate", onPop);
    window.addEventListener("hashchange", onPop);
    return () => {
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("hashchange", onPop);
    };
  }, []);

  function go(v: View) {
    setView(v);
    const hash =
      v === "docs"
        ? "#/docs"
        : v === "workspace"
          ? "#/workspace"
          : v === "tutorial"
            ? "#/tutorial"
            : "#/";
    if (window.location.hash !== hash) window.history.pushState(null, "", hash);
  }

  // Subscribe to the live SSE stream for the active case.
  useEffect(() => {
    if (!c) return;
    if (unsubRef.current) unsubRef.current();
    unsubRef.current = api.streamCase(c.id, (ev) => {
      if (ev.kind === "snapshot" && ev.payload) {
        setCase(ev.payload as Case);
      } else if (ev.kind === "round" || ev.kind === "finding" || ev.kind === "diagnosis" || ev.kind === "treatment") {
        api.getCase(c.id).then(setCase).catch(() => {});
      }
    });
    return () => {
      if (unsubRef.current) unsubRef.current();
    };
  }, [c?.id]);

  // A tutorial scenario enters the scripted walk-through (no live API);
  // a normal scenario starts a live case against the API.
  function startScenario(s: Scenario) {
    if (s.tutorial) {
      go("tutorial");
      return;
    }
    startScenarioLive(s);
  }

  async function startScenarioLive(s: Scenario) {
    setBusy(true);
    try {
      const created = await api.createCase(s.presentation, s.title);
      setCase(created);
      setSelectedId(null);
      go("workspace");
    } catch (e) {
      alert(`Failed to start: ${(e as Error).message}\nIs the Arbor server running on :8787 with .env set?`);
    } finally {
      setBusy(false);
    }
  }

  // "Run this case for real" — exit the tutorial into a live run of the
  // underlying scenario the tour was based on.
  function exitTutorialToLive() {
    const tut = SCENARIOS.find((s) => s.tutorial);
    const live = tut?.liveScenarioId ? findScenario(tut.liveScenarioId) : undefined;
    startScenarioLive(live ?? { ...tut!, tutorial: false });
  }

  async function startBlank() {
    setBusy(true);
    try {
      const created = await api.createCase(
        { chiefComplaint: "New presentation", observations: [], demographics: {} },
        "Untitled case",
      );
      setCase(created);
      setSelectedId(null);
      go("workspace");
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function newCase() {
    setCase(null);
    setSelectedId(null);
    go("home");
  }

  const inCase = view === "workspace" || view === "tutorial";
  // For the tutorial, use the first canned snapshot's identity in the side-nav
  // (the name/location don't change across steps; the live `c` is null there).
  const shellCase = view === "tutorial" ? TUTORIAL_STEPS[0]!.case : c;

  return (
    <AppShell view={view} c={inCase ? shellCase : null} onGo={go} onNewCase={newCase} section={section} onSection={setSection}>
      {view === "docs" ? (
        <Docs />
      ) : view === "tutorial" ? (
        <Tutorial
          onExitToLive={exitTutorialToLive}
          onExitToHome={() => go("home")}
        />
      ) : view === "workspace" && c ? (
        <div className="workspace">
          <aside className="pane left">
            <NextAction
              c={c}
              onUpdated={setCase}
              busy={busy}
              setBusy={setBusy}
              onNewCase={newCase}
            />
            <div className="na-divider" />
            <EvidencePanel c={c} />
          </aside>
          <main className="pane center" style={{ display: "flex", flexDirection: "column" }}>
            <div className="center-head">
              <h3>Reasoning tree</h3>
              <div className="view-toggle">
                <button
                  className={treeVsList === "tree" ? "on" : "ghost"}
                  onClick={() => setTreeVsList("tree")}
                >
                  Tree
                </button>
                <button
                  className={treeVsList === "list" ? "on" : "ghost"}
                  onClick={() => setTreeVsList("list")}
                >
                  List
                </button>
              </div>
            </div>
            {treeVsList === "tree" ? (
              <DecisionTree c={c} selectedId={selectedId} onSelect={setSelectedId} />
            ) : (
              <RankedDifferential c={c} selectedId={selectedId} onSelect={setSelectedId} />
            )}
            <Timeline c={c} />
          </main>
          <aside className="pane right">
            <DetailPanel
              c={c}
              selectedId={selectedId}
              onUpdated={setCase}
              busy={busy}
              setBusy={setBusy}
            />
            <button
              className="chat-toggle ghost"
              onClick={() => setChatOpen((v) => !v)}
            >
              {chatOpen ? "Hide Q&A" : "Ask the engine"}
            </button>
            {chatOpen && <ChatPanel c={c} onUpdated={setCase} busy={busy} setBusy={setBusy} />}
          </aside>
        </div>
      ) : (
        <Home
          onStartScenario={startScenario}
          onStartBlank={startBlank}
          busy={busy}
          onOpenDocs={() => go("docs")}
        />
      )}
    </AppShell>
  );
}

// Re-export so Docs can deep-link back into the demo scenarios if needed.
export { SCENARIOS };
