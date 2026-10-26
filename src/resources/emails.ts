// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";
import type { PublicApiV1EmailsIndicatorsResponses, PublicApiV1EmailsShowResponses } from "../generated/types.gen.js";


export class EmailsResource extends BaseResource {
  /** Summarize email delivery per document */
  async indicators(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<PublicApiV1EmailsIndicatorsResponses[200]> {
    const path = this.buildPath("/companies/{company}/emails/indicators", { "company": company });
    return this._get<PublicApiV1EmailsIndicatorsResponses[200]>(path, params, config);
  }

  /** List sent emails */
  async list(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/emails", { "company": company });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Retrieve a sent email */
  async show(company: string, email: string, config?: RequestConfig): Promise<PublicApiV1EmailsShowResponses[200]> {
    const path = this.buildPath("/companies/{company}/emails/{email}", { "company": company, "email": email });
    return this._get<PublicApiV1EmailsShowResponses[200]>(path, undefined, config);
  }
}
