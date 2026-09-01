/**
 * AppShell — the Clinical Precision chrome: a top app bar (brand, nav tabs,
 * search, icon buttons, optional patient header) and an optional left side-nav
 * (patient identity, "New case", section anchors). The shell wraps every view;
 * the side-nav only shows in workspace/tutorial where a case is active.
 *
 * Mirrors ~/Downloads/stitch_clinical_diagnostic_graph/code.html (TopAppBar +
 * SideNavBar), adapted to Arbor's views. No behavior change — purely chrome.
 */

import type { ReactNode } from "react";
import type { Case } from "./types.js";

export type View = "home" | "workspace" | "docs" | "tutorial";

interface Props {
  view: View;
  c: Case | null;
  onGo: (v: View) => void;
  onNewCase: () => void;
  children: ReactNode;
  /** Section anchor in the workspace to jump the side-nav to (optional). */
  section?: string;
  onSection?: (s: string) => void;
}

function initials(c: Case | null): string {
  if (!c) return "🌳";
  // Use the case title's first letters, or a tree if blank.
  const t = c.title.trim();
  if (!t) return "🌳";
  return t.slice(0, 2).toUpperCase();
}

export function AppShell({ view, c, onGo, onNewCase, children, section, onSection }: Props) {
  const showSideNav = (view === "workspace" || view === "tutorial") && !!c;
  return (
    <div className="app">
      <header className="appbar">
        <div className="appbar-brand">
          <span className="logo">🌳</span>
          <div>
            <h1>Arbor</h1>
            <p className="appbar-tag">retraceable differential diagnosis</p>
          </div>
          <nav className="appbar-nav">
            <a className={view === "home" ? "active" : ""} onClick={() => onGo("home")}>
              Home
            </a>
            <a className={view === "docs" ? "active" : ""} onClick={() => onGo("docs")}>
              Recipes
            </a>
          </nav>
        </div>
        <div className="appbar-actions">
          {c && (view === "workspace" || view === "tutorial") ? (
            <div className="patient-header">
              <span className="ph-name">{c.title}</span>
              <span className="ph-meta data-mono">
                {c.presentation.demographics.ageYears != null && `age ${c.presentation.demographics.ageYears}`}
                {c.presentation.demographics.sex && ` · ${c.presentation.demographics.sex}`}
              </span>
            </div>
          ) : (
            <div className="appbar-search">
              <span className="msym">search</span>
              <input placeholder="Search…" type="text" />
            </div>
          )}
          <button className="icon-btn" title="Notifications">
            <span className="msym">notifications</span>
          </button>
          <button className="icon-btn" title="Settings">
            <span className="msym">settings</span>
          </button>
          <button className="icon-btn" title="Account">
            <span className="msym">account_circle</span>
          </button>
        </div>
      </header>

      <div className="shell-body">
        {showSideNav && (
          <aside className="sidenav">
            <div className="sidenav-identity">
              <div className="sidenav-avatar">{initials(c)}</div>
              <div className="sidenav-name">{c!.title.replace(/^Tutorial — /, "").slice(0, 24) || "Case"}</div>
              <div className="sidenav-id data-mono">
                {c!.presentation.demographics.location || "—"}
              </div>
              <button onClick={onNewCase} style={{ marginTop: 16, width: "100%" }}>
                + New case
              </button>
            </div>
            <nav>
              <a
                className={`sidenav-item ${!section || section === "diagnostics" ? "active" : ""}`}
                onClick={() => onSection?.("diagnostics")}
              >
                <span className="msym">account_tree</span> Diagnostics
              </a>
              <a
                className={`sidenav-item ${section === "evidence" ? "active" : ""}`}
                onClick={() => onSection?.("evidence")}
              >
                <span className="msym">science</span> Evidence
              </a>
              <a
                className={`sidenav-item ${section === "treatment" ? "active" : ""}`}
                onClick={() => onSection?.("treatment")}
              >
                <span className="msym">medication</span> Treatment
              </a>
              <a
                className={`sidenav-item ${section === "help" ? "active" : ""}`}
                onClick={() => onGo("docs")}
              >
                <span className="msym">help</span> Recipes
              </a>
            </nav>
          </aside>
        )}
        {children}
      </div>
    </div>
  );
}
