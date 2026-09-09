// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.0.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class WoocommerceStoresResource extends BaseResource {
  /** Test a WooCommerce store connection */
  async connectionTest(store: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/woocommerce/stores/{store}/connection-test", { "store": store });
    return this._send<unknown>("POST", path, undefined, config);
  }
}

export class WoocommerceResource extends BaseResource {
  readonly stores: WoocommerceStoresResource;

  constructor(client: HttpClient) {
    super(client);
    this.stores = new WoocommerceStoresResource(client);
  }
}
