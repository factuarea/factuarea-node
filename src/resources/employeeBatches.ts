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
  async cancel(company: string, id: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/employee-batches/{id}/cancel", { "company": company, "id": id });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Confirm an employee batch */
  async confirm(company: string, id: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/employee-batches/{id}/confirm", { "company": company, "id": id });
    return this._send<unknown>("POST", path, body, config);
  }

  /** List an employee batch */
  async list(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/employee-batches", { "company": company });
    return this._paginate<unknown>(path, params, "cursor", config);
  }

  /** Prepare an employee batch */
  async prepare(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/employee-batches", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Refresh the quote for an employee batch */
  async refreshQuote(company: string, id: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/employee-batches/{id}/quote", { "company": company, "id": id });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Retrieve an employee batch */
  async show(company: string, id: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/employee-batches/{id}", { "company": company, "id": id });
    return this._get<unknown>(path, undefined, config);
  }
}
