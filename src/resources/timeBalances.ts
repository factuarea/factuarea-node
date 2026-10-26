// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";
import type { PublicApiV1TimeBalancesEmployeeResponses, PublicApiV1TimeBalancesMonthlySheetResponses, PublicApiV1TimeBalancesTeamSummaryResponses } from "../generated/types.gen.js";


export class TimeBalancesResource extends BaseResource {
  /** Retrieve an employee’s time balance for a period */
  async employee(company: string, employee: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<PublicApiV1TimeBalancesEmployeeResponses[200]> {
    const path = this.buildPath("/companies/{company}/time-balances/employee/{employee}", { "company": company, "employee": employee });
    return this._get<PublicApiV1TimeBalancesEmployeeResponses[200]>(path, params, config);
  }

  /** Retrieve an employee’s monthly time sheet */
  async monthlySheet(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<PublicApiV1TimeBalancesMonthlySheetResponses[200]> {
    const path = this.buildPath("/companies/{company}/time-balances/monthly-sheet", { "company": company });
    return this._get<PublicApiV1TimeBalancesMonthlySheetResponses[200]>(path, params, config);
  }

  /** Retrieve the team time balance summary */
  async teamSummary(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<PublicApiV1TimeBalancesTeamSummaryResponses[200]> {
    const path = this.buildPath("/companies/{company}/time-balances/team-summary", { "company": company });
    return this._get<PublicApiV1TimeBalancesTeamSummaryResponses[200]>(path, params, config);
  }
}
