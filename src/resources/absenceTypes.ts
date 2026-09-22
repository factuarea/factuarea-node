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
  async archive(company: string, absenceType: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/absence-types/{absence_type}/archive", { "company": company, "absence_type": absenceType });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Create an absence type */
  async create(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/absence-types", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** List all absence types */
  async list(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/absence-types", { "company": company });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Retrieve an absence type */
  async show(company: string, absenceType: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/absence-types/{absence_type}", { "company": company, "absence_type": absenceType });
    return this._get<unknown>(path, undefined, config);
  }

  /** Update an absence type */
  async update(company: string, absenceType: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/absence-types/{absence_type}", { "company": company, "absence_type": absenceType });
    return this._send<unknown>("PATCH", path, body, config);
  }

  /** Unarchive an absence type */
  async unarchive(company: string, absenceType: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/absence-types/{absence_type}/unarchive", { "company": company, "absence_type": absenceType });
    return this._send<unknown>("POST", path, undefined, config);
  }
}
