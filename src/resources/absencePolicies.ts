// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";
import type { PublicApiV1AbsencePoliciesArchiveResponses, PublicApiV1AbsencePoliciesAssignData, PublicApiV1AbsencePoliciesAssignResponses, PublicApiV1AbsencePoliciesAssignmentsResponses, PublicApiV1AbsencePoliciesCarryoverData, PublicApiV1AbsencePoliciesCarryoverResponses, PublicApiV1AbsencePoliciesCreateData, PublicApiV1AbsencePoliciesCreateResponses, PublicApiV1AbsencePoliciesShowResponses, PublicApiV1AbsencePoliciesUnarchiveResponses, PublicApiV1AbsencePoliciesUnassignData, PublicApiV1AbsencePoliciesUnassignResponses, PublicApiV1AbsencePoliciesUpdateData, PublicApiV1AbsencePoliciesUpdateResponses } from "../generated/types.gen.js";


export class AbsencePoliciesResource extends BaseResource {
  /** Archive an absence policy */
  async archive(company: string, absencePolicy: string, config?: RequestConfig): Promise<PublicApiV1AbsencePoliciesArchiveResponses[200]> {
    const path = this.buildPath("/companies/{company}/absence-policies/{absence_policy}/archive", { "company": company, "absence_policy": absencePolicy });
    return this._send<PublicApiV1AbsencePoliciesArchiveResponses[200]>("POST", path, undefined, config);
  }

  /** Assign a policy to employees */
  async assign(company: string, absencePolicy: string, body?: PublicApiV1AbsencePoliciesAssignData["body"], config?: RequestConfig): Promise<PublicApiV1AbsencePoliciesAssignResponses[200]> {
    const path = this.buildPath("/companies/{company}/absence-policies/{absence_policy}/assign", { "company": company, "absence_policy": absencePolicy });
    return this._send<PublicApiV1AbsencePoliciesAssignResponses[200]>("POST", path, body, config);
  }

  /** Configure a policy’s year-end carryover */
  async carryover(company: string, absencePolicy: string, body?: PublicApiV1AbsencePoliciesCarryoverData["body"], config?: RequestConfig): Promise<PublicApiV1AbsencePoliciesCarryoverResponses[200]> {
    const path = this.buildPath("/companies/{company}/absence-policies/{absence_policy}/carryover", { "company": company, "absence_policy": absencePolicy });
    return this._send<PublicApiV1AbsencePoliciesCarryoverResponses[200]>("POST", path, body, config);
  }

  /** Create an absence policy */
  async create(company: string, body?: PublicApiV1AbsencePoliciesCreateData["body"], config?: RequestConfig): Promise<PublicApiV1AbsencePoliciesCreateResponses[201]> {
    const path = this.buildPath("/companies/{company}/absence-policies", { "company": company });
    return this._send<PublicApiV1AbsencePoliciesCreateResponses[201]>("POST", path, body, config);
  }

  /** List all absence policies */
  async list(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/absence-policies", { "company": company });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** List a policy’s assigned employees */
  async assignments(company: string, absencePolicy: string, config?: RequestConfig): Promise<PublicApiV1AbsencePoliciesAssignmentsResponses[200]> {
    const path = this.buildPath("/companies/{company}/absence-policies/{absence_policy}/assignments", { "company": company, "absence_policy": absencePolicy });
    return this._get<PublicApiV1AbsencePoliciesAssignmentsResponses[200]>(path, undefined, config);
  }

  /** Retrieve an absence policy */
  async show(company: string, absencePolicy: string, config?: RequestConfig): Promise<PublicApiV1AbsencePoliciesShowResponses[200]> {
    const path = this.buildPath("/companies/{company}/absence-policies/{absence_policy}", { "company": company, "absence_policy": absencePolicy });
    return this._get<PublicApiV1AbsencePoliciesShowResponses[200]>(path, undefined, config);
  }

  /** Update an absence policy */
  async update(company: string, absencePolicy: string, body?: PublicApiV1AbsencePoliciesUpdateData["body"], config?: RequestConfig): Promise<PublicApiV1AbsencePoliciesUpdateResponses[200]> {
    const path = this.buildPath("/companies/{company}/absence-policies/{absence_policy}", { "company": company, "absence_policy": absencePolicy });
    return this._send<PublicApiV1AbsencePoliciesUpdateResponses[200]>("PATCH", path, body, config);
  }

  /** Unarchive an absence policy */
  async unarchive(company: string, absencePolicy: string, config?: RequestConfig): Promise<PublicApiV1AbsencePoliciesUnarchiveResponses[200]> {
    const path = this.buildPath("/companies/{company}/absence-policies/{absence_policy}/unarchive", { "company": company, "absence_policy": absencePolicy });
    return this._send<PublicApiV1AbsencePoliciesUnarchiveResponses[200]>("POST", path, undefined, config);
  }

  /** Unassign a policy from employees */
  async unassign(company: string, absencePolicy: string, body?: PublicApiV1AbsencePoliciesUnassignData["body"], config?: RequestConfig): Promise<PublicApiV1AbsencePoliciesUnassignResponses[200]> {
    const path = this.buildPath("/companies/{company}/absence-policies/{absence_policy}/unassign", { "company": company, "absence_policy": absencePolicy });
    return this._send<PublicApiV1AbsencePoliciesUnassignResponses[200]>("POST", path, body, config);
  }
}
