// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.0.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class AbsencePoliciesResource extends BaseResource {
  /** Archive an absence policy */
  async archive(company: string, absencePolicy: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/absence-policies/{absence_policy}/archive", { "company": company, "absence_policy": absencePolicy });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Assign a policy to employees */
  async assign(company: string, absencePolicy: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/absence-policies/{absence_policy}/assign", { "company": company, "absence_policy": absencePolicy });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Configure a policy’s year-end carryover */
  async carryover(company: string, absencePolicy: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/absence-policies/{absence_policy}/carryover", { "company": company, "absence_policy": absencePolicy });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Create an absence policy */
  async create(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/absence-policies", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** List all absence policies */
  async list(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/absence-policies", { "company": company });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** List a policy’s assigned employees */
  async assignments(company: string, absencePolicy: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/absence-policies/{absence_policy}/assignments", { "company": company, "absence_policy": absencePolicy });
    return this._get<unknown>(path, undefined, config);
  }

  /** Retrieve an absence policy */
  async show(company: string, absencePolicy: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/absence-policies/{absence_policy}", { "company": company, "absence_policy": absencePolicy });
    return this._get<unknown>(path, undefined, config);
  }

  /** Update an absence policy */
  async update(company: string, absencePolicy: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/absence-policies/{absence_policy}", { "company": company, "absence_policy": absencePolicy });
    return this._send<unknown>("PATCH", path, body, config);
  }

  /** Unarchive an absence policy */
  async unarchive(company: string, absencePolicy: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/absence-policies/{absence_policy}/unarchive", { "company": company, "absence_policy": absencePolicy });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Unassign a policy from employees */
  async unassign(company: string, absencePolicy: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/absence-policies/{absence_policy}/unassign", { "company": company, "absence_policy": absencePolicy });
    return this._send<unknown>("POST", path, body, config);
  }
}
