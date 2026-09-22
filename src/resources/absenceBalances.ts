// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.0.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class AbsenceBalancesResource extends BaseResource {
  /** List all absence balances */
  async list(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/absence-balances", { "company": company });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Retrieve an absence balance */
  async show(company: string, absenceBalance: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/absence-balances/{absence_balance}", { "company": company, "absence_balance": absenceBalance });
    return this._get<unknown>(path, undefined, config);
  }
}
