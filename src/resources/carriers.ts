// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.0.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class CarriersResource extends BaseResource {
  /** Create a carrier */
  async create(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/carriers", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** List all carriers */
  async list(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/carriers", { "company": company });
    return this._paginate<unknown>(path, params, "starting_after");
  }

  /** Delete a carrier */
  async delete(company: string, carrier: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/carriers/{carrier}", { "company": company, "carrier": carrier });
    return this._send<unknown>("DELETE", path, undefined, config);
  }

  /** Retrieve a carrier */
  async show(company: string, carrier: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/carriers/{carrier}", { "company": company, "carrier": carrier });
    return this._get<unknown>(path, undefined, config);
  }

  /** Update a carrier */
  async update(company: string, carrier: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/carriers/{carrier}", { "company": company, "carrier": carrier });
    return this._send<unknown>("PATCH", path, body, config);
  }

  /** Find a carrier by code */
  async findByCode(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/carriers/find-by-code", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }
}
