// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.0.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class TimeBalancesResource extends BaseResource {
  /** Retrieve an employee’s time balance for a period */
  async employee(employee: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/time-balances/employee/{employee}", { "employee": employee });
    return this._get<unknown>(path, params, config);
  }

  /** Retrieve an employee’s monthly time sheet */
  async monthlySheet(params?: Record<string, unknown>, config?: RequestConfig): Promise<unknown> {
    const path = "/time-balances/monthly-sheet";
    return this._get<unknown>(path, params, config);
  }

  /** Retrieve the team time balance summary */
  async teamSummary(params?: Record<string, unknown>, config?: RequestConfig): Promise<unknown> {
    const path = "/time-balances/team-summary";
    return this._get<unknown>(path, params, config);
  }
}
