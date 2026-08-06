// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.0.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class EmployeeInvitationsResource extends BaseResource {
  /** Cancel an employee invitation */
  async cancel(invitation: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/employee-invitations/{invitation}", { "invitation": invitation });
    return this._send<unknown>("DELETE", path, undefined, config);
  }

  /** List employee invitations */
  async list(config?: RequestConfig): Promise<unknown> {
    const path = "/employee-invitations";
    return this._get<unknown>(path, undefined, config);
  }

  /** Send an employee invitation */
  async send(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/employee-invitations";
    return this._send<unknown>("POST", path, body, config);
  }

  /** Resend an employee invitation */
  async resend(invitation: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/employee-invitations/{invitation}/resend", { "invitation": invitation });
    return this._send<unknown>("POST", path, undefined, config);
  }
}
