// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.0.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class StoresResource extends BaseResource {
  /** Connect a store */
  async create(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/stores";
    return this._send<unknown>("POST", path, body, config);
  }

  /** List connected stores */
  async index(params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    return this._paginate<unknown>("/stores", params, "starting_after", config);
  }

  /** Disconnect a store */
  async disconnect(store: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/stores/{store}", { "store": store });
    return this._send<unknown>("DELETE", path, undefined, config);
  }

  /** Retrieve a connected store */
  async show(store: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/stores/{store}", { "store": store });
    return this._get<unknown>(path, undefined, config);
  }

  /** Update store settings */
  async update(store: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/stores/{store}", { "store": store });
    return this._send<unknown>("PUT", path, body, config);
  }
}
