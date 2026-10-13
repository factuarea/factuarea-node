// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class EmployeeSeatOfferRedemptionsResource extends BaseResource {
  /** Cancel an employee-seat offer redemption */
  async cancel(id: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/employee-seat-offer-redemptions/{id}/cancel", { "id": id });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Confirm an employee-seat offer redemption */
  async confirm(id: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/employee-seat-offer-redemptions/{id}/confirm", { "id": id });
    return this._send<unknown>("POST", path, body, config);
  }

  /** List an employee-seat offer redemption */
  async list(params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    return this._paginate<unknown>("/employee-seat-offer-redemptions", params, "cursor", config);
  }

  /** Prepare an employee-seat offer redemption */
  async prepare(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/employee-seat-offer-redemptions";
    return this._send<unknown>("POST", path, body, config);
  }

  /** Refresh the quote for an employee-seat offer redemption */
  async refreshQuote(id: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/employee-seat-offer-redemptions/{id}/quote", { "id": id });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Retrieve an employee-seat offer redemption */
  async show(id: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/employee-seat-offer-redemptions/{id}", { "id": id });
    return this._get<unknown>(path, undefined, config);
  }
}
