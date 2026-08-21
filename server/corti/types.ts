/**
 * A2A (Agent-to-Agent) protocol v1.0 types for the Corti Agent API.
 *
 * Ported from the live dev-weu API contract validated in the prior PRIORA
 * session. Intentionally loose (extra fields tolerated) — the platform adds
 * metadata over time.
 */

/** One part of a message: text, data, or a file (flat v2 wire shape). */
export interface A2APart {
  kind?: string; // "text" | "data" — tolerated by the v2 server
  text?: string;
  data?: unknown;
  mediaType?: string;
  metadata?: Record<string, unknown>;
}

export type MessageRole = "ROLE_USER" | "ROLE_AGENT" | "user" | "agent";

export interface A2AMessage {
  messageId?: string;
  contextId?: string;
  taskId?: string;
  role: MessageRole;
  parts: A2APart[];
  kind?: string;
  metadata?: Record<string, unknown>;
}

export interface A2ASendMessageRequest {
  message: A2AMessage;
  configuration?: {
    returnImmediately?: boolean;
    historyLength?: number;
    acceptedOutputModes?: string[];
  };
  metadata?: Record<string, unknown>;
}

export type TaskState =
  | "TASK_STATE_COMPLETED"
  | "TASK_STATE_FAILED"
  | "TASK_STATE_CANCELED"
  | "TASK_STATE_REJECTED"
  | "TASK_STATE_INPUT_REQUIRED"
  | "TASK_STATE_WORKING"
  | string;

export interface TaskStatus {
  state: TaskState;
  timestamp?: string;
  message?: A2AMessage;
}

export interface A2AArtifact {
  artifactId?: string;
  name?: string;
  parts?: A2APart[];
  metadata?: Record<string, unknown>;
}

export interface A2ATask {
  id?: string;
  contextId?: string;
  status: TaskStatus;
  artifacts?: A2AArtifact[];
  history?: A2AMessage[];
  metadata?: Record<string, unknown>;
}

export interface A2ASendMessageResponse {
  task?: A2ATask;
  message?: A2AMessage;
  contextId?: string;
}

// ---- Agent CRUD ----------------------------------------------------------

export interface Connector {
  type: "schema" | "registry" | "mcp" | "agent" | "a2a";
  name?: string;
  schema?: Record<string, unknown>;
  description?: string;
  transition?: "input_required" | "complete";
  url?: string;
  auth?: { type: string; scope?: string; redirectUrl?: string };
  agentId?: string;
  enabled?: boolean;
  config?: Record<string, unknown>;
}

export interface AgentCreateRequest {
  name: string;
  description?: string;
  systemPrompt?: string;
  model?: string;
  visibility?: "private" | "unlisted" | "public";
  lifecycle?: "ephemeral" | "persistent";
  connectors?: Connector[];
  labels?: Record<string, string>;
}

export interface AgentResponse {
  id: string; // agt.<uuid>
  name: string;
  description?: string | null;
  systemPrompt?: string | null;
  model?: string | null;
  visibility?: string;
  lifecycle?: string;
  connectors?: Connector[];
  labels?: Record<string, string>;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface AgentsListResponse {
  agents: AgentResponse[];
  nextPageToken?: string;
  totalSize?: number;
}

export interface RegistryConnector {
  name: string;
  type?: string;
  kind?: string;
  description?: string;
  configSchema?: Record<string, unknown>;
}

export interface RegistryConnectorsResponse {
  connectors: RegistryConnector[];
}

// ---- Streaming (SSE) -----------------------------------------------------

export interface A2AStreamResponse {
  task?: A2ATask;
  message?: A2AMessage;
  statusUpdate?: {
    taskId?: string;
    contextId?: string;
    status: TaskStatus;
    metadata?: Record<string, unknown>;
  };
  artifactUpdate?: {
    taskId?: string;
    artifact: A2AArtifact;
    lastChunk?: boolean;
  };
}
