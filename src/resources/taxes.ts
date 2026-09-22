// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.0.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class TaxesResource extends BaseResource {
  /** Calculate a tax over a base amount */
  async calculate(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/taxes/calculate", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Calculate totals for a set of lines */
  async calculateTotals(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/taxes/calculate-totals", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Check whether a tax is in use */
  async isInUse(company: string, tax: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/taxes/{tax}/is-in-use", { "company": company, "tax": tax });
    return this._get<unknown>(path, undefined, config);
  }

  /** Create a tax */
  async create(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/taxes", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** List all taxes */
  async list(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/taxes", { "company": company });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Delete a tax */
  async delete(company: string, tax: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/taxes/{tax}", { "company": company, "tax": tax });
    return this._send<unknown>("DELETE", path, undefined, config);
  }

  /** Retrieve a tax */
  async show(company: string, tax: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/taxes/{tax}", { "company": company, "tax": tax });
    return this._get<unknown>(path, undefined, config);
  }

  /** Update a tax */
  async update(company: string, tax: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/taxes/{tax}", { "company": company, "tax": tax });
    return this._send<unknown>("PATCH", path, body, config);
  }

  /** List active taxes */
  async active(company: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/taxes/active", { "company": company });
    return this._get<unknown>(path, undefined, config);
  }

  /** Get default taxes for a document type */
  async defaults(company: string, docType: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/taxes/defaults/{docType}", { "company": company, "docType": docType });
    return this._get<unknown>(path, undefined, config);
  }

  /** Get tax stats */
  async stats(company: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/taxes/stats", { "company": company });
    return this._get<unknown>(path, undefined, config);
  }

  /** List taxes filtered by type */
  async byType(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/taxes/by-type", { "company": company });
    return this._get<unknown>(path, params, config);
  }

  /** List taxes applicable to purchases */
  async forPurchases(company: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/taxes/for-purchases", { "company": company });
    return this._get<unknown>(path, undefined, config);
  }

  /** List taxes applicable to sales */
  async forSales(company: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/taxes/for-sales", { "company": company });
    return this._get<unknown>(path, undefined, config);
  }

  /** Mark a tax as the default for its type */
  async setDefault(company: string, tax: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/taxes/{tax}/set-default", { "company": company, "tax": tax });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Set tax default for a document type */
  async setDefaultForDocument(company: string, tax: string, docType: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/taxes/{tax}/set-default/{docType}", { "company": company, "tax": tax, "docType": docType });
    return this._send<unknown>("PATCH", path, undefined, config);
  }

  /** Toggle tax active state */
  async toggle(company: string, tax: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/taxes/{tax}/toggle", { "company": company, "tax": tax });
    return this._send<unknown>("POST", path, undefined, config);
  }
}
