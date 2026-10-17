/**
 * Availability of the buyer lane.
 *
 * Availability is a READ: it never holds anything. What a shopper sees here is
 * what the shop can serve right now — the balance of the warehouses the shop
 * sells from, minus the units other carts already hold. The units of a cart are
 * held when the cart is revalidated and when the order is created, not here, so
 * two shoppers can legitimately see the same last unit and only one of them
 * gets it.
 *
 * The bulk form answers a whole cart in one request, which is what a basket
 * page needs before showing a "check out" button it may have to take back.
 */

import {
  StorefrontNamespace,
  type StorefrontRequestConfig,
} from "./transport.js";

/** Query of the single availability read, as the frozen contract declares it. */
export interface StorefrontAvailabilityParams {
  /** Public id of the article. */
  product_id?: string;
  /** Public id of the variant, when the article has variants. */
  variant_id?: string;
}

export class StorefrontAvailability extends StorefrontNamespace {
  /** Availability of one article or variant. */
  async show(
    params?: StorefrontAvailabilityParams,
    config?: StorefrontRequestConfig,
  ): Promise<unknown> {
    return this.transport.request({
      method: "GET",
      path: this.transport.buildPath("/companies/{company}/storefront/availability", {
        company: this.company,
      }),
      query: { ...params },
      ...config,
    });
  }

  /** Availability of every line of a cart, in one request. */
  async bulkResolve(body: unknown, config?: StorefrontRequestConfig): Promise<unknown> {
    return this.transport.request({
      method: "POST",
      path: this.transport.buildPath(
        "/companies/{company}/storefront/availability/bulk-resolve",
        { company: this.company },
      ),
      body,
      ...config,
    });
  }
}
