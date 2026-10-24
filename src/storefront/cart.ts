/**
 * The cart session of the buyer lane.
 *
 * A cart is a SESSION, not an order: it expires, it can be abandoned, and the
 * prices and availability it was built with can go stale while the shopper
 * thinks about it. That is what `revalidate` is for — call it before showing
 * the total and before checking out, and the server answers with what the cart
 * is worth NOW, including any line that can no longer be served.
 *
 * `update` is partial: send the lines you are changing, not the whole cart.
 */

import {
  StorefrontNamespace,
  type StorefrontRequestConfig,
} from "./transport.js";

export class StorefrontSessions extends StorefrontNamespace {
  /** Open a cart session. */
  async create(body?: unknown, config?: StorefrontRequestConfig): Promise<unknown> {
    return this.transport.request({
      method: "POST",
      path: this.transport.buildPath("/companies/{company}/storefront/sessions", {
        company: this.company,
      }),
      body,
      ...config,
    });
  }

  /** Read a cart session. */
  async show(session: string, config?: StorefrontRequestConfig): Promise<unknown> {
    return this.transport.request({
      method: "GET",
      path: this.transport.buildPath("/companies/{company}/storefront/sessions/{session}", {
        company: this.company,
        session,
      }),
      ...config,
    });
  }

  /** Update a cart session partially. */
  async update(
    session: string,
    body?: unknown,
    config?: StorefrontRequestConfig,
  ): Promise<unknown> {
    return this.transport.request({
      method: "PATCH",
      path: this.transport.buildPath("/companies/{company}/storefront/sessions/{session}", {
        company: this.company,
        session,
      }),
      body,
      ...config,
    });
  }

  /** Revalidate prices and availability before showing a total or checking out. */
  async revalidate(session: string, config?: StorefrontRequestConfig): Promise<unknown> {
    return this.transport.request({
      method: "POST",
      path: this.transport.buildPath(
        "/companies/{company}/storefront/sessions/{session}/revalidate",
        { company: this.company, session },
      ),
      ...config,
    });
  }
}
