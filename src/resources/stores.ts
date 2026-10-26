// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";
import type { PublicApiV1StoresCreateData, PublicApiV1StoresCreateResponses, PublicApiV1StoresShowResponses, PublicApiV1StoresUpdateData, PublicApiV1StoresUpdateResponses } from "../generated/types.gen.js";


export class StoresResource extends BaseResource {
  /** Connect a store */
  async create(company: string, body?: PublicApiV1StoresCreateData["body"], config?: RequestConfig): Promise<PublicApiV1StoresCreateResponses[201]> {
    const path = this.buildPath("/companies/{company}/stores", { "company": company });
    return this._send<PublicApiV1StoresCreateResponses[201]>("POST", path, body, config);
  }

  /** List connected stores */
  async index(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/stores", { "company": company });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Disconnect a store */
  async disconnect(company: string, store: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/stores/{store}", { "company": company, "store": store });
    return this._send<unknown>("DELETE", path, undefined, config, { idempotent: true });
  }

  /** Retrieve a connected store */
  async show(company: string, store: string, config?: RequestConfig): Promise<PublicApiV1StoresShowResponses[200]> {
    const path = this.buildPath("/companies/{company}/stores/{store}", { "company": company, "store": store });
    return this._get<PublicApiV1StoresShowResponses[200]>(path, undefined, config);
  }

  /** Update store settings */
  async update(company: string, store: string, body?: PublicApiV1StoresUpdateData["body"], config?: RequestConfig): Promise<PublicApiV1StoresUpdateResponses[200]> {
    const path = this.buildPath("/companies/{company}/stores/{store}", { "company": company, "store": store });
    return this._send<PublicApiV1StoresUpdateResponses[200]>("PATCH", path, body, config);
  }
}
