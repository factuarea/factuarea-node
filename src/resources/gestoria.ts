// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";
import type { PublicApiV1GestoriaWorkforceSummaryResponses } from "../generated/types.gen.js";


export class GestoriaResource extends BaseResource {
  /** Retrieve the consolidated workforce compliance overview */
  async workforceSummary(account: string, config?: RequestConfig): Promise<PublicApiV1GestoriaWorkforceSummaryResponses[200]> {
    const path = this.buildPath("/accounts/{account}/gestoria/workforce-summary", { "account": account });
    return this._get<PublicApiV1GestoriaWorkforceSummaryResponses[200]>(path, undefined, config);
  }
}
