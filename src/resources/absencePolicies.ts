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
  async archive(absencePolicy: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/absence-policies/{absence_policy}/archive", { "absence_policy": absencePolicy });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Assign a policy to employees */
  async assign(absencePolicy: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/absence-policies/{absence_policy}/assign", { "absence_policy": absencePolicy });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Configure a policy’s year-end carryover */
  async carryover(absencePolicy: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/absence-policies/{absence_policy}/carryover", { "absence_policy": absencePolicy });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Create an absence policy */
  async create(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/absence-policies";
    return this._send<unknown>("POST", path, body, config);
  }

  /** List all absence policies */
  async list(params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    return this._paginate<unknown>("/absence-policies", params, "starting_after");
  }

  /** List a policy’s assigned employees */
  async assignments(absencePolicy: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/absence-policies/{absence_policy}/assignments", { "absence_policy": absencePolicy });
    return this._get<unknown>(path, undefined, config);
  }

  /** Retrieve an absence policy */
  async show(absencePolicy: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/absence-policies/{absence_policy}", { "absence_policy": absencePolicy });
    return this._get<unknown>(path, undefined, config);
  }

  /** Update an absence policy */
  async update(absencePolicy: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/absence-policies/{absence_policy}", { "absence_policy": absencePolicy });
    return this._send<unknown>("PUT", path, body, config);
  }

  /** Unarchive an absence policy */
  async unarchive(absencePolicy: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/absence-policies/{absence_policy}/unarchive", { "absence_policy": absencePolicy });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Unassign a policy from employees */
  async unassign(absencePolicy: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/absence-policies/{absence_policy}/unassign", { "absence_policy": absencePolicy });
    return this._send<unknown>("POST", path, body, config);
  }
}
