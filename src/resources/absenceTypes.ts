// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.0.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class AbsenceTypesResource extends BaseResource {
  /** Archive an absence type */
  async archive(absenceType: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/absence-types/{absence_type}/archive", { "absence_type": absenceType });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Create an absence type */
  async create(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/absence-types";
    return this._send<unknown>("POST", path, body, config);
  }

  /** List all absence types */
  async list(params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    return this._paginate<unknown>("/absence-types", params, "starting_after");
  }

  /** Retrieve an absence type */
  async show(absenceType: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/absence-types/{absence_type}", { "absence_type": absenceType });
    return this._get<unknown>(path, undefined, config);
  }

  /** Update an absence type */
  async update(absenceType: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/absence-types/{absence_type}", { "absence_type": absenceType });
    return this._send<unknown>("PUT", path, body, config);
  }

  /** Unarchive an absence type */
  async unarchive(absenceType: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/absence-types/{absence_type}/unarchive", { "absence_type": absenceType });
    return this._send<unknown>("POST", path, undefined, config);
  }
}
