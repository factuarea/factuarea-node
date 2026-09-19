/**
 * Price of the buyer lane: what a configurable selection resolves to, and what
 * the shopper is actually charged.
 *
 * The two steps are separate on purpose. A configurable article (variants,
 * presentations, options) first RESOLVES to the concrete item the shop will
 * sell; only then does a price exist for it. Resolving in bulk is what lets a
 * listing page show one price per card without one request per card.
 */

import {
  StorefrontNamespace,
  type StorefrontRequestConfig,
} from "./transport.js";

export class StorefrontCatalogSelections extends StorefrontNamespace {
  /** Resolve a configurable selection into the concrete sellable item. */
  async resolve(body: unknown, config?: StorefrontRequestConfig): Promise<unknown> {
    return this.transport.request({
      method: "POST",
      path: this.transport.buildPath(
        "/companies/{company}/storefront/catalog-selections/resolve",
        { company: this.company },
      ),
      body,
      ...config,
    });
  }
}

export class StorefrontPrices extends StorefrontNamespace {
  /** Resolve the price of one selection. */
  async resolve(body: unknown, config?: StorefrontRequestConfig): Promise<unknown> {
    return this.transport.request({
      method: "POST",
      path: this.transport.buildPath("/companies/{company}/storefront/prices/resolve", {
        company: this.company,
      }),
      body,
      ...config,
    });
  }

  /** Resolve the price of several selections in one request (listing pages). */
  async bulkResolve(body: unknown, config?: StorefrontRequestConfig): Promise<unknown> {
    return this.transport.request({
      method: "POST",
      path: this.transport.buildPath("/companies/{company}/storefront/prices/bulk-resolve", {
        company: this.company,
      }),
      body,
      ...config,
    });
  }
}
