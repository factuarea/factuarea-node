/**
 * The order of the buyer lane: creation, reading, tracking and the fiscal
 * identity of the buyer.
 *
 * The buyer identity is a separate step on purpose. A shopper can buy with just
 * an email, and only later — usually because they want a full invoice — supply
 * the tax id and address. `buyerIdentity.update` completes it without rebuilding
 * the order; asking for it up front would cost conversions on every sale that
 * never needed it.
 *
 * `tracking` is the shipment's, and it answers with whatever the last
 * fulfilment notice carried: after a delivery the tracking link may legitimately
 * be gone. Render its absence as absence, never as an error.
 */

import {
  confirmStorefrontOrderPayment,
  startStorefrontOrderCheckout,
} from "./checkout.js";
import {
  StorefrontNamespace,
  type StorefrontRequestConfig,
  type StorefrontTransport,
} from "./transport.js";

export class StorefrontOrderBuyerIdentity extends StorefrontNamespace {
  /** Complete or correct the fiscal identity of the buyer. */
  async update(order: string, body?: unknown, config?: StorefrontRequestConfig): Promise<unknown> {
    return this.transport.request({
      method: "PATCH",
      path: this.transport.buildPath(
        "/companies/{company}/storefront/orders/{order}/buyer-identity",
        { company: this.company, order },
      ),
      body,
      ...config,
    });
  }
}

export class StorefrontOrders extends StorefrontNamespace {
  readonly buyerIdentity: StorefrontOrderBuyerIdentity;

  constructor(transport: StorefrontTransport, company: string) {
    super(transport, company);
    this.buyerIdentity = new StorefrontOrderBuyerIdentity(transport, company);
  }

  /** Turn a cart session into an order. */
  async create(body: unknown, config?: StorefrontRequestConfig): Promise<unknown> {
    return this.transport.request({
      method: "POST",
      path: this.transport.buildPath("/companies/{company}/storefront/orders", {
        company: this.company,
      }),
      body,
      ...config,
    });
  }

  /** Read an order. */
  async show(order: string, config?: StorefrontRequestConfig): Promise<unknown> {
    return this.transport.request({
      method: "GET",
      path: this.transport.buildPath("/companies/{company}/storefront/orders/{order}", {
        company: this.company,
        order,
      }),
      ...config,
    });
  }

  /** Shipment tracking of an order. */
  async tracking(order: string, config?: StorefrontRequestConfig): Promise<unknown> {
    return this.transport.request({
      method: "GET",
      path: this.transport.buildPath("/companies/{company}/storefront/orders/{order}/tracking", {
        company: this.company,
        order,
      }),
      ...config,
    });
  }

  /** Start the checkout of an order. Implemented in `./checkout.ts`. */
  async checkout(order: string, body?: unknown, config?: StorefrontRequestConfig): Promise<unknown> {
    return startStorefrontOrderCheckout(this.transport, this.company, order, body, config);
  }

  /** Confirm the charge of an order. Irreversible. Implemented in `./checkout.ts`. */
  async confirmPayment(
    order: string,
    body: unknown,
    config?: StorefrontRequestConfig,
  ): Promise<unknown> {
    return confirmStorefrontOrderPayment(this.transport, this.company, order, body, config);
  }
}
