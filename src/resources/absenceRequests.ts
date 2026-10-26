// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";
import type { PublicApiV1AbsenceRequestsApproveData, PublicApiV1AbsenceRequestsApproveResponses, PublicApiV1AbsenceRequestsCancelResponses, PublicApiV1AbsenceRequestsCreateData, PublicApiV1AbsenceRequestsCreateResponses, PublicApiV1AbsenceRequestsRejectData, PublicApiV1AbsenceRequestsRejectResponses, PublicApiV1AbsenceRequestsShowResponses } from "../generated/types.gen.js";


export class AbsenceRequestsResource extends BaseResource {
  /** Approve an absence request */
  async approve(company: string, absenceRequest: string, body?: PublicApiV1AbsenceRequestsApproveData["body"], config?: RequestConfig): Promise<PublicApiV1AbsenceRequestsApproveResponses[200]> {
    const path = this.buildPath("/companies/{company}/absence-requests/{absence_request}/approve", { "company": company, "absence_request": absenceRequest });
    return this._send<PublicApiV1AbsenceRequestsApproveResponses[200]>("POST", path, body, config);
  }

  /** Cancel an absence request */
  async cancel(company: string, absenceRequest: string, config?: RequestConfig): Promise<PublicApiV1AbsenceRequestsCancelResponses[200]> {
    const path = this.buildPath("/companies/{company}/absence-requests/{absence_request}/cancel", { "company": company, "absence_request": absenceRequest });
    return this._send<PublicApiV1AbsenceRequestsCancelResponses[200]>("POST", path, undefined, config);
  }

  /** Create an absence request */
  async create(company: string, body?: PublicApiV1AbsenceRequestsCreateData["body"], config?: RequestConfig): Promise<PublicApiV1AbsenceRequestsCreateResponses[201]> {
    const path = this.buildPath("/companies/{company}/absence-requests", { "company": company });
    return this._send<PublicApiV1AbsenceRequestsCreateResponses[201]>("POST", path, body, config);
  }

  /** List all absence requests */
  async list(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/absence-requests", { "company": company });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Reject an absence request */
  async reject(company: string, absenceRequest: string, body?: PublicApiV1AbsenceRequestsRejectData["body"], config?: RequestConfig): Promise<PublicApiV1AbsenceRequestsRejectResponses[200]> {
    const path = this.buildPath("/companies/{company}/absence-requests/{absence_request}/reject", { "company": company, "absence_request": absenceRequest });
    return this._send<PublicApiV1AbsenceRequestsRejectResponses[200]>("POST", path, body, config);
  }

  /** Retrieve an absence request */
  async show(company: string, absenceRequest: string, config?: RequestConfig): Promise<PublicApiV1AbsenceRequestsShowResponses[200]> {
    const path = this.buildPath("/companies/{company}/absence-requests/{absence_request}", { "company": company, "absence_request": absenceRequest });
    return this._get<PublicApiV1AbsenceRequestsShowResponses[200]>(path, undefined, config);
  }
}
