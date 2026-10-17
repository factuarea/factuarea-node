/**
 * `@factuarea/sdk/storefront` — the browser SDK of the anonymous shopper lane.
 *
 * ```ts
 * import { FactuareaStorefront } from "@factuarea/sdk/storefront";
 *
 * const shop = new FactuareaStorefront({
 *   publishableKey: "sf_pk_…",   // publishable: it ships inside your bundle
 *   company: "01931b3e-…",       // the shop's public company id
 * });
 *
 * const page = await shop.products.list({ limit: 24 });
 * ```
 *
 * ## What this entry point is, and what it deliberately is not
 *
 * It publishes the 23 operations of the shopper lane and NOTHING else. The
 * merchant's own surface — issuing, listing, rotating and revoking storefront
 * keys, and the other 631 operations of the API — lives behind the integrator
 * credential and belongs to the server entry point (`@factuarea/sdk`). The two
 * do not import each other: a bundle that imports this file does not pull the
 * server client, and a server that imports the server client does not pull this
 * one.
 *
 * ## The credential
 *
 * The publishable key is NOT a secret. It travels in the JavaScript the shopper
 * downloads, it only reaches this lane, it is scoped to the origins the merchant
 * declares, it is revocable, and rotating it has no grace window by design. An
 * integrator key (`fact_live_…` / `fact_test_…`) is rejected when the client is
 * CONSTRUCTED, with no request emitted — see `./credential.ts`.
 */

import { StorefrontAvailability } from "./availability.js";
import { StorefrontCategories, StorefrontProducts } from "./catalog.js";
import { assertPublishableStorefrontKey, assertStorefrontCompany } from "./credential.js";
import { StorefrontOrders } from "./orders.js";
import { StorefrontCatalogSelections, StorefrontPrices } from "./pricing.js";
import { StorefrontSessions } from "./cart.js";
import { StorefrontTransport, type StorefrontTransportOptions } from "./transport.js";

/** Configuration of the browser client. */
export interface FactuareaStorefrontConfig extends StorefrontTransportOptions {
  /**
   * Public id of the company that owns the shop. Every path of the lane carries
   * it, so it is fixed once here instead of on every call.
   */
  company: string;
}

/** The browser client of the anonymous shopper lane. */
export class FactuareaStorefront {
  /** Public id of the company this client talks to. */
  readonly company: string;

  /** The underlying browser transport (advanced / escape hatch). */
  readonly transport: StorefrontTransport;

  /** Catalogue: listing, search, detail, images, options, presentations, variants. */
  readonly products: StorefrontProducts;
  /** Categories the shop publishes. */
  readonly categories: StorefrontCategories;
  /** Resolution of a configurable selection. */
  readonly catalogSelections: StorefrontCatalogSelections;
  /** Price of one selection, or of many at once. */
  readonly prices: StorefrontPrices;
  /** Availability of one item, or of a whole cart. */
  readonly availability: StorefrontAvailability;
  /** Cart sessions: open, read, update partially, revalidate. */
  readonly sessions: StorefrontSessions;
  /** Orders: create, read, track, check out, confirm the charge, buyer identity. */
  readonly orders: StorefrontOrders;

  constructor(config: FactuareaStorefrontConfig) {
    // The guard is the FIRST thing that runs: a server credential leaked into a
    // page must fail here, in development, and not on a shopper's first request.
    const publishableKey = assertPublishableStorefrontKey(config.publishableKey);
    this.company = assertStorefrontCompany(config.company);
    this.transport = new StorefrontTransport({ ...config, publishableKey });

    this.products = new StorefrontProducts(this.transport, this.company);
    this.categories = new StorefrontCategories(this.transport, this.company);
    this.catalogSelections = new StorefrontCatalogSelections(this.transport, this.company);
    this.prices = new StorefrontPrices(this.transport, this.company);
    this.availability = new StorefrontAvailability(this.transport, this.company);
    this.sessions = new StorefrontSessions(this.transport, this.company);
    this.orders = new StorefrontOrders(this.transport, this.company);
  }
}

// Credential model.
export {
  assertPublishableStorefrontKey,
  assertStorefrontCompany,
  INTEGRATOR_KEY_PREFIXES,
  PUBLISHABLE_KEY_PATTERN,
  PUBLISHABLE_KEY_PREFIX,
  PUBLISHABLE_KEY_SECRET_BODY_LENGTH,
} from "./credential.js";

// Typed errors: branch on `.code`, never on `.message`.
export {
  StorefrontAuthenticationError,
  StorefrontConflictError,
  StorefrontConnectionError,
  StorefrontCredentialError,
  StorefrontError,
  StorefrontNotFoundError,
  StorefrontRateLimitError,
  StorefrontServerError,
  StorefrontValidationError,
  parseRetryAfter,
} from "./errors.js";
export type { StorefrontErrorEnvelope, StorefrontErrorType } from "./errors.js";

// Idempotency of the mutating calls.
export { idempotencySource, newIdempotencyKey } from "./idempotency.js";
export type { IdempotencySource, WebCryptoLike } from "./idempotency.js";

// Transport and pagination.
export {
  CREDENTIAL_HEADER,
  STOREFRONT_ALLOWED_REQUEST_HEADERS,
  StorefrontNamespace,
  StorefrontPage,
  StorefrontTransport,
} from "./transport.js";
export type {
  StorefrontApiResponse,
  StorefrontHttpMethod,
  StorefrontPaginatedList,
  StorefrontQuery,
  StorefrontRequest,
  StorefrontRequestConfig,
  StorefrontTransportOptions,
} from "./transport.js";

// Namespaces and their parameter shapes, for typing references.
export { StorefrontAvailability } from "./availability.js";
export type { StorefrontAvailabilityParams } from "./availability.js";
export { StorefrontSessions } from "./cart.js";
export {
  StorefrontCategories,
  StorefrontProductImages,
  StorefrontProductOptions,
  StorefrontProductPresentations,
  StorefrontProducts,
  StorefrontProductVariants,
} from "./catalog.js";
export type {
  StorefrontProductListParams,
  StorefrontProductSearchParams,
} from "./catalog.js";
export {
  confirmStorefrontOrderPayment,
  startStorefrontOrderCheckout,
} from "./checkout.js";
export { StorefrontOrderBuyerIdentity, StorefrontOrders } from "./orders.js";
export { StorefrontCatalogSelections, StorefrontPrices } from "./pricing.js";
