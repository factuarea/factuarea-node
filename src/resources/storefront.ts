// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.0.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class StorefrontAvailabilityResource extends BaseResource {
  /** Resolve storefront availability in bulk */
  async bulkResolve(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/storefront/availability/bulk-resolve", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Retrieve storefront availability */
  async show(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/storefront/availability", { "company": company });
    return this._get<unknown>(path, params, config);
  }
}

export class StorefrontPricesResource extends BaseResource {
  /** Resolve storefront prices in bulk */
  async bulkResolve(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/storefront/prices/bulk-resolve", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Resolve a storefront price */
  async resolve(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/storefront/prices/resolve", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }
}

export class StorefrontOrdersBuyerIdentityResource extends BaseResource {
  /** Update the buyer fiscal identity of a storefront order */
  async update(company: string, order: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/storefront/orders/{order}/buyer-identity", { "company": company, "order": order });
    return this._send<unknown>("PATCH", path, body, config);
  }
}

export class StorefrontOrdersResource extends BaseResource {
  readonly buyerIdentity: StorefrontOrdersBuyerIdentityResource;

  constructor(client: HttpClient) {
    super(client);
    this.buyerIdentity = new StorefrontOrdersBuyerIdentityResource(client);
  }

  /** Confirm the payment of a storefront order */
  async confirmPayment(company: string, order: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/storefront/orders/{order}/confirm-payment", { "company": company, "order": order });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Create a storefront order */
  async create(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/storefront/orders", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Retrieve a storefront order */
  async show(company: string, order: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/storefront/orders/{order}", { "company": company, "order": order });
    return this._get<unknown>(path, undefined, config);
  }

  /** Retrieve the shipment tracking of a storefront order */
  async tracking(company: string, order: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/storefront/orders/{order}/tracking", { "company": company, "order": order });
    return this._get<unknown>(path, undefined, config);
  }

  /** Start the checkout of a storefront order */
  async checkout(company: string, order: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/storefront/orders/{order}/checkout", { "company": company, "order": order });
    return this._send<unknown>("POST", path, body, config);
  }
}

export class StorefrontSessionsResource extends BaseResource {
  /** Create a cart session */
  async create(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/storefront/sessions", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Revalidate a cart session */
  async revalidate(company: string, session: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/storefront/sessions/{session}/revalidate", { "company": company, "session": session });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Retrieve a cart session */
  async show(company: string, session: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/storefront/sessions/{session}", { "company": company, "session": session });
    return this._get<unknown>(path, undefined, config);
  }

  /** Update a cart session */
  async update(company: string, session: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/storefront/sessions/{session}", { "company": company, "session": session });
    return this._send<unknown>("PATCH", path, body, config);
  }
}

export class StorefrontCategoriesResource extends BaseResource {
  /** List storefront categories */
  async list(company: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/storefront/categories", { "company": company });
    return this._get<unknown>(path, undefined, config);
  }
}

export class StorefrontProductsImagesResource extends BaseResource {
  /** List the images of a storefront product */
  async list(company: string, product: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/storefront/products/{product}/images", { "company": company, "product": product });
    return this._get<unknown>(path, undefined, config);
  }
}

export class StorefrontProductsOptionsResource extends BaseResource {
  /** List the options of a storefront product */
  async list(company: string, product: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/storefront/products/{product}/options", { "company": company, "product": product });
    return this._get<unknown>(path, undefined, config);
  }
}

export class StorefrontProductsPresentationsResource extends BaseResource {
  /** List the presentations of a storefront product */
  async list(company: string, product: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/storefront/products/{product}/presentations", { "company": company, "product": product });
    return this._get<unknown>(path, undefined, config);
  }
}

export class StorefrontProductsVariantsResource extends BaseResource {
  /** List the variants of a storefront product */
  async list(company: string, product: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/storefront/products/{product}/variants", { "company": company, "product": product });
    return this._get<unknown>(path, undefined, config);
  }
}

export class StorefrontProductsResource extends BaseResource {
  readonly images: StorefrontProductsImagesResource;
  readonly options: StorefrontProductsOptionsResource;
  readonly presentations: StorefrontProductsPresentationsResource;
  readonly variants: StorefrontProductsVariantsResource;

  constructor(client: HttpClient) {
    super(client);
    this.images = new StorefrontProductsImagesResource(client);
    this.options = new StorefrontProductsOptionsResource(client);
    this.presentations = new StorefrontProductsPresentationsResource(client);
    this.variants = new StorefrontProductsVariantsResource(client);
  }

  /** List storefront products */
  async list(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/storefront/products", { "company": company });
    return this._paginate<unknown>(path, params, "starting_after");
  }

  /** Search storefront products */
  async search(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/storefront/products/search", { "company": company });
    return this._get<unknown>(path, params, config);
  }

  /** Retrieve a storefront product */
  async show(company: string, product: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/storefront/products/{product}", { "company": company, "product": product });
    return this._get<unknown>(path, undefined, config);
  }
}

export class StorefrontCatalogSelectionsResource extends BaseResource {
  /** Resolve a storefront catalog selection */
  async resolve(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/storefront/catalog-selections/resolve", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }
}

export class StorefrontResource extends BaseResource {
  readonly availability: StorefrontAvailabilityResource;
  readonly prices: StorefrontPricesResource;
  readonly orders: StorefrontOrdersResource;
  readonly sessions: StorefrontSessionsResource;
  readonly categories: StorefrontCategoriesResource;
  readonly products: StorefrontProductsResource;
  readonly catalogSelections: StorefrontCatalogSelectionsResource;

  constructor(client: HttpClient) {
    super(client);
    this.availability = new StorefrontAvailabilityResource(client);
    this.prices = new StorefrontPricesResource(client);
    this.orders = new StorefrontOrdersResource(client);
    this.sessions = new StorefrontSessionsResource(client);
    this.categories = new StorefrontCategoriesResource(client);
    this.products = new StorefrontProductsResource(client);
    this.catalogSelections = new StorefrontCatalogSelectionsResource(client);
  }
}
