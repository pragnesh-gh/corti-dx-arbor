/**
 * Thin API client for the Arbor server. All endpoints return the Case snapshot
 * unless noted.
 */

import type { Case, Presentation } from "./types.js";

const BASE = "/api";

async function j(res: Response): Promise<unknown> {
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText}: ${t}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export async function createCase(p: Presentation, title?: string): Promise<Case> {
  return j(await fetch(`${BASE}/cases`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...p, title }),
  })) as Promise<Case>;
}

export async function listCases(): Promise<Case[]> {
  return j(await fetch(`${BASE}/cases`)) as Promise<Case[]>;
}

export async function getCase(id: string): Promise<Case> {
  return j(await fetch(`${BASE}/cases/${id}`)) as Promise<Case>;
}

export async function deleteCase(id: string): Promise<void> {
  await j(await fetch(`${BASE}/cases/${id}`, { method: "DELETE" }));
}

export async function advance(id: string): Promise<Case> {
  return j(await fetch(`${BASE}/cases/${id}/advance`, { method: "POST" })) as Promise<Case>;
}

export async function addFinding(
  id: string,
  f: { summary: string; detail?: string; direction?: "supports" | "against" | "neutral"; source?: string; hypothesisIds?: string[]; testId?: string },
): Promise<Case> {
  return j(await fetch(`${BASE}/cases/${id}/finding`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(f),
  })) as Promise<Case>;
}

export async function diagnose(
  id: string,
  body: { hypothesisId?: string; confidence?: number; message?: string },
): Promise<Case> {
  return j(await fetch(`${BASE}/cases/${id}/diagnose`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })) as Promise<Case>;
}

export async function treat(id: string): Promise<Case> {
  return j(await fetch(`${BASE}/cases/${id}/treat`, { method: "POST" })) as Promise<Case>;
}

export async function chat(id: string, message: string): Promise<{ reply: string }> {
  return j(await fetch(`${BASE}/cases/${id}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  })) as Promise<{ reply: string }>;
}

/** Subscribe to the per-case SSE stream. Returns an unsubscribe fn. */
export function streamCase(
  id: string,
  onEvent: (ev: { kind: string; payload?: unknown }) => void,
): () => void {
  const es = new EventSource(`${BASE}/cases/${id}/stream`);
  es.addEventListener("snapshot", (e) => {
    try {
      onEvent({ kind: "snapshot", payload: JSON.parse((e as MessageEvent).data) });
    } catch {
      /* ignore */
    }
  });
  es.onmessage = (e) => {
    try {
      onEvent(JSON.parse(e.data));
    } catch {
      /* ignore */
    }
  };
  return () => es.close();
}
