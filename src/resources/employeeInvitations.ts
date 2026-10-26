// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";
import type { PublicApiV1EmployeeInvitationsListResponses, PublicApiV1EmployeeInvitationsResendResponses, PublicApiV1EmployeeInvitationsSendData, PublicApiV1EmployeeInvitationsSendResponses } from "../generated/types.gen.js";


export class EmployeeInvitationsResource extends BaseResource {
  /** Cancel an employee invitation */
  async cancel(company: string, invitation: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/employee-invitations/{invitation}", { "company": company, "invitation": invitation });
    return this._send<unknown>("DELETE", path, undefined, config);
  }

  /** List employee invitations */
  async list(company: string, config?: RequestConfig): Promise<PublicApiV1EmployeeInvitationsListResponses[200]> {
    const path = this.buildPath("/companies/{company}/employee-invitations", { "company": company });
    return this._get<PublicApiV1EmployeeInvitationsListResponses[200]>(path, undefined, config);
  }

  /** Send an employee invitation */
  async send(company: string, body?: PublicApiV1EmployeeInvitationsSendData["body"], config?: RequestConfig): Promise<PublicApiV1EmployeeInvitationsSendResponses[201]> {
    const path = this.buildPath("/companies/{company}/employee-invitations", { "company": company });
    return this._send<PublicApiV1EmployeeInvitationsSendResponses[201]>("POST", path, body, config);
  }

  /** Resend an employee invitation */
  async resend(company: string, invitation: string, config?: RequestConfig): Promise<PublicApiV1EmployeeInvitationsResendResponses[200]> {
    const path = this.buildPath("/companies/{company}/employee-invitations/{invitation}/resend", { "company": company, "invitation": invitation });
    return this._send<PublicApiV1EmployeeInvitationsResendResponses[200]>("POST", path, undefined, config);
  }
}
