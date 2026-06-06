// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.0.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class SuppliersResource extends BaseResource {
  /** Delete multiple suppliers in bulk */
  async bulkDelete(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/suppliers/bulk-delete";
    return this._send<unknown>("POST", path, body, config);
  }

  /** Create a supplier */
  async create(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/suppliers";
    return this._send<unknown>("POST", path, body, config);
  }

  /** List all suppliers */
  async list(params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    return this._paginate<unknown>("/suppliers", params, "starting_after");
  }

  /** Delete a supplier */
  async delete(supplier: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/suppliers/{supplier}", { "supplier": supplier });
    return this._send<unknown>("DELETE", path, undefined, config);
  }

  /** Retrieve a supplier */
  async show(supplier: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/suppliers/{supplier}", { "supplier": supplier });
    return this._get<unknown>(path, undefined, config);
  }

  /** Update a supplier */
  async update(supplier: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/suppliers/{supplier}", { "supplier": supplier });
    return this._send<unknown>("PUT", path, body, config);
  }

  /** Find a supplier by tax ID */
  async findByTaxId(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/suppliers/find-by-tax-id";
    return this._send<unknown>("POST", path, body, config);
  }

  /** List supplier activity timeline */
  async activities(supplier: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/suppliers/{supplier}/activities", { "supplier": supplier });
    return this._get<unknown>(path, undefined, config);
  }

  /** Get supplier stats */
  async stats(config?: RequestConfig): Promise<unknown> {
    const path = "/suppliers/stats";
    return this._get<unknown>(path, undefined, config);
  }

  /** Search suppliers */
  async search(params?: Record<string, unknown>, config?: RequestConfig): Promise<unknown> {
    const path = "/suppliers/search";
    return this._get<unknown>(path, params, config);
  }

  /** Toggle supplier active state */
  async toggleActive(supplier: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/suppliers/{supplier}/toggle-active", { "supplier": supplier });
    return this._send<unknown>("POST", path, undefined, config);
  }
}
