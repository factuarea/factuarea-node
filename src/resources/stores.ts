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
  async create(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/stores", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** List connected stores */
  async index(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/stores", { "company": company });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Disconnect a store */
  async disconnect(company: string, store: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/stores/{store}", { "company": company, "store": store });
    return this._send<unknown>("DELETE", path, undefined, config);
  }

  /** Retrieve a connected store */
  async show(company: string, store: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/stores/{store}", { "company": company, "store": store });
    return this._get<unknown>(path, undefined, config);
  }

  /** Update store settings */
  async update(company: string, store: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/stores/{store}", { "company": company, "store": store });
    return this._send<unknown>("PATCH", path, body, config);
  }
}
