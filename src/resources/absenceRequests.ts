// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.0.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class AbsenceRequestsResource extends BaseResource {
  /** Approve an absence request */
  async approve(absenceRequest: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/absence-requests/{absence_request}/approve", { "absence_request": absenceRequest });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Cancel an absence request */
  async cancel(absenceRequest: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/absence-requests/{absence_request}/cancel", { "absence_request": absenceRequest });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Create an absence request */
  async create(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/absence-requests";
    return this._send<unknown>("POST", path, body, config);
  }

  /** List all absence requests */
  async list(params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    return this._paginate<unknown>("/absence-requests", params, "starting_after");
  }

  /** Reject an absence request */
  async reject(absenceRequest: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/absence-requests/{absence_request}/reject", { "absence_request": absenceRequest });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Retrieve an absence request */
  async show(absenceRequest: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/absence-requests/{absence_request}", { "absence_request": absenceRequest });
    return this._get<unknown>(path, undefined, config);
  }
}
