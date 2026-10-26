// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";
import type { PublicApiV1PayrollExportFormatsListResponses } from "../generated/types.gen.js";


export class PayrollExportFormatsResource extends BaseResource {
  /** List the supported payroll export formats */
  async list(config?: RequestConfig): Promise<PublicApiV1PayrollExportFormatsListResponses[200]> {
    const path = "/payroll-export-formats";
    return this._get<PublicApiV1PayrollExportFormatsListResponses[200]>(path, undefined, config);
  }
}
