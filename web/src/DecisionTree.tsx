/**
 * DecisionTree — the headline visualization: a retraceable tree of hypotheses
 * on a Clinical Precision diagnostic canvas.
 *
 * The canvas is a real, draggable surface (per user feedback):
 *   - Drag any node to reposition it. Positions are kept in a per-case store, so
 *     when you advance a round the engine preserves every existing node where
 *     you left it and only computes initial positions for *new* children,
 *     animating them in from their parent.
 *   - A "Reset layout" button re-tidies the whole tree if it gets messy.
 *   - Edge labels (the finding that caused a branch) render as small chips on
 *     the edge midpoint, so they never overlap the connector line.
 *
 * Nodes are HTML cards (foreignObject) so the hypothesis name wraps fully and
 * the card grows to fit the text — no more "Lyme disease with musculo…"
 * truncation. Color encodes status (live = blue, branched = slate, confirmed =
 * green, ruled_out = dimmed + struck through); the leading live hypothesis gets
 * the primary "focus" fill. Ruled-out branches stay on the canvas (retraceable).
 */

import { useEffect, useMemo, useRef, useState } from "react";
import type { Case, Hypothesis } from "./types.js";

interface LayoutNode {
  h: Hypothesis;
  x: number;
  y: number;
  depth: number;
  parent?: LayoutNode;
  edgeLabel?: string;
  isNew?: boolean;
}

/** Min node size; cards grow wider/taller to fit their text (foreignObject). */
const NODE_W = 240;
const NODE_H = 72;
const GAP_X = 160;
const GAP_Y = 28;

/* ------------------------------------------------------------------ *
 * Per-case position store.
 *
 * Positions are keyed by hypothesis id, nested under the case id, so dragging
 * in one case doesn't bleed into another and a brand-new case starts clean.
 * On a round advance the case object changes but the ids of surviving nodes
 * stay stable, so the engine's layout merges preserved positions for existing
 * nodes with computed positions for new ones.
 * ------------------------------------------------------------------ */
const positionsByCase: Record<string, Record<string, { x: number; y: number }>> = {};

function getPositions(caseId: string): Record<string, { x: number; y: number }> {
  if (!positionsByCase[caseId]) positionsByCase[caseId] = {};
  return positionsByCase[caseId];
}

/** Tidy tree layout: assign x by depth, y by in-order leaf position. Only used
 *  for the initial layout and the "Reset" action. */
function tidyLayout(c: Case): { nodes: LayoutNode[]; width: number; height: number } {
  const nodes: LayoutNode[] = [];
  const presentationNode: LayoutNode = {
    h: {
      id: "__root__",
      name: c.presentation.chiefComplaint,
      probability: 1,
      status: "branched",
      parentId: null,
      childIds: c.rootHypothesisIds,
      evidenceFor: [],
      evidenceAgainst: [],
      createdAt: "",
      updatedAt: "",
      description: "Presentation",
    },
    x: 0,
    y: 0,
    depth: 0,
  };

  let maxDepth = 0;
  let leafIdx = 0;

  const assign = (ln: LayoutNode, depth: number) => {
    ln.depth = depth;
    maxDepth = Math.max(maxDepth, depth);
    const childIds = ln.h.childIds;
    if (!childIds.length) {
      ln.y = leafIdx * (NODE_H + GAP_Y);
      leafIdx += 1;
      nodes.push(ln);
      return;
    }
    const children = childIds
      .map((id) => c.hypotheses[id])
      .filter((x): x is Hypothesis => !!x)
      .sort((a, b) => b.probability - a.probability)
      .map((h) => ({ h, x: 0, y: 0, depth: depth + 1, parent: ln }) as LayoutNode);
    for (const ch of children) {
      ch.edgeLabel = ch.h.branchedBecause || undefined;
      assign(ch, depth + 1);
    }
    const first = children[0];
    const last = children[children.length - 1];
    if (first && last) ln.y = (first.y + last.y) / 2;
    nodes.push(ln);
  };
  assign(presentationNode, 0);

  for (const n of nodes) n.x = n.depth * (NODE_W + GAP_X);
  const width = maxDepth * (NODE_W + GAP_X) + NODE_W;
  const height = Math.max(leafIdx * (NODE_H + GAP_Y), 400);
  return { nodes, width, height };
}

/** Build the render layout, merging preserved drag positions (for existing
 *  nodes) with tidy positions (for new nodes). Marks new nodes so they can
 *  animate in. */
function buildLayout(c: Case): { nodes: LayoutNode[]; width: number; height: number } {
  const tidy = tidyLayout(c);
  const stored = getPositions(c.id);
  const seen = new Set<string>();
  const nodes = tidy.nodes.map((n) => {
    const id = n.h.id;
    seen.add(id);
    const prev = stored[id];
    if (prev) {
      // preserved position — keep where the user left it
      return { ...n, x: prev.x, y: prev.y, isNew: false };
    }
    // new node (not in the store) — use tidy position, mark for animation
    stored[id] = { x: n.x, y: n.y };
    return { ...n, isNew: true };
  });
  // prune stored positions for nodes that no longer exist
  for (const id of Object.keys(stored)) if (!seen.has(id)) delete stored[id];

  // bounds from actual (possibly dragged) positions
  let maxX = 0, maxY = 0;
  for (const n of nodes) { maxX = Math.max(maxX, n.x + NODE_W); maxY = Math.max(maxY, n.y + NODE_H); }
  return { nodes, width: Math.max(maxX + 80, 600), height: Math.max(maxY + 80, 400) };
}

function statusColor(h: Hypothesis): { fill: string; stroke: string; text: string; dim: boolean } {
  if (h.id === "__root__") return { fill: "#00478d", stroke: "#00478d", text: "#ffffff", dim: false };
  switch (h.status) {
    case "confirmed":
      return { fill: "#d1fae5", stroke: "#047857", text: "#065f46", dim: false };
    case "live":
      return { fill: "#d6e3ff", stroke: "#00478d", text: "#001b3d", dim: false };
    case "branched":
      return { fill: "#d0e1fb", stroke: "#505f76", text: "#38485d", dim: false };
    case "ruled_out":
      return { fill: "#f2f3ff", stroke: "#c2c6d4", text: "#727783", dim: true };
    default:
      return { fill: "#f2f3ff", stroke: "#c2c6d4", text: "#424752", dim: false };
  }
}

interface Props {
  c: Case;
  selectedId?: string | null;
  onSelect: (id: string) => void;
}

export function DecisionTree({ c, selectedId, onSelect }: Props) {
  // recompute layout when the case identity or its node set changes
  const layoutKey = c.id + ":" + Object.keys(c.hypotheses).join(",") + ":" + c.round;
  const { nodes, width, height } = useMemo(() => buildLayout(c), [layoutKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const zebra = (h: Hypothesis) => h.isZebra;
  const topLive = Object.values(c.hypotheses)
    .filter((h) => h.status === "live")
    .sort((a, b) => b.probability - a.probability)[0];
  const topLiveId = topLive?.id;

  // ---- drag state ----
  const [dragId, setDragId] = useState<string | null>(null);
  const dragOffset = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });
  const svgRef = useRef<SVGSVGElement | null>(null);

  function onPointerDown(e: React.PointerEvent, n: LayoutNode) {
    if (n.h.id === "__root__") return;
    e.stopPropagation();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    const svg = svgRef.current;
    if (svg) {
      const pt = svg.createSVGPoint();
      pt.x = e.clientX; pt.y = e.clientY;
      const ctm = svg.getScreenCTM();
      const loc = ctm ? pt.matrixTransform(ctm.inverse()) : { x: e.clientX, y: e.clientY };
      dragOffset.current = { dx: loc.x - n.x, dy: loc.y - n.y };
    }
    dragMoved = false; // reset per press; a real move sets it true
    setDragId(n.h.id);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragId) return;
    const svg = svgRef.current;
    if (!svg) return;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const ctm = svg.getScreenCTM();
    const loc = ctm ? pt.matrixTransform(ctm.inverse()) : { x: e.clientX, y: e.clientY };
    dragMoved = true; // this press included movement → suppress the click-select
    const stored = getPositions(c.id);
    stored[dragId] = { x: loc.x - dragOffset.current.dx, y: loc.y - dragOffset.current.dy };
    // force a re-render by bumping a counter via state
    setTick((t) => t + 1);
  }
  function onPointerUp() {
    setDragId(null);
  }
  const [, setTick] = useState(0);

  function resetLayout() {
    delete positionsByCase[c.id];
    setTick((t) => t + 1);
  }

  // clear stale positions when switching to a different case entirely
  useEffect(() => {
    // ensure the store exists; no-op if already present
    getPositions(c.id);
  }, [c.id]);

  return (
    <div className="tree-scroll canvas-bg">
      <div className="canvas-toolbar">
        <span className="label-caps">Drag nodes to arrange · positions are kept when you advance a round</span>
        <button className="ghost" onClick={resetLayout}>Reset layout</button>
      </div>
      <svg
        ref={svgRef}
        width={Math.max(width, 600)}
        height={height}
        style={{ minWidth: "100%" }}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {/* organic connectors (behind nodes) */}
        {nodes.map((n) => {
          if (!n.parent) return null;
          const p = n.parent;
          const mx = (p.x + NODE_W + n.x) / 2;
          const path = `M ${p.x + NODE_W} ${p.y + NODE_H / 2} C ${mx} ${p.y + NODE_H / 2}, ${mx} ${n.y + NODE_H / 2}, ${n.x} ${n.y + NODE_H / 2}`;
          const dim = n.h.status === "ruled_out";
          const labelX = (p.x + NODE_W + n.x) / 2;
          const labelY = (p.y + n.y) / 2 + NODE_H / 2;
          return (
            <g key={`edge-${n.h.id}`}>
              <path
                d={path}
                className="organics"
                strokeWidth={dim ? 1.5 : 2}
                strokeDasharray={dim ? "4 4" : undefined}
                opacity={dim ? 0.45 : 0.7}
              />
              {n.edgeLabel && (
                <foreignObject x={labelX - 70} y={labelY - 12} width={140} height={24} style={{ overflow: "visible" }}>
                  <div className="edge-chip" title={n.edgeLabel}>{truncate(n.edgeLabel, 28)}</div>
                </foreignObject>
              )}
            </g>
          );
        })}

        {/* nodes — HTML cards via foreignObject so text wraps + card grows */}
        {nodes.map((n) => {
          const col = statusColor(n.h);
          const dim = col.dim;
          const isRoot = n.h.id === "__root__";
          const selected = n.h.id === selectedId;
          const isTop = n.h.id === topLiveId;
          const pct = isRoot ? "" : `${(n.h.probability * 100).toFixed(0)}%`;
          const focus = isTop && n.h.status === "live";
          const dragging = dragId === n.h.id;
          return (
            <g
              key={n.h.id}
              transform={`translate(${n.x}, ${n.y})`}
              className={`tree-node ${n.isNew ? "node-enter" : ""} ${dragging ? "node-dragging" : ""}`}
              onPointerDown={(e) => onPointerDown(e, n)}
              onClick={(e) => { if (!isRoot && !dragMoved) { e.stopPropagation(); onSelect(n.h.id); } }}
              style={{ cursor: isRoot ? "default" : "grab" }}
              opacity={dim ? 0.62 : 1}
            >
              <foreignObject width={NODE_W} height={NODE_H} style={{ overflow: "visible" }}>
                <div
                  className={`node-card ${focus ? "focus" : ""} ${selected ? "sel" : ""} ${isRoot ? "root" : ""} ${dim ? "dim" : ""}`}
                  style={{ borderColor: selected ? "#131b2e" : isTop ? "#00478d" : col.stroke, background: focus ? "#00478d" : col.fill, color: focus ? "#fff" : col.text }}
                >
                  <div className="node-card-head">
                    <span className="node-card-name">{n.h.name}</span>
                    {zebra(n.h) && n.h.status === "live" && <span className="zebra-mark">🦓</span>}
                  </div>
                  {!isRoot && (
                    <div className="node-card-sub">
                      <span className="data-mono">{pct}</span>
                      {zebra(n.h) ? " · zebra" : ""}
                      {n.h.status === "ruled_out" ? " · ruled out" : ""}
                      {n.h.status === "confirmed" ? " · working dx" : ""}
                    </div>
                  )}
                  {isRoot && <div className="node-card-sub">Presentation</div>}
                  {n.h.status === "ruled_out" && <div className="node-strike" />}
                </div>
              </foreignObject>
            </g>
          );
        })}
      </svg>
      {/* Legend */}
      <div className="legend">
        <span><i style={{ background: "#d6e3ff", border: "1.5px solid #00478d" }} /> live</span>
        <span><i style={{ background: "#d0e1fb", border: "1.5px solid #505f76" }} /> branched</span>
        <span><i style={{ background: "#d1fae5", border: "1.5px solid #047857" }} /> working dx</span>
        <span><i style={{ background: "#f2f3ff", border: "1.5px solid #c2c6d4" }} /> ruled out (kept for trail)</span>
        <span>🦓 zebra</span>
      </div>
    </div>
  );
}

// track whether a pointer move happened during the drag, so a click at the end
// of a drag doesn't also select the node. Reset to false in onPointerDown; set
// true in onPointerMove; read in the node's onClick guard.
let dragMoved = false;

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}
