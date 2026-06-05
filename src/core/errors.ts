/**
 * Typed error hierarchy mapped from the Factuarea error envelope:
 *
 *   { "error": { type, code, subcode?, message, param?, doc_url?, request_id } }
 *
 * Every error exposes `.code` and `.requestId` for support. The API key is
 * NEVER included in any error message, property or serialization.
 */

/** Machine-readable error category (the `error.type` enum). */
export type FactuareaErrorType =
  | "api_error"
  | "authentication_error"
  | "authorization_error"
  | "conflict_error"
  | "idempotency_error"
  | "invalid_request_error"
  | "not_found_error"
  | "permission_error"
  | "rate_limit_error"
  | "service_unavailable_error";

/** The parsed `error` object from the response body. */
export interface ErrorEnvelope {
  type?: FactuareaErrorType | string;
  code?: string;
  subcode?: string | null;
  message?: string;
  param?: string | null;
  doc_url?: string | null;
  request_id?: string | null;
}

export interface FactuareaErrorOptions {
  message: string;
  type?: FactuareaErrorType | string;
  code?: string;
  subcode?: string | null;
  param?: string | null;
  docUrl?: string | null;
  requestId?: string | null;
  status?: number;
  headers?: Headers;
  cause?: unknown;
}

/** Base class for every error thrown by the SDK. */
export class FactuareaError extends Error {
  /** HTTP status code, when the error came from a response. */
  readonly status?: number;
  /** `error.type` from the envelope. */
  readonly type?: FactuareaErrorType | string;
  /** Stable `error.code` (e.g. `parameter_invalid`). */
  readonly code?: string;
  /** `error.subcode` (present on some 409 conflicts). */
  readonly subcode?: string | null;
  /** Field that caused the error (`error.param`). */
  readonly param?: string | null;
  /** Link to the docs reference (`error.doc_url`). */
  readonly docUrl?: string | null;
  /** Request id for support (`error.request_id` / `X-Request-Id` header). */
  readonly requestId?: string | null;

  constructor(options: FactuareaErrorOptions) {
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

/** 400/422 — invalid request / validation. `.fields` maps param → messages. */
export class ValidationError extends FactuareaError {
  /** Per-field validation messages, keyed by field name. */
  readonly fields: Record<string, string[]>;

  constructor(options: FactuareaErrorOptions & { fields?: Record<string, string[]> }) {
    super(options);
    this.fields = options.fields ?? {};
  }
}

/** 401/403 authentication or permission failure. */
export class AuthenticationError extends FactuareaError {}

/** 404 resource not found. */
export class NotFoundError extends FactuareaError {}

/** 409 conflict (duplicate, idempotency mismatch, locked). */
export class ConflictError extends FactuareaError {}

/** 429 rate limited. `.retryAfter` is seconds to wait (from `Retry-After`). */
export class RateLimitError extends FactuareaError {
  /** Seconds to wait before retrying, parsed from `Retry-After`. */
  readonly retryAfter?: number;

  constructor(options: FactuareaErrorOptions & { retryAfter?: number }) {
    super(options);
    this.retryAfter = options.retryAfter;
  }
}

/** 5xx server-side error. */
export class ServerError extends FactuareaError {}

/** Network failure / timeout — never reached the API. */
export class ConnectionError extends FactuareaError {}

/** Webhook signature verification failed. */
export class WebhookSignatureError extends FactuareaError {
  constructor(message: string) {
    super({ message, type: "invalid_request_error", code: "webhook_signature_invalid" });
  }
}

/**
 * Parses `Retry-After` (seconds or an HTTP date) into seconds-from-now.
 * Returns `undefined` if absent or unparseable.
 */
export function parseRetryAfter(headers: Headers | undefined, now: number = Date.now()): number | undefined {
  const raw = headers?.get("retry-after");
  if (!raw) {
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

/**
 * Extracts per-field validation messages from the error envelope. The API
 * surfaces field errors via `error.param`; some validation responses also
 * carry a `fields`/`errors`/`details` map. This normalises both.
 */
function extractFields(envelope: ErrorEnvelope, body: unknown): Record<string, string[]> {
  const fields: Record<string, string[]> = {};

  // Map-style payloads: { error: { ..., fields: { name: ["msg"] } } } or top-level errors map.
  const candidate =
    (envelope as { fields?: unknown }).fields ??
    (isRecord(body) && isRecord(body.error) ? (body.error as { fields?: unknown }).fields : undefined) ??
    (isRecord(body) ? (body as { errors?: unknown }).errors : undefined);

  if (isRecord(candidate)) {
    for (const [key, value] of Object.entries(candidate)) {
      if (Array.isArray(value)) {
        fields[key] = value.map((v) => String(v));
      } else if (typeof value === "string") {
        fields[key] = [value];
      }
    }
  }

  // Single-field shape via `param` + `message`.
  if (Object.keys(fields).length === 0 && envelope.param && envelope.message) {
    fields[envelope.param] = [envelope.message];
  }

  return fields;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Maps an HTTP error response to the right typed error. `requestId` falls back
 * to the `X-Request-Id` header when the body omits it.
 */
export function errorFromResponse(
  status: number,
  body: unknown,
  headers: Headers,
): FactuareaError {
  const envelope: ErrorEnvelope =
    isRecord(body) && isRecord(body.error) ? (body.error as ErrorEnvelope) : {};

  const message =
    envelope.message ??
    (typeof body === "string" && body.length > 0 ? body : `Factuarea API error (HTTP ${status})`);

  const requestId = envelope.request_id ?? headers.get("x-request-id") ?? null;

  const base: FactuareaErrorOptions = {
    message,
    type: envelope.type,
    code: envelope.code,
    subcode: envelope.subcode ?? null,
    param: envelope.param ?? null,
    docUrl: envelope.doc_url ?? null,
    requestId,
    status,
    headers,
  };

  switch (status) {
    case 400:
    case 422:
      return new ValidationError({ ...base, fields: extractFields(envelope, body) });
    case 401:
    case 403:
      return new AuthenticationError(base);
    case 404:
      return new NotFoundError(base);
    case 409:
      return new ConflictError(base);
    case 429:
      return new RateLimitError({ ...base, retryAfter: parseRetryAfter(headers) });
    default:
      if (status >= 500) {
        return new ServerError(base);
      }
      if (envelope.type === "invalid_request_error") {
        return new ValidationError({ ...base, fields: extractFields(envelope, body) });
      }
      return new FactuareaError(base);
  }
}
