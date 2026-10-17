/**
 * Typed errors of the buyer lane, mapped from the SAME public error envelope
 * the rest of the API uses:
 *
 *   { "error": { type, code, subcode?, message, param?, doc_url?, request_id } }
 *
 * The web the agency builds has to branch on `code`, never on `message`: the
 * message is human text served in Spanish and free to change; `code` and
 * `subcode` are stable and invariant across locales and API versions. That is
 * why every error here exposes `.code`, `.subcode` and `.requestId` as first
 * class properties.
 *
 * The publishable credential is NEVER included in any message, property or
 * serialization of these errors — the same rule the server SDK follows for the
 * integrator key.
 *
 * This module is part of the browser entry point and imports nothing: no
 * dependency, no Node builtin (design.md D7).
 */

/** Machine-readable category (`error.type`), as the frozen contract enumerates it. */
export type StorefrontErrorType =
  | "api_error"
  | "authentication_error"
  | "authorization_error"
  | "conflict_error"
  | "idempotency_error"
  | "invalid_request_error"
  | "not_found_error"
  | "payment_required_error"
  | "permission_error"
  | "rate_limit_error"
  | "service_unavailable_error";

/** The parsed `error` object of the response body. */
export interface StorefrontErrorEnvelope {
  type?: StorefrontErrorType | string;
  code?: string;
  subcode?: string | null;
  message?: string;
  param?: string | null;
  doc_url?: string | null;
  request_id?: string | null;
}

export interface StorefrontErrorOptions {
  message: string;
  type?: StorefrontErrorType | string;
  code?: string;
  subcode?: string | null;
  param?: string | null;
  docUrl?: string | null;
  requestId?: string | null;
  status?: number;
  cause?: unknown;
}

/** Base class of every error the browser SDK throws. */
export class StorefrontError extends Error {
  /** HTTP status, when the error came from a response. */
  readonly status?: number;
  /** `error.type` of the envelope. */
  readonly type?: StorefrontErrorType | string;
  /** Stable `error.code` — branch on this one. */
  readonly code?: string;
  /** `error.subcode`, present when `code` alone would be ambiguous. */
  readonly subcode?: string | null;
  /** Field that caused the error (`error.param`). */
  readonly param?: string | null;
  /** Reference page for the code (`error.doc_url`). */
  readonly docUrl?: string | null;
  /** Request id for support (`error.request_id` or the `X-Request-Id` header). */
  readonly requestId?: string | null;

  constructor(options: StorefrontErrorOptions) {
    super(options.message, options.cause === undefined ? undefined : { cause: options.cause });
    this.name = new.target.name;
    this.status = options.status;
    this.type = options.type;
    this.code = options.code;
    this.subcode = options.subcode ?? null;
    this.param = options.param ?? null;
    this.docUrl = options.docUrl ?? null;
    this.requestId = options.requestId ?? null;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * The credential handed to the client is not a publishable storefront key.
 *
 * Thrown during CONSTRUCTION, before any request exists: a server key pasted
 * into a web page must fail while the developer is looking at the screen.
 */
export class StorefrontCredentialError extends StorefrontError {
  constructor(options: StorefrontErrorOptions) {
    super({ type: "authentication_error", ...options });
  }
}

/** 400 / 422 — the request cannot be processed as sent. */
export class StorefrontValidationError extends StorefrontError {
  /** Per-field messages, keyed by field name. */
  readonly fields: Record<string, string[]>;

  constructor(options: StorefrontErrorOptions & { fields?: Record<string, string[]> }) {
    super(options);
    this.fields = options.fields ?? {};
  }
}

/**
 * 401 / 403 — the credential is missing, malformed, revoked, expired, or the
 * request came from an origin the credential does not declare.
 */
export class StorefrontAuthenticationError extends StorefrontError {}

/** 404 — the shop, the article, the cart or the order does not exist. */
export class StorefrontNotFoundError extends StorefrontError {}

/** 409 — conflict (an idempotency key reused with a different body, …). */
export class StorefrontConflictError extends StorefrontError {}

/** 429 — the shop's budget is spent. `.retryAfter` is seconds to wait. */
export class StorefrontRateLimitError extends StorefrontError {
  /** Seconds to wait before retrying, read from `Retry-After`. */
  readonly retryAfter?: number;

  constructor(options: StorefrontErrorOptions & { retryAfter?: number }) {
    super(options);
    this.retryAfter = options.retryAfter;
  }
}

/** 5xx — the request reached the API and the API failed. */
export class StorefrontServerError extends StorefrontError {}

/** Network failure, timeout or a blocked cross-origin request: never arrived. */
export class StorefrontConnectionError extends StorefrontError {}

/**
 * Parses `Retry-After` (seconds or an HTTP date) into seconds from now.
 *
 * `Retry-After` is one of the five response headers the buyer lane exposes to
 * the browser, so this value is readable from a page; the rest of the response
 * headers are not, by design.
 */
export function parseRetryAfter(
  headers: Headers | undefined,
  now: number = Date.now(),
): number | undefined {
  const raw = headers?.get("retry-after");
  if (raw === null || raw === undefined || raw === "") {
    return undefined;
  }
  const asNumber = Number(raw);
  if (Number.isFinite(asNumber)) {
    return Math.max(0, asNumber);
  }
  const asDate = Date.parse(raw);
  if (Number.isFinite(asDate)) {
    return Math.max(0, Math.round((asDate - now) / 1000));
  }
  return undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Normalises the per-field messages a validation response may carry. */
function extractFields(envelope: StorefrontErrorEnvelope, body: unknown): Record<string, string[]> {
  const fields: Record<string, string[]> = {};

  const candidate =
    (envelope as { fields?: unknown }).fields ??
    (isRecord(body) && isRecord(body.error)
      ? (body.error as { fields?: unknown }).fields
      : undefined) ??
    (isRecord(body) ? (body as { errors?: unknown }).errors : undefined);

  if (isRecord(candidate)) {
    for (const [key, value] of Object.entries(candidate)) {
      if (Array.isArray(value)) {
        fields[key] = value.map((entry) => String(entry));
      } else if (typeof value === "string") {
        fields[key] = [value];
      }
    }
  }

  if (Object.keys(fields).length === 0 && envelope.param && envelope.message) {
    fields[envelope.param] = [envelope.message];
  }

  return fields;
}

/**
 * Maps an HTTP error response to its typed error. `requestId` falls back to the
 * `X-Request-Id` header when the body omits it.
 */
export function storefrontErrorFromResponse(
  status: number,
  body: unknown,
  headers: Headers,
): StorefrontError {
  const envelope: StorefrontErrorEnvelope =
    isRecord(body) && isRecord(body.error) ? (body.error as StorefrontErrorEnvelope) : {};

  const message =
    envelope.message ??
    (typeof body === "string" && body.length > 0
      ? body
      : `Factuarea storefront: the API returned HTTP ${status}.`);

  const base: StorefrontErrorOptions = {
    message,
    type: envelope.type,
    code: envelope.code,
    subcode: envelope.subcode ?? null,
    param: envelope.param ?? null,
    docUrl: envelope.doc_url ?? null,
    requestId: envelope.request_id ?? headers.get("x-request-id") ?? null,
    status,
  };

  switch (status) {
    case 400:
    case 422:
      return new StorefrontValidationError({ ...base, fields: extractFields(envelope, body) });
    case 401:
    case 403:
      return new StorefrontAuthenticationError(base);
    case 404:
      return new StorefrontNotFoundError(base);
    case 409:
      return new StorefrontConflictError(base);
    case 429:
      return new StorefrontRateLimitError({ ...base, retryAfter: parseRetryAfter(headers) });
    default:
      if (status >= 500) {
        return new StorefrontServerError(base);
      }
      if (envelope.type === "invalid_request_error") {
        return new StorefrontValidationError({ ...base, fields: extractFields(envelope, body) });
      }
      return new StorefrontError(base);
  }
}
