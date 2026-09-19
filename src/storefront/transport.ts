/**
 * The browser transport of the buyer lane.
 *
 * ## Why this is not `src/core/http-client.ts`
 *
 * The server transport imports Node's crypto module on its first line and the
 * package is bundled for Node. Reusing it would force every shop the agency
 * builds to polyfill a Node builtin in its web bundle (design.md D7). This file
 * is the browser half: it depends on the Web `fetch` standard and on nothing
 * else — no dependency, no Node builtin.
 *
 * ## What travels, and what may not
 *
 * The lane authenticates with the publishable credential in its OWN header, and
 * the server decides by the declared `Origin` whether that credential may be
 * used from this site. Two consequences the code has to respect:
 *
 *   • Every request is emitted with `credentials: "omit"`. Cookies and HTTP
 *     auth of the shopper's browser never travel: the shop's own session has
 *     nothing to do with Factuarea, `Access-Control-Allow-Credentials` is never
 *     served, and sending them would only let a third-party page ride on the
 *     visitor. The shop's page cannot set `Origin` either — the browser does,
 *     and that is the whole point.
 *
 *   • Only the request headers the preflight declares may be sent. Measured on
 *     the server (`StorefrontCorsPreflight::ALLOWED_HEADERS`, 2026-09-18):
 *     `Authorization`, `X-Storefront-Key`, `Content-Type`, `Accept`,
 *     `Accept-Language`, `Idempotency-Key`, `X-Request-Id`. That list is why
 *     this transport does NOT send `Factuarea-Version` nor `User-Agent`, which
 *     the server SDK does send: either one would fail the preflight and the
 *     real request would never leave the browser.
 *
 * Response headers readable from a page are the five the lane exposes
 * (`X-Request-Id`, the three rate-limit ones and `Retry-After`); the backoff
 * and the request id of a typed error are built on exactly those.
 */

import { assertPublishableStorefrontKey } from "./credential.js";
import { newIdempotencyKey } from "./idempotency.js";
import {
  StorefrontConnectionError,
  parseRetryAfter,
  storefrontErrorFromResponse,
} from "./errors.js";

/** The lane's own credential header, the mirror of `X-API-Key` of the server lane. */
export const CREDENTIAL_HEADER = "X-Storefront-Key";

/**
 * Request headers the buyer lane's preflight allows. Anything outside this list
 * is rejected by the browser before the real request is sent.
 */
export const STOREFRONT_ALLOWED_REQUEST_HEADERS = [
  "Authorization",
  CREDENTIAL_HEADER,
  "Content-Type",
  "Accept",
  "Accept-Language",
  "Idempotency-Key",
  "X-Request-Id",
] as const;

/** Verbs the buyer lane serves. `PUT` is not one of them. */
export type StorefrontHttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

/** Verbs that mutate, and therefore carry an idempotency key. */
const MUTATING_METHODS = new Set<StorefrontHttpMethod>(["POST", "PATCH", "DELETE"]);

/** Query values the lane accepts: scalars and lists of scalars. */
export type StorefrontQuery = Record<
  string,
  string | number | boolean | Array<string | number> | null | undefined
>;

/** Per-request overrides accepted by every method of the buyer lane. */
export interface StorefrontRequestConfig {
  /** Override the automatic `Idempotency-Key` of a mutating call. */
  idempotencyKey?: string;
  /** Per-request timeout in ms. */
  timeout?: number;
  /** Per-request retry budget. */
  maxRetries?: number;
  /** Extra headers; they must be inside the preflight's allowed list. */
  headers?: Record<string, string>;
}

export interface StorefrontRequest extends StorefrontRequestConfig {
  method: StorefrontHttpMethod;
  /** Path relative to the base URL, already interpolated. */
  path: string;
  query?: StorefrontQuery | undefined;
  body?: unknown;
}

/** A decoded response plus the metadata a page may read. */
export interface StorefrontApiResponse<T> {
  data: T;
  status: number;
  requestId: string | null;
}

/** The cursor-paginated envelope every listing of the lane returns. */
export interface StorefrontPaginatedList<T> {
  data: T[];
  has_more: boolean;
  next_cursor: string | null;
}

export interface StorefrontTransportOptions {
  /** Publishable storefront credential (`sf_pk_…`). */
  publishableKey: string;
  /** Override the base URL (staging, a local proxy). Default production v1. */
  baseUrl?: string;
  /** Per-request timeout in ms. Default 30000. */
  timeout?: number;
  /** Retry attempts after the first try. Default 2. */
  maxRetries?: number;
  /** Extra headers on every request, inside the preflight's allowed list. */
  defaultHeaders?: Record<string, string>;
  /** Custom `fetch` (a proxy, a test double). Default the global one. */
  fetch?: typeof fetch;
  /**
   * Internal: waits between retries. Injectable so the backoff can be asserted
   * without real time passing.
   * @internal
   */
  sleep?: (ms: number) => Promise<void>;
  /**
   * Internal: jitter source of the backoff.
   * @internal
   */
  random?: () => number;
}

const DEFAULT_BASE_URL = "https://api.factuarea.com/v1";
/**
 * Half of the server SDK's 60s: this timeout is paid by a shopper staring at a
 * spinner on a product page, so the lane fails fast and lets the page retry or
 * degrade instead of hanging.
 */
const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_MAX_RETRIES = 2;
const BASE_DELAY_MS = 500;
const MAX_DELAY_MS = 8_000;

/** Statuses worth retrying: the budget and the server's own failures. */
export function isRetryableStatus(status: number): boolean {
  return status === 429 || (status >= 500 && status <= 599);
}

/**
 * Delay before the next attempt: exponential with full jitter, and the server's
 * `Retry-After` when it sent one — a page that ignores it makes the budget
 * worse for every other shopper of the same shop.
 */
export function computeDelayMs(
  attempt: number,
  retryAfterSeconds?: number,
  random: () => number = Math.random,
): number {
  if (retryAfterSeconds !== undefined) {
    return Math.min(retryAfterSeconds * 1000, MAX_DELAY_MS * 4);
  }
  const capped = Math.min(BASE_DELAY_MS * 2 ** attempt, MAX_DELAY_MS);
  return Math.round(capped * random());
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return undefined;
  }
}

export class StorefrontTransport {
  readonly #publishableKey: string;
  readonly #baseUrl: string;
  readonly #timeout: number;
  readonly #maxRetries: number;
  readonly #defaultHeaders: Record<string, string>;
  readonly #fetch: typeof fetch;
  readonly #sleep: (ms: number) => Promise<void>;
  readonly #random: () => number;

  constructor(options: StorefrontTransportOptions) {
    // The guard lives here too, not only in the client: whoever builds a
    // transport by hand gets the same rejection, at construction.
    this.#publishableKey = assertPublishableStorefrontKey(options.publishableKey);
    this.#baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
    this.#timeout = options.timeout ?? DEFAULT_TIMEOUT_MS;
    this.#maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
    this.#defaultHeaders = options.defaultHeaders ?? {};
    this.#sleep =
      options.sleep ?? ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)));
    this.#random = options.random ?? Math.random;

    const resolvedFetch = options.fetch ?? globalThis.fetch;
    if (typeof resolvedFetch !== "function") {
      throw new TypeError(
        "Factuarea storefront: this runtime has no global `fetch`. Pass one in `fetch`.",
      );
    }
    this.#fetch = resolvedFetch;
  }

  /** Interpolates `{name}` path params into a path template. */
  buildPath(template: string, params: Record<string, string>): string {
    return template.replace(/\{([^}]+)\}/g, (_match, key: string) => {
      const value = params[key];
      if (value === undefined || value === null || value === "") {
        throw new TypeError(
          `Factuarea storefront: missing path parameter \`${key}\` for ${template}.`,
        );
      }
      return encodeURIComponent(value);
    });
  }

  /** Performs a request and returns the decoded body. */
  async request<T>(request: StorefrontRequest): Promise<T> {
    return (await this.requestEnvelope<T>(request)).data;
  }

  /** Performs a request and returns the body plus the readable metadata. */
  async requestEnvelope<T>(request: StorefrontRequest): Promise<StorefrontApiResponse<T>> {
    const response = await this.#send(request);
    const requestId = response.headers.get("x-request-id");

    if (response.status === 204 || response.headers.get("content-length") === "0") {
      return { data: undefined as T, status: response.status, requestId };
    }

    const text = await response.text();
    const parsed = text.length > 0 ? safeJsonParse(text) : undefined;

    if (!response.ok) {
      throw storefrontErrorFromResponse(response.status, parsed ?? text, response.headers);
    }

    return { data: parsed as T, status: response.status, requestId };
  }

  /** Fetches the first page of a listing and wraps it in a walking `Page`. */
  async paginate<T>(
    path: string,
    query: StorefrontQuery | undefined,
    config?: StorefrontRequestConfig,
  ): Promise<StorefrontPage<T>> {
    const request: StorefrontRequest = { method: "GET", path, query, ...config };
    const response = await this.requestEnvelope<StorefrontPaginatedList<T>>(request);
    return new StorefrontPage<T>(this, request, response.data, response.requestId);
  }

  /**
   * Send loop: builds the request, applies the credential, the idempotency key
   * and the headers, and retries transient failures with backoff. The key is
   * computed ONCE and reused across every attempt of the same logical call —
   * that is what makes a retry safe.
   */
  async #send(request: StorefrontRequest): Promise<Response> {
    const url = this.#buildUrl(request.path, request.query);
    const idempotencyKey = this.#resolveIdempotencyKey(request);
    const timeout = request.timeout ?? this.#timeout;
    const maxRetries = request.maxRetries ?? this.#maxRetries;

    const headers: Record<string, string> = {
      Accept: "application/json",
      ...this.#defaultHeaders,
      [CREDENTIAL_HEADER]: this.#publishableKey,
      ...request.headers,
    };
    if (idempotencyKey !== undefined) {
      headers["Idempotency-Key"] = idempotencyKey;
    }

    let body: string | undefined;
    if (request.body !== undefined && request.method !== "GET") {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(request.body);
    }

    let lastError: StorefrontConnectionError | undefined;

    for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);
      try {
        const response = await this.#fetch(url, {
          method: request.method,
          headers,
          body,
          signal: controller.signal,
          // Neither cookies nor the browser's HTTP credentials travel.
          credentials: "omit",
          mode: "cors",
        });

        if (isRetryableStatus(response.status) && attempt < maxRetries) {
          const retryAfter = parseRetryAfter(response.headers);
          await response.arrayBuffer().catch(() => undefined);
          await this.#sleep(computeDelayMs(attempt, retryAfter, this.#random));
          continue;
        }

        return response;
      } catch (cause) {
        lastError = new StorefrontConnectionError({
          message:
            cause instanceof Error && cause.name === "AbortError"
              ? `Factuarea storefront: ${request.method} ${request.path} timed out after ${timeout}ms.`
              : `Factuarea storefront: ${request.method} ${request.path} could not be reached. ` +
                "Check the network and that this origin is declared on the storefront key.",
          code: "connection_error",
          cause,
        });
        if (attempt < maxRetries) {
          await this.#sleep(computeDelayMs(attempt, undefined, this.#random));
          continue;
        }
      } finally {
        clearTimeout(timer);
      }
    }

    throw (
      lastError ??
      new StorefrontConnectionError({
        message: `Factuarea storefront: ${request.method} ${request.path} failed.`,
        code: "connection_error",
      })
    );
  }

  #resolveIdempotencyKey(request: StorefrontRequest): string | undefined {
    if (request.idempotencyKey !== undefined) {
      return request.idempotencyKey;
    }
    return MUTATING_METHODS.has(request.method) ? newIdempotencyKey() : undefined;
  }

  #buildUrl(path: string, query?: StorefrontQuery): string {
    const normalized = path.startsWith("/") ? path : `/${path}`;
    const url = new URL(this.#baseUrl + normalized);
    for (const [key, value] of Object.entries(query ?? {})) {
      if (value === undefined || value === null) {
        continue;
      }
      if (Array.isArray(value)) {
        for (const item of value) {
          url.searchParams.append(key, String(item));
        }
      } else {
        url.searchParams.set(key, String(value));
      }
    }
    return url.toString();
  }
}

/**
 * One page of a listing plus the means to walk the rest. It is async-iterable,
 * so `for await (const product of page)` crosses every page transparently.
 */
export class StorefrontPage<T> implements AsyncIterable<T> {
  /** Items on this page. */
  readonly data: T[];
  /** Whether another page follows. */
  readonly hasMore: boolean;
  /** Opaque cursor of the next page, or `null`. */
  readonly nextCursor: string | null;
  /** Request id of the response that produced this page. */
  readonly requestId: string | null;

  readonly #transport: StorefrontTransport;
  readonly #request: StorefrontRequest;

  constructor(
    transport: StorefrontTransport,
    request: StorefrontRequest,
    payload: StorefrontPaginatedList<T>,
    requestId: string | null,
  ) {
    this.#transport = transport;
    this.#request = request;
    this.data = payload?.data ?? [];
    this.hasMore = payload?.has_more ?? false;
    this.nextCursor = payload?.next_cursor ?? null;
    this.requestId = requestId;
  }

  /** Fetches the next page, or `null` when this was the last one. */
  async getNextPage(): Promise<StorefrontPage<T> | null> {
    if (!this.hasMore || this.nextCursor === null) {
      return null;
    }
    const request: StorefrontRequest = {
      ...this.#request,
      query: { ...this.#request.query, starting_after: this.nextCursor },
    };
    const response = await this.#transport.requestEnvelope<StorefrontPaginatedList<T>>(request);
    return new StorefrontPage<T>(this.#transport, request, response.data, response.requestId);
  }

  async *[Symbol.asyncIterator](): AsyncIterator<T> {
    let current: StorefrontPage<T> | null = this;
    while (current !== null) {
      for (const item of current.data) {
        yield item;
      }
      current = await current.getNextPage();
    }
  }

  /** Collects every item of every page into one array. */
  async toArray(): Promise<T[]> {
    const all: T[] = [];
    for await (const item of this) {
      all.push(item);
    }
    return all;
  }
}

/** Base class of every namespace of the buyer lane. */
export abstract class StorefrontNamespace {
  protected readonly transport: StorefrontTransport;
  /** Public id of the company that owns the shop, fixed at construction. */
  protected readonly company: string;

  constructor(transport: StorefrontTransport, company: string) {
    this.transport = transport;
    this.company = company;
  }
}
