/**
 * DocsLayout — the docs shell: a numbered sidebar (recipe nav) + a scrollable
 * main content area + a "← Back to demo" link. Mirrors the inspiration demo's
 * `docs/layout.tsx`.
 */

import type { ReactNode } from "react";
import { RECIPES } from "./recipes.js";

interface Props {
  activeSlug?: string;
  children: ReactNode;
}

export function DocsLayout({ activeSlug, children }: Props) {
  return (
    <div className="docs-layout">
      <aside className="docs-sidebar">
        <a href="#/docs" className="docs-sidebar-title">
          Recipes
        </a>
        <nav className="docs-nav">
          {RECIPES.map((r) => (
            <a
              key={r.slug}
              href={`#/docs/${r.slug}`}
              className={`docs-nav-item ${activeSlug === r.slug ? "active" : ""}`}
            >
              <span className="docs-nav-num">{r.number}</span>
              <span className="docs-nav-label">{r.navLabel}</span>
            </a>
          ))}
        </nav>
        <a href="#/" className="docs-back-link">
          ← Back to demo
        </a>
      </aside>
      <main className="docs-main">{children}</main>
    </div>
  );
}
