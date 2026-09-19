// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.0.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class StockAvailabilityCommitmentsResource extends BaseResource {
  /** List the commitments over an article */
  async list(company: string, product: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/stock-availability/{product}/commitments", { "company": company, "product": product });
    return this._get<unknown>(path, undefined, config);
  }
}

export class StockAvailabilityResource extends BaseResource {
  readonly commitments: StockAvailabilityCommitmentsResource;

  constructor(client: HttpClient) {
    super(client);
    this.commitments = new StockAvailabilityCommitmentsResource(client);
  }

  /** Retrieve stock availability in batch */
  async batch(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/stock-availability/batch", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** List stock availability */
  async list(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/stock-availability", { "company": company });
    return this._paginate<unknown>(path, params, "starting_after");
  }

  /** Retrieve the stock availability of an article */
  async show(company: string, product: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/stock-availability/{product}", { "company": company, "product": product });
    return this._get<unknown>(path, params, config);
  }
}
