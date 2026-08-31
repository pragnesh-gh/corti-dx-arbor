/**
 * DecisionTree — the headline visualization: a retraceable tree of hypotheses.
 *
 * - Nodes are hypotheses, positioned left-to-right by depth (presentation →
 *   top differential → branches).
 * - Node size scales with probability; color encodes status (live = blue,
 *   branched = violet, confirmed = green, ruled_out = dimmed grey, struck
 *   through).
 * - Edges are labelled with the finding that caused the branch.
 * - Ruled-out branches stay visible but dimmed — that's the "retrace your
 *   steps" property.
 */

import { useMemo } from "react";
import type { Case, Finding, Hypothesis } from "./types.js";

interface LayoutNode {
  h: Hypothesis;
  x: number;
  y: number;
  depth: number;
  radius: number;
  parent?: LayoutNode;
  edgeLabel?: string;
}

const NODE_W = 220;
const NODE_H = 64;
const GAP_X = 150;
const GAP_Y = 18;

/** Tidy tree layout: assign x by depth, y by in-order leaf position. */
function layout(c: Case): { nodes: LayoutNode[]; width: number; height: number } {
  const nodes: LayoutNode[] = [];
  // Build a virtual root for the presentation.
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
    radius: 0,
  };

  let maxDepth = 0;
  let leafIdx = 0;

  const assign = (ln: LayoutNode, depth: number) => {
    ln.depth = depth;
    maxDepth = Math.max(maxDepth, depth);
    const childIds = ln.h.childIds;
    if (!childIds.length) {
      // leaf
      ln.y = leafIdx * (NODE_H + GAP_Y);
      leafIdx += 1;
      nodes.push(ln);
      return;
    }
    const children = childIds
      .map((id) => c.hypotheses[id])
      .filter((x): x is Hypothesis => !!x)
      .sort((a, b) => b.probability - a.probability)
      .map((h) => ({ h, x: 0, y: 0, depth: depth + 1, radius: 0, parent: ln }) as LayoutNode);
    for (const ch of children) {
      ch.edgeLabel = ch.h.branchedBecause || undefined;
      assign(ch, depth + 1);
    }
    // center the parent over its children
    const first = children[0];
    const last = children[children.length - 1];
    if (first && last) ln.y = (first.y + last.y) / 2;
    nodes.push(ln);
  };
  assign(presentationNode, 0);

  // x by depth
  for (const n of nodes) n.x = n.depth * (NODE_W + GAP_X);

  const width = maxDepth * (NODE_W + GAP_X) + NODE_W;
  const height = Math.max(leafIdx * (NODE_H + GAP_Y), 400);
  return { nodes, width, height };
}

function statusColor(h: Hypothesis): { fill: string; stroke: string; text: string; dim: boolean } {
  // White-theme palette: soft tinted fills with dark text, so nodes read on a
  // white canvas while still encoding status by hue. Strong stroke carries the
  // color identity; the fill is a light tint of the same hue.
  if (h.id === "__root__") return { fill: "#1f7a8c", stroke: "#155968", text: "#ffffff", dim: false };
  switch (h.status) {
    case "confirmed":
      return { fill: "#e0f4ea", stroke: "#1f9d6b", text: "#14693f", dim: false };
    case "live":
      return { fill: "#e3f0f2", stroke: "#1f7a8c", text: "#155968", dim: false };
    case "branched":
      return { fill: "#efeaf8", stroke: "#7a5bd9", text: "#4a2da0", dim: false };
    case "ruled_out":
      return { fill: "#f4f6f8", stroke: "#c2c8d0", text: "#9aa1ad", dim: true };
    default:
      return { fill: "#f4f6f8", stroke: "#d3d7de", text: "#5a6270", dim: false };
  }
}

interface Props {
  c: Case;
  selectedId?: string | null;
  onSelect: (id: string) => void;
}

export function DecisionTree({ c, selectedId, onSelect }: Props) {
  const { nodes, width, height } = useMemo(() => layout(c), [c]);
  const findingsById = useMemo(() => {
    const m: Record<string, Finding> = {};
    for (const f of c.findings) m[f.id] = f;
    return m;
  }, [c.findings]);

  const zebra = (h: Hypothesis) => h.isZebra;
  const topLive = Object.values(c.hypotheses)
    .filter((h) => h.status === "live")
    .sort((a, b) => b.probability - a.probability)[0];
  const topLiveId = topLive?.id;

  return (
    <div className="tree-scroll">
      <svg width={Math.max(width, 600)} height={height} style={{ minWidth: "100%" }}>
        {nodes.map((n) => {
          if (!n.parent) return null;
          const p = n.parent;
          const mx = (p.x + NODE_W + n.x) / 2;
          const path = `M ${p.x + NODE_W} ${p.y + NODE_H / 2} C ${mx} ${p.y + NODE_H / 2}, ${mx} ${n.y + NODE_H / 2}, ${n.x} ${n.y + NODE_H / 2}`;
          const dim = n.h.status === "ruled_out";
          return (
            <g key={`edge-${n.h.id}`}>
              <path
                d={path}
                fill="none"
                stroke={dim ? "#c2c8d0" : "#8a93a0"}
                strokeWidth={dim ? 1.5 : 2}
                strokeDasharray={dim ? "4 4" : undefined}
                opacity={dim ? 0.7 : 0.95}
              />
              {n.edgeLabel && (
                <text
                  x={mx}
                  y={(p.y + n.y) / 2 + NODE_H / 2}
                  textAnchor="middle"
                  className="edge-label"
                  opacity={dim ? 0.5 : 0.9}
                >
                  {truncate(n.edgeLabel, 34)}
                </text>
              )}
            </g>
          );
        })}

        {nodes.map((n) => {
          const col = statusColor(n.h);
          const dim = col.dim;
          const isRoot = n.h.id === "__root__";
          const selected = n.h.id === selectedId;
          const isTop = n.h.id === topLiveId;
          const pct = isRoot ? "" : `${(n.h.probability * 100).toFixed(0)}%`;
          return (
            <g
              key={n.h.id}
              transform={`translate(${n.x}, ${n.y})`}
              className="tree-node"
              onClick={() => !isRoot && onSelect(n.h.id)}
              style={{ cursor: isRoot ? "default" : "pointer" }}
              opacity={dim ? 0.62 : 1}
            >
              <rect
                width={NODE_W}
                height={NODE_H}
                rx={10}
                fill={col.fill}
                stroke={selected ? "#14181f" : isTop ? "#1f7a8c" : col.stroke}
                strokeWidth={selected ? 2.5 : isTop ? 2 : 1.25}
              />
              <text x={14} y={24} fill={col.text} className="node-title">
                {truncate(n.h.name, 26)}
              </text>
              {!isRoot && (
                <text x={14} y={45} fill={col.text} className="node-sub" opacity={0.85}>
                  {pct}
                  {zebra(n.h) ? "  · zebra" : ""}
                  {n.h.status === "ruled_out" ? "  · ruled out" : ""}
                  {n.h.status === "confirmed" ? "  · working dx" : ""}
                </text>
              )}
              {isRoot && (
                <text x={14} y={44} fill={col.text} className="node-sub" opacity={0.8}>
                  Presentation
                </text>
              )}
              {/* zebra marker */}
              {zebra(n.h) && n.h.status === "live" && (
                <text x={NODE_W - 16} y={24} fill="#fde68a" className="zebra-mark" textAnchor="end">
                  🦓
                </text>
              )}
              {n.h.status === "ruled_out" && (
                <line x1={12} y1={NODE_H / 2} x2={NODE_W - 12} y2={NODE_H / 2} stroke="#9ca3af" strokeWidth={2} />
              )}
            </g>
          );
        })}
      </svg>
      {/* Legend */}
      <div className="legend">
        <span><i style={{ background: "#e3f0f2", border: "1.5px solid #1f7a8c" }} /> live</span>
        <span><i style={{ background: "#efeaf8", border: "1.5px solid #7a5bd9" }} /> branched</span>
        <span><i style={{ background: "#e0f4ea", border: "1.5px solid #1f9d6b" }} /> working dx</span>
        <span><i style={{ background: "#f4f6f8", border: "1.5px solid #c2c8d0" }} /> ruled out (kept for trail)</span>
        <span>🦓 zebra</span>
      </div>
    </div>
  );
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}
