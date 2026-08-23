/**
 * Corti Agent API client — proven-against-dev-weu REST + A2A client.
 *
 * Responsibilities:
 *   - OAuth2 client-credentials token (cached per instance, refreshed on 401)
 *   - Agent CRUD: create / list / get / delete
 *   - Registry connector listing
 *   - A2A message:send (non-stream) and message:stream (SSE)
 *
 * The token is fetched lazily and cached. Secrets live only in process env,
 * never serialized, never returned to callers.
 */

import type {
  AgentCreateRequest,
  AgentResponse,
  AgentsListResponse,
  A2ASendMessageRequest,
  A2ASendMessageResponse,
  RegistryConnectorsResponse,
  A2AStreamResponse,
} from "./types.js";

const DEFAULT_TIMEOUT_MS = 240_000; // platform can take minutes on expert-chained calls

export interface CortiConfig {
  apiBaseUrl: string; // https://api.dev-weu.corti.app (or eu / staging-eu / us / local)
  authBaseUrl: string; // https://auth.<region>.corti.app (empty for local)
  clientId: string;
  clientSecret: string;
  tenant: string; // base — realm AND Tenant-Name header
  a2aVersion?: string; // default 1.0
  region?: string; // dev-weu | eu | staging-eu | us | local (for diagnostics)
  staticToken?: string; // local region uses a static token instead of OAuth
}

export class CortiClient {
  private token: string | null = null;
  private tokenPromise: Promise<string> | null = null;
  private readonly cfg: CortiConfig;

  constructor(cfg: CortiConfig) {
    this.cfg = { a2aVersion: "1.0", ...cfg };
  }

  /** Build a CortiClient from process environment.
   *
   * Region is selected by `CORTI_REGION` (default `dev-weu`). Each region reads
   * its own `AGENT_API_URL_<REGION>`, `AGENT_API_AUTH_URL_<REGION>`,
   * `AGENT_API_CLIENT_ID_<REGION>`, `AGENT_API_CLIENT_SECRET_<REGION>` env vars.
   * Supported: `dev-weu`, `eu`, `staging-eu`, `us`, `local`.
   * NOTE: as of 2026-08-23, dev-weu's `/a2a/message:send` returns a plain-text
   * `404 page not found` while its agent CRUD works — the A2A route appears not
   * to be routed on that deployment. `eu` is confirmed working end-to-end.
   * Set `CORTI_REGION=eu` to run Arbor against the working deployment. */
  static fromEnv(env: NodeJS.ProcessEnv = process.env): CortiClient {
    const region = (env.CORTI_REGION || "dev-weu").toLowerCase();
    const suffix = region === "dev-weu" ? "DEV_WEU"
      : region === "staging-eu" ? "STAGING_EU"
      : region.toUpperCase(); // eu -> EU, us -> US, local -> LOCAL
    const urlKey = region === "local" ? "AGENT_API_TOKEN_LOCAL"
      : `AGENT_API_URL_${suffix}`;
    const authKey = `AGENT_API_AUTH_URL_${suffix}`;
    const idKey = `AGENT_API_CLIENT_ID_${suffix}`;
    const secretKey = `AGENT_API_CLIENT_SECRET_${suffix}`;
    const required = region === "local"
      ? ["AGENT_API_TOKEN_LOCAL"] as const
      : [urlKey, authKey, idKey, secretKey] as const;
    for (const k of required) {
      if (!env[k]) {
        throw new Error(
          `Missing ${k} (CORTI_REGION=${region}). Copy .env.example to .env and fill in ${region} credentials.`,
        );
      }
    }
    return new CortiClient({
      apiBaseUrl: env[urlKey] as string,
      authBaseUrl: region === "local" ? "" : (env[authKey] as string),
      clientId: region === "local" ? "" : (env[idKey] as string),
      clientSecret: region === "local" ? "" : (env[secretKey] as string),
      tenant: env.CORTI_TENANT_NAME || "base",
      a2aVersion: env.A2A_VERSION || "1.0",
      region,
      staticToken: region === "local" ? (env.AGENT_API_TOKEN_LOCAL as string) : undefined,
    });
  }

  get baseUrl(): string {
    return this.cfg.apiBaseUrl.replace(/\/$/, "");
  }

  // ---- Auth ---------------------------------------------------------------

  async getToken(): Promise<string> {
    if (this.token) return this.token;
    if (this.tokenPromise) return this.tokenPromise;
    this.tokenPromise = this.fetchToken().then((tok) => {
      this.token = tok;
      this.tokenPromise = null;
      return tok;
    });
    return this.tokenPromise;
  }

  private async fetchToken(): Promise<string> {
    // local region uses a pre-shared static token, no OAuth.
    if (this.cfg.staticToken) return this.cfg.staticToken;
    const url = `${this.cfg.authBaseUrl}/realms/${this.cfg.tenant}/protocol/openid-connect/token`;
    const body = new URLSearchParams({
      grant_type: "client_credentials",
      scope: "openid",
      client_id: this.cfg.clientId,
      client_secret: this.cfg.clientSecret,
    });
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(
        `OAuth2 token request failed (${res.status}) from ${url}. ${text.slice(0, 200)}`,
      );
    }
    const data = (await res.json()) as { access_token?: string };
    if (!data.access_token) {
      throw new Error(`Token response from ${url} had no access_token.`);
    }
    return data.access_token;
  }

  invalidateToken(): void {
    this.token = null;
  }

  // ---- Core HTTP ----------------------------------------------------------

  private authHeaders(): Record<string, string> {
    return {
      "Content-Type": "application/json",
      "Tenant-Name": this.cfg.tenant,
    };
  }

  private async request<T>(
    method: string,
    path: string,
    opts: {
      json?: unknown;
      params?: Record<string, string | number | boolean | undefined>;
      headers?: Record<string, string>;
      timeoutMs?: number;
      allowEmpty?: boolean;
    } = {},
  ): Promise<T> {
    const url = new URL(this.baseUrl + path);
    if (opts.params) {
      for (const [k, v] of Object.entries(opts.params)) {
        if (v !== undefined) url.searchParams.set(k, String(v));
      }
    }
    const doFetch = async (): Promise<Response> => {
      const token = await this.getToken();
      const headers = {
        ...this.authHeaders(),
        Authorization: `Bearer ${token}`,
        ...(opts.headers || {}),
      };
      return fetch(url, {
        method,
        headers,
        body: opts.json !== undefined ? JSON.stringify(opts.json) : undefined,
        signal: AbortSignal.timeout(opts.timeoutMs ?? DEFAULT_TIMEOUT_MS),
      });
    };

    let res = await doFetch();
    if (res.status === 401) {
      this.invalidateToken();
      res = await doFetch();
    }
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      const err = new Error(
        `HTTP ${res.status} ${method} ${path}${text ? ": " + text.slice(0, 300) : ""}`,
      ) as Error & { status?: number };
      err.status = res.status;
      throw err;
    }
    if (opts.allowEmpty && (res.status === 204 || (await res.clone().text()).length === 0)) {
      return undefined as T;
    }
    const text = await res.text();
    if (!text) return undefined as T;
    try {
      return JSON.parse(text) as T;
    } catch {
      return text as unknown as T;
    }
  }

  // ---- Agent CRUD ---------------------------------------------------------

  createAgent(payload: AgentCreateRequest): Promise<AgentResponse> {
    return this.request<AgentResponse>("POST", "/v2/agentic/agents", {
      json: payload,
    });
  }

  listAgents(params?: { pageSize?: number; pageToken?: string }): Promise<AgentsListResponse> {
    return this.request<AgentsListResponse>("GET", "/v2/agentic/agents", {
      params,
    });
  }

  getAgent(id: string): Promise<AgentResponse> {
    return this.request<AgentResponse>("GET", `/v2/agentic/agents/${id}`);
  }

  deleteAgent(id: string): Promise<void> {
    return this.request<void>("DELETE", `/v2/agentic/agents/${id}`, {
      allowEmpty: true,
    });
  }

  // ---- Registry -----------------------------------------------------------

  listRegistryConnectors(): Promise<RegistryConnectorsResponse> {
    return this.request<RegistryConnectorsResponse>(
      "GET",
      "/v2/agentic/registry/connectors",
    );
  }

  // ---- A2A messaging ------------------------------------------------------

  sendMessage(
    agentId: string,
    payload: A2ASendMessageRequest,
  ): Promise<A2ASendMessageResponse> {
    return this.request<A2ASendMessageResponse>(
      "POST",
      `/v2/agentic/agents/${agentId}/a2a/message:send`,
      {
        json: payload,
        headers: { "A2A-Version": this.cfg.a2aVersion || "1.0" },
      },
    );
  }

  /**
   * Stream a message over the `message:stream` SSE endpoint. Yields parsed SSE
   * `data` payloads plus `{__raw}` on parse errors so callers can decide.
   */
  async *streamMessage(
    agentId: string,
    payload: A2ASendMessageRequest,
    opts: { timeoutMs?: number; signal?: AbortSignal } = {},
  ): AsyncGenerator<A2AStreamResponse & { __raw?: string }> {
    const url = `${this.baseUrl}/v2/agentic/agents/${agentId}/a2a/message:stream`;
    const token = await this.getToken();
    const headers = {
      ...this.authHeaders(),
      Authorization: `Bearer ${token}`,
      "A2A-Version": this.cfg.a2aVersion || "1.0",
      Accept: "text/event-stream",
    };
    const controller = new AbortController();
    if (opts.signal) opts.signal.addEventListener("abort", () => controller.abort());
    const timeout = setTimeout(() => controller.abort(), opts.timeoutMs ?? DEFAULT_TIMEOUT_MS);
    let res: Response;
    try {
      res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }
    if (res.status === 401) {
      this.invalidateToken();
      return this.streamMessage(agentId, payload, opts);
    }
    if (!res.ok || !res.body) {
      const text = await res.text().catch(() => "");
      throw new Error(`Stream failed (${res.status}) ${url}: ${text.slice(0, 300)}`);
    }
    const decoder = new TextDecoder();
    const reader = res.body.getReader();
    let buffer = "";
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let sep: number;
        while ((sep = buffer.indexOf("\n\n")) !== -1) {
          const record = buffer.slice(0, sep);
          buffer = buffer.slice(sep + 2);
          const dataLines = record
            .split("\n")
            .filter((l) => l.startsWith("data:"))
            .map((l) => l.slice(5).trimStart());
          if (dataLines.length === 0) continue;
          const dataStr = dataLines.join("\n");
          try {
            yield JSON.parse(dataStr) as A2AStreamResponse;
          } catch {
            yield { __raw: dataStr } as A2AStreamResponse & { __raw?: string };
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}
