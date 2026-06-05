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
  async calculate(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/taxes/calculate";
    return this._send<unknown>("POST", path, body, config);
  }

  /** Calculate totals for a set of lines */
  async calculateTotals(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/taxes/calculate-totals";
    return this._send<unknown>("POST", path, body, config);
  }

  /** Check whether a tax is in use */
  async isInUse(tax: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/taxes/{tax}/is-in-use", { "tax": tax });
    return this._get<unknown>(path, undefined, config);
  }

  /** Create a tax */
  async create(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/taxes";
    return this._send<unknown>("POST", path, body, config);
  }

  /** List all taxes */
  async list(params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    return this._paginate<unknown>("/taxes", params, "starting_after");
  }

  /** Delete a tax */
  async delete(tax: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/taxes/{tax}", { "tax": tax });
    return this._send<unknown>("DELETE", path, undefined, config);
  }

  /** Retrieve a tax */
  async show(tax: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/taxes/{tax}", { "tax": tax });
    return this._get<unknown>(path, undefined, config);
  }

  /** Update a tax */
  async update(tax: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/taxes/{tax}", { "tax": tax });
    return this._send<unknown>("PUT", path, body, config);
  }

  /** List active taxes */
  async active(config?: RequestConfig): Promise<unknown> {
    const path = "/taxes/active";
    return this._get<unknown>(path, undefined, config);
  }

  /** Get default taxes for a document type */
  async defaults(docType: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/taxes/defaults/{docType}", { "docType": docType });
    return this._get<unknown>(path, undefined, config);
  }

  /** Get tax stats */
  async stats(config?: RequestConfig): Promise<unknown> {
    const path = "/taxes/stats";
    return this._get<unknown>(path, undefined, config);
  }

  /** List taxes filtered by type */
  async byType(params?: Record<string, unknown>, config?: RequestConfig): Promise<unknown> {
    const path = "/taxes/by-type";
    return this._get<unknown>(path, params, config);
  }

  /** List taxes applicable to purchases */
  async forPurchases(config?: RequestConfig): Promise<unknown> {
    const path = "/taxes/for-purchases";
    return this._get<unknown>(path, undefined, config);
  }

  /** List taxes applicable to sales */
  async forSales(config?: RequestConfig): Promise<unknown> {
    const path = "/taxes/for-sales";
    return this._get<unknown>(path, undefined, config);
  }

  /** Mark a tax as the default for its type */
  async setDefault(tax: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/taxes/{tax}/set-default", { "tax": tax });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Set tax default for a document type */
  async setDefaultForDocument(tax: string, docType: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/taxes/{tax}/set-default/{docType}", { "tax": tax, "docType": docType });
    return this._send<unknown>("PUT", path, undefined, config);
  }

  /** Toggle tax active state */
  async toggle(tax: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/taxes/{tax}/toggle", { "tax": tax });
    return this._send<unknown>("POST", path, undefined, config);
  }
}
