// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.0.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class StockReservationsResource extends BaseResource {
  /** Create a stock reservation */
  async create(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/stock-reservations", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** List all stock reservations */
  async list(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/stock-reservations", { "company": company });
    return this._paginate<unknown>(path, params, "starting_after");
  }

  /** Find the stock reservations of a holder */
  async findByHolder(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/stock-reservations/find-by-holder", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** List stock reservation statuses */
  async statuses(company: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/stock-reservations/statuses", { "company": company });
    return this._get<unknown>(path, undefined, config);
  }

  /** Release a stock reservation */
  async release(company: string, stockReservation: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/stock-reservations/{stock_reservation}/release", { "company": company, "stock_reservation": stockReservation });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Release the stock reservations of a holder */
  async releaseByHolder(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/stock-reservations/release-by-holder", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Retrieve a stock reservation */
  async show(company: string, stockReservation: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/stock-reservations/{stock_reservation}", { "company": company, "stock_reservation": stockReservation });
    return this._get<unknown>(path, undefined, config);
  }
}
