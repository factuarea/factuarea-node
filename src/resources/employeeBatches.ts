// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class EmployeeBatchesResource extends BaseResource {
  /** Cancel an employee batch */
  async cancel(id: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/employee-batches/{id}/cancel", { "id": id });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Confirm an employee batch */
  async confirm(id: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/employee-batches/{id}/confirm", { "id": id });
    return this._send<unknown>("POST", path, body, config);
  }

  /** List an employee batch */
  async list(params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    return this._paginate<unknown>("/employee-batches", params, "cursor", config);
  }

  /** Prepare an employee batch */
  async prepare(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/employee-batches";
    return this._send<unknown>("POST", path, body, config);
  }

  /** Refresh the quote for an employee batch */
  async refreshQuote(id: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/employee-batches/{id}/quote", { "id": id });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Retrieve an employee batch */
  async show(id: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/employee-batches/{id}", { "id": id });
    return this._get<unknown>(path, undefined, config);
  }
}
