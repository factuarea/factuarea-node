/**
 * @factuarea/sdk — Official TypeScript SDK for the Factuarea API.
 *
 * Public surface (protected by SemVer). The generated layer (`./generated`)
 * is an implementation detail; only the symbols re-exported here are stable.
 */

export { Factuarea } from "./client.js";

export type { FactuareaConfig } from "./core/http-client.js";
export type {
  ApiResponse,
  BinaryResponse,
  HttpMethod,
  RequestOptions,
} from "./core/http-client.js";

export type { RequestConfig } from "./core/resource.js";

export { Page } from "./core/pagination.js";
export type { PaginatedList, CursorParam } from "./core/pagination.js";

export type { Environment } from "./core/auth.js";

export { SDK_VERSION, DEFAULT_FACTUAREA_VERSION } from "./core/version.js";

// Error hierarchy
export {
  FactuareaError,
  ValidationError,
  AuthenticationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  ServerError,
  ConnectionError,
  WebhookSignatureError,
} from "./core/errors.js";
export type { FactuareaErrorType, ErrorEnvelope } from "./core/errors.js";

// Webhooks
export { verifyWebhook, Webhooks, SIGNATURE_HEADER, DEFAULT_TOLERANCE_SECONDS } from "./core/webhooks.js";
export type { VerifyOptions } from "./core/webhooks.js";

// Resource classes (for typing references / advanced composition)
export type { ResourceNamespaces } from "./resources/index.js";

// Generated domain types. The full surface (1400+ types) lives in
// `./generated/types.gen`; re-export the namespace so consumers can pull any
// request/response shape they need:  `import type { Invoice } from "@factuarea/sdk"`.
export type {
  Account,
  Client,
  Event,
  EventData,
  Invoice,
  PaginatedList as PaginatedListSchema,
  Product,
  Proforma,
  Quote,
  Series,
  Supplier,
  Tax,
  WebhookDelivery,
} from "./generated/types.gen.js";
