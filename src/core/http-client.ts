import { createHash, randomUUID } from "node:crypto";
import {
  ApiKeyAuth,
  BearerAuth,
  TokenProviderAuth,
  type AuthStrategy,
  type Environment,
  environmentFromApiKey,
} from "./auth.js";
import {
  ConnectionError,
  errorFromResponse,
  parseRetryAfter,
  type FactuareaError,
} from "./errors.js";
import {
  computeDelayMs,
  DEFAULT_RETRY_OPTIONS,
  isRetryableStatus,
  type RetryOptions,
  sleep,
} from "./retry.js";
import { DEFAULT_FACTUAREA_VERSION, SDK_VERSION } from "./version.js";

/** Public configuration for the SDK client. Choose an API key or a native OAuth access token. */
export interface FactuareaConfig {
  /** API key. Its prefix (`fact_test_` / `fact_live_`) selects the environment. */
  apiKey?: string;
  /** Actual OAuth token or provider. Invoked once per request; never automatically refreshed/replayed. */
  oauthBearer?: string | (() => Promise<string> | string);
  /** Override the base URL (self-hosted / staging). Default production v1. */
  baseUrl?: string;
  /** Per-request timeout in ms. Default 60000. */
  timeout?: number;
  /** Max retry attempts after the first try. Default 2. */
  maxRetries?: number;
  /** Pinned `Factuarea-Version` header. Default tracks this SDK release. */
  factuareaVersion?: string;
  /** Extra headers added to every request. */
  defaultHeaders?: Record<string, string>;
  /** Custom `fetch` implementation (e.g. undici, a proxy). Default global fetch. */
  fetch?: typeof fetch;
  /**
   * Internal: override the auth strategy. Public OAuth uses `oauthBearer` so
   * native bearer dispatch rules remain explicit.
   * @internal
   */
  authStrategy?: AuthStrategy;
}

const DEFAULT_BASE_URL = "https://api.factuarea.com/v1";
const DEFAULT_TIMEOUT_MS = 60_000;

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RequestOptions {
  method: HttpMethod;
  /** Path relative to the base URL, e.g. `/invoices` or `/invoices/{id}`. */
  path: string;
  /** Query parameters. Arrays expand to repeated keys; objects are skipped. */
  query?: Record<string, unknown> | undefined;
  /** JSON request body (serialized). Mutually exclusive with `formData`. */
  body?: unknown;
  /** Exact first JSON wire body. Never parsed or reserialized by the transport. */
  rawBody?: string;
  /** Multipart form data (file uploads). Mutually exclusive with `body`. */
  formData?: FormData;
  /** Per-request header overrides. */
  headers?: Record<string, string>;
  /** Override the auto-generated `Idempotency-Key` for this mutation. */
  idempotencyKey?: string;
  /** False removes the HTTP key header for native effect ledger operations. */
  autoIdempotency?: boolean;
  /**
   * Spec-guided opt-in (design D6): set by the resource layer for non-`POST`
   * mutations that the OpenAPI spec marks as requiring `Idempotency-Key`.
   * Currently redundant with `METHODS_WITH_IDEMPOTENCY` below (which already
   * generates the header unconditionally for every mutating method), kept so
   * the per-operation signal from the spec stays explicit in the generated
   * call sites rather than relying solely on the broader blanket policy.
   */
  idempotent?: boolean;
  /** Per-request timeout override (ms). */
  timeout?: number;
  /** Per-request retry override. */
  maxRetries?: number;
  /** Native original reads must not follow another endpoint. */
  noRedirects?: boolean;
  /** Cancels the request wait; a cancelled mutation may already have committed. */
  signal?: AbortSignal;
  /** @internal Original document intent context, checked before sending. Contains no credentials. */
  contextFingerprint?: string;
  /** @internal Retained CRM server/company/profile/version frame; authentication is checked by the native server. */
  frameFingerprint?: string;
}

/** A retained intent cannot be sent using another server, credential or Company/profile/version context. */
export class RequestContextChangedError extends TypeError {}

/** A successful HTTP response, decoded as JSON of type `T`. */
export interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Headers;
  requestId: string | null;
}

/** A successful binary response (PDF, etc.). */
export interface BinaryResponse {
  /** The raw bytes. */
  body: ArrayBuffer;
  contentType: string | null;
  status: number;
  headers: Headers;
  requestId: string | null;
  /** Convenience: the bytes as a Node Buffer. */
  toBuffer(): Buffer;
  /** Convenience: the bytes as a Blob (preserving content-type). */
  toBlob(): Blob;
}

const METHODS_WITH_IDEMPOTENCY = new Set<HttpMethod>(["POST", "PUT", "PATCH", "DELETE"]);

export class HttpClient {
  readonly #auth: AuthStrategy;
  readonly #baseUrl: string;
  readonly #timeout: number;
  readonly #retry: RetryOptions;
  readonly #factuareaVersion: string;
  readonly #defaultHeaders: Record<string, string>;
  readonly #fetch: typeof fetch;
  readonly #userAgent: string;
  readonly environment: Environment;
  readonly authModel: "api_key" | "oauth" | "custom";

  constructor(config: FactuareaConfig) {
    if (config.oauthBearer !== undefined) {
      if (config.apiKey !== undefined || config.authStrategy !== undefined) throw new TypeError("Factuarea: choose exactly one authentication source.");
      this.#auth = typeof config.oauthBearer === "string" ? new BearerAuth(config.oauthBearer) : new TokenProviderAuth(config.oauthBearer);
      this.authModel = "oauth";
      this.environment = "unknown";
    } else if (config.authStrategy === undefined) {
      if (typeof config.apiKey !== "string" || config.apiKey.length === 0) {
        throw new TypeError("Factuarea: `apiKey` is required.");
      }
      this.#auth = new ApiKeyAuth(config.apiKey);
      this.authModel = "api_key";
      this.environment = environmentFromApiKey(config.apiKey);
    } else {
      this.#auth = config.authStrategy;
      this.authModel = "custom";
      this.environment = "unknown";
    }

    this.#baseUrl = (config.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
    this.#timeout = config.timeout ?? DEFAULT_TIMEOUT_MS;
    this.#retry = {
      ...DEFAULT_RETRY_OPTIONS,
      maxRetries: config.maxRetries ?? DEFAULT_RETRY_OPTIONS.maxRetries,
    };
    this.#factuareaVersion = config.factuareaVersion ?? DEFAULT_FACTUAREA_VERSION;
    this.#defaultHeaders = config.defaultHeaders ?? {};

    const resolvedFetch = config.fetch ?? globalThis.fetch;
    if (typeof resolvedFetch !== "function") {
      throw new TypeError(
        "Factuarea: global `fetch` is not available in this runtime. Use Node 20+ or pass `fetch` in the config.",
      );
    }
    this.#fetch = resolvedFetch;

    const nodeVersion = typeof process !== "undefined" ? process.version?.replace(/^v/, "") : undefined;
    this.#userAgent = nodeVersion
      ? `factuarea-node/${SDK_VERSION} node/${nodeVersion}`
      : `factuarea-node/${SDK_VERSION}`;
  }

  /** @internal One-way identity of the effective document request authority; never exposes its secrets. */
  async requestContextFingerprint(headers?: Record<string, string>): Promise<string> {
    return this.#contextFingerprint(new Headers({
      "Factuarea-Version": this.#factuareaVersion,
      ...this.#defaultHeaders,
      ...await this.#auth.headers(),
      ...headers,
    }));
  }

  #contextFingerprint(headers: Headers): string {
    const context = [this.#baseUrl, ...["Authorization", "X-API-Key", "X-Company-Id", "X-Active-Profile", "Factuarea-Version"]
      .map(name => headers.get(name))];
    return createHash("sha256").update(JSON.stringify(context)).digest("hex");
  }

  /** @internal Does not pin a bearer or pretend to prove credential lineage. */
  requestFrameFingerprint(): string {
    return this.#frameFingerprint(new Headers({ "Factuarea-Version": this.#factuareaVersion, ...this.#defaultHeaders }));
  }

  #frameFingerprint(headers: Headers): string {
    return createHash("sha256").update(JSON.stringify([this.#baseUrl, ...["X-Company-Id", "X-Active-Profile", "Factuarea-Version"].map(name => headers.get(name))])).digest("hex");
  }

  /** Performs a JSON request, returning the decoded body. */
  async request<T>(options: RequestOptions): Promise<ApiResponse<T>> {
    const { response, requestId, dispose } = await this.#send(options, "application/json");
    const headers = response.headers;
    try {
      if (response.status === 204 || response.headers.get("content-length") === "0") {
        return { data: undefined as T, status: response.status, headers, requestId };
      }

      const text = await response.text();
      const parsed = text.length > 0 ? safeJsonParse(text) : undefined;

      if (!response.ok) {
        throw errorFromResponse(response.status, parsed ?? text, headers);
      }

      return { data: parsed as T, status: response.status, headers, requestId };
    } finally {
      dispose();
    }
  }

  /** Performs a request expecting a binary body (PDF, etc.). */
  async requestBinary(options: RequestOptions): Promise<BinaryResponse> {
    const { response, requestId, dispose } = await this.#send(options, "application/pdf, application/octet-stream, */*");
    const headers = response.headers;
    try {
      if (!response.ok) {
        const text = await response.text();
        throw errorFromResponse(response.status, safeJsonParse(text) ?? text, headers);
      }

      const body = await response.arrayBuffer();
      const contentType = headers.get("content-type");
      return {
        body,
        contentType,
        status: response.status,
        headers,
        requestId,
        toBuffer: () => Buffer.from(body),
        toBlob: () => new Blob([body], contentType ? { type: contentType } : undefined),
      };
    } finally {
      dispose();
    }
  }

  /**
   * Core send loop: builds the request, applies auth/idempotency/headers, and
   * retries transient failures with backoff. The `Idempotency-Key` is computed
   * once and reused across all attempts of the same logical request.
   */
  async #send(
    options: RequestOptions,
    accept: string,
  ): Promise<{ response: Response; requestId: string | null; dispose: () => void }> {
    const url = this.#buildUrl(options.path, options.query);
    const authHeaders = await this.#auth.headers();
    const idempotencyKey = this.#resolveIdempotencyKey(options);
    const timeout = options.timeout ?? this.#timeout;
    const oauthMutation = this.authModel === "oauth" && METHODS_WITH_IDEMPOTENCY.has(options.method);
    const maxRetries = oauthMutation ? 0 : (options.maxRetries ?? this.#retry.maxRetries);
    if (this.authModel === "oauth" && Object.keys({ ...this.#defaultHeaders, ...options.headers }).some(name => ["authorization", "x-api-key"].includes(name.toLowerCase()))) {
      throw new TypeError("Factuarea: OAuth authentication headers cannot be overridden.");
    }
    if ([options.body !== undefined, options.rawBody !== undefined, options.formData !== undefined].filter(Boolean).length > 1) {
      throw new TypeError("Factuarea: choose one request body source.");
    }

    const headers = new Headers({
      Accept: accept,
      "User-Agent": this.#userAgent,
      "Factuarea-Version": this.#factuareaVersion,
      ...this.#defaultHeaders,
      ...authHeaders,
      ...options.headers,
    });
    if (options.contextFingerprint !== undefined && options.contextFingerprint !== this.#contextFingerprint(headers)) {
      throw new RequestContextChangedError("Factuarea: document recovery requires its original request context.");
    }
    if (options.frameFingerprint !== undefined && options.frameFingerprint !== this.#frameFingerprint(headers)) {
      throw new RequestContextChangedError("Factuarea: retained CRM intent requires its original request context.");
    }
    if (options.autoIdempotency === false) headers.delete("Idempotency-Key");
    if (idempotencyKey) {
      headers.set("Idempotency-Key", idempotencyKey);
    }

    let requestBody: BodyInit | undefined;
    if (options.rawBody !== undefined && options.method !== "GET") {
      headers.set("Content-Type", "application/json");
      requestBody = options.rawBody;
    } else if (options.formData) {
      requestBody = options.formData; // fetch sets the multipart boundary.
    } else if (options.body !== undefined && options.method !== "GET") {
      headers.set("Content-Type", "application/json");
      requestBody = JSON.stringify(options.body);
    }

    let lastError: FactuareaError | undefined;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      if (options.signal?.aborted) {
        throw new ConnectionError({ message: "Factuarea: request cancelled.", cause: options.signal.reason });
      }
      const controller = new AbortController();
      const abort = (): void => controller.abort(options.signal?.reason);
      options.signal?.addEventListener("abort", abort, { once: true });
      const timer = setTimeout(() => controller.abort(), timeout);
      let keepSignal = false;
      try {
        const response = await this.#fetch(url, {
          method: options.method,
          headers,
          body: requestBody,
          signal: controller.signal,
          ...(oauthMutation || options.noRedirects ? { redirect: "error" as const } : {}),
        });

        if (isRetryableStatus(response.status) && attempt < maxRetries) {
          const retryAfter = parseRetryAfter(response.headers);
          // Drain the body so the connection can be reused.
          await response.arrayBuffer().catch(() => undefined);
          await sleep(computeDelayMs(attempt, this.#retry, retryAfter));
          continue;
        }

        const requestId = response.headers.get("x-request-id");
        keepSignal = true;
        return { response, requestId, dispose: () => { clearTimeout(timer); options.signal?.removeEventListener("abort", abort); } };
      } catch (cause) {
        lastError = new ConnectionError({
          message:
            cause instanceof Error && cause.name === "AbortError"
              ? `Factuarea: request to ${options.method} ${options.path} timed out after ${timeout}ms.`
              : `Factuarea: network error calling ${options.method} ${options.path}.`,
          cause,
        });
        if (attempt < maxRetries && !options.signal?.aborted) {
          await sleep(computeDelayMs(attempt, this.#retry));
          continue;
        }
      } finally {
        if (!keepSignal) clearTimeout(timer);
        if (!keepSignal) options.signal?.removeEventListener("abort", abort);
      }
    }

    throw (
      lastError ??
      new ConnectionError({
        message: `Factuarea: request to ${options.method} ${options.path} failed.`,
      })
    );
  }

  #resolveIdempotencyKey(options: RequestOptions): string | undefined {
    if (options.autoIdempotency === false) return undefined;
    if (options.idempotencyKey !== undefined) {
      return options.idempotencyKey;
    }
    if (options.idempotent || METHODS_WITH_IDEMPOTENCY.has(options.method)) {
      return randomUUID();
    }
    return undefined;
  }

  #buildUrl(path: string, query?: Record<string, unknown>): string {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    const url = new URL(this.#baseUrl + normalizedPath);
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value === undefined || value === null) {
          continue;
        }
        if (Array.isArray(value)) {
          for (const item of value) {
            if (item !== undefined && item !== null) {
              url.searchParams.append(key.endsWith("[]") ? key : `${key}[]`, String(typeof item === "boolean" ? Number(item) : item));
            }
          }
        } else if (typeof value === "object") {
          // Bracketed filters (`created[gte]`) are passed pre-flattened by callers.
          continue;
        } else {
          url.searchParams.set(key, String(typeof value === "boolean" ? Number(value) : value));
        }
      }
    }
    return url.toString();
  }
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}
