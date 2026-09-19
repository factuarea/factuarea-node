// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.0.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class PurchaseReorderSuggestionsResource extends BaseResource {
  /** Accept a reorder suggestion */
  async accept(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/purchase-reorder-suggestions/accept", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** List reorder suggestions */
  async list(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/purchase-reorder-suggestions", { "company": company });
    return this._get<unknown>(path, params, config);
  }
}
