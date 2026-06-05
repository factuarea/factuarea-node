import { randomUUID } from "node:crypto";
import {
  ApiKeyAuth,
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

/** Public configuration for the SDK client. Only `apiKey` is required. */
export interface FactuareaConfig {
  /** API key. Its prefix (`fact_test_` / `fact_live_`) selects the environment. */
  apiKey: string;
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
   * Internal: override the auth strategy. The public surface only documents
   * `apiKey`; this lets future OAuth flows plug in without a breaking change.
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
  /** Multipart form data (file uploads). Mutually exclusive with `body`. */
  formData?: FormData;
  /** Per-request header overrides. */
  headers?: Record<string, string>;
  /** Override the auto-generated `Idempotency-Key` for this POST. */
  idempotencyKey?: string;
  /** Per-request timeout override (ms). */
  timeout?: number;
  /** Per-request retry override. */
  maxRetries?: number;
}

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

const METHODS_WITH_IDEMPOTENCY = new Set<HttpMethod>(["POST"]);

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

  constructor(config: FactuareaConfig) {
    if (config.authStrategy === undefined) {
      if (typeof config.apiKey !== "string" || config.apiKey.length === 0) {
        throw new TypeError("Factuarea: `apiKey` is required.");
      }
      this.#auth = new ApiKeyAuth(config.apiKey);
      this.environment = environmentFromApiKey(config.apiKey);
    } else {
      this.#auth = config.authStrategy;
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

  /** Performs a JSON request, returning the decoded body. */
  async request<T>(options: RequestOptions): Promise<ApiResponse<T>> {
    const { response, requestId } = await this.#send(options, "application/json");
    const headers = response.headers;

    if (response.status === 204 || response.headers.get("content-length") === "0") {
      return { data: undefined as T, status: response.status, headers, requestId };
    }

    const text = await response.text();
    const parsed = text.length > 0 ? safeJsonParse(text) : undefined;

    if (!response.ok) {
      throw errorFromResponse(response.status, parsed ?? text, headers);
    }

    return { data: parsed as T, status: response.status, headers, requestId };
  }

  /** Performs a request expecting a binary body (PDF, etc.). */
  async requestBinary(options: RequestOptions): Promise<BinaryResponse> {
    const { response, requestId } = await this.#send(options, "application/pdf, application/octet-stream, */*");
    const headers = response.headers;

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
  }

  /**
   * Core send loop: builds the request, applies auth/idempotency/headers, and
   * retries transient failures with backoff. The `Idempotency-Key` is computed
   * once and reused across all attempts of the same logical request.
   */
  async #send(
    options: RequestOptions,
    accept: string,
  ): Promise<{ response: Response; requestId: string | null }> {
    const url = this.#buildUrl(options.path, options.query);
    const authHeaders = await this.#auth.headers();
    const idempotencyKey = this.#resolveIdempotencyKey(options);
    const timeout = options.timeout ?? this.#timeout;
    const maxRetries = options.maxRetries ?? this.#retry.maxRetries;

    const headers: Record<string, string> = {
      Accept: accept,
      "User-Agent": this.#userAgent,
      "Factuarea-Version": this.#factuareaVersion,
      ...this.#defaultHeaders,
      ...authHeaders,
      ...options.headers,
    };
    if (idempotencyKey) {
      headers["Idempotency-Key"] = idempotencyKey;
    }

    let requestBody: BodyInit | undefined;
    if (options.formData) {
      requestBody = options.formData; // fetch sets the multipart boundary.
    } else if (options.body !== undefined && options.method !== "GET") {
      headers["Content-Type"] = "application/json";
      requestBody = JSON.stringify(options.body);
    }

    let lastError: FactuareaError | undefined;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);
      try {
        const response = await this.#fetch(url, {
          method: options.method,
          headers,
          body: requestBody,
          signal: controller.signal,
        });

        if (isRetryableStatus(response.status) && attempt < maxRetries) {
          const retryAfter = parseRetryAfter(response.headers);
          // Drain the body so the connection can be reused.
          await response.arrayBuffer().catch(() => undefined);
          await sleep(computeDelayMs(attempt, this.#retry, retryAfter));
          continue;
        }

        const requestId = response.headers.get("x-request-id");
        return { response, requestId };
      } catch (cause) {
        lastError = new ConnectionError({
          message:
            cause instanceof Error && cause.name === "AbortError"
              ? `Factuarea: request to ${options.method} ${options.path} timed out after ${timeout}ms.`
              : `Factuarea: network error calling ${options.method} ${options.path}.`,
          cause,
        });
        if (attempt < maxRetries) {
          await sleep(computeDelayMs(attempt, this.#retry));
          continue;
        }
      } finally {
        clearTimeout(timer);
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
    if (options.idempotencyKey !== undefined) {
      return options.idempotencyKey;
    }
    if (METHODS_WITH_IDEMPOTENCY.has(options.method)) {
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
              url.searchParams.append(key, String(item));
            }
          }
        } else if (typeof value === "object") {
          // Bracketed filters (`created[gte]`) are passed pre-flattened by callers.
          continue;
        } else {
          url.searchParams.set(key, String(value));
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
