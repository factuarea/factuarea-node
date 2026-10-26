// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";
import type { PublicApiV1EmployeeSeatsCancelResponses, PublicApiV1EmployeeSeatsChangeQuantityResponses, PublicApiV1EmployeeSeatsPreviewResponses, PublicApiV1EmployeeSeatsStatusResponses, PublicApiV1EmployeeSeatsSubscribeResponses } from "../generated/types.gen.js";


export class EmployeeSeatsResource extends BaseResource {
  /** Cancel the employee seat add-on */
  async cancel(account: string, config?: RequestConfig): Promise<PublicApiV1EmployeeSeatsCancelResponses[200]> {
    const path = this.buildPath("/accounts/{account}/employee-seats/cancel", { "account": account });
    return this._send<PublicApiV1EmployeeSeatsCancelResponses[200]>("POST", path, undefined, config);
  }

  /** Sync the employee seat quantity */
  async changeQuantity(account: string, config?: RequestConfig): Promise<PublicApiV1EmployeeSeatsChangeQuantityResponses[200]> {
    const path = this.buildPath("/accounts/{account}/employee-seats/change-quantity", { "account": account });
    return this._send<PublicApiV1EmployeeSeatsChangeQuantityResponses[200]>("POST", path, undefined, config);
  }

  /** Retrieve employee seat billing status */
  async status(account: string, config?: RequestConfig): Promise<PublicApiV1EmployeeSeatsStatusResponses[200]> {
    const path = this.buildPath("/accounts/{account}/employee-seats", { "account": account });
    return this._get<PublicApiV1EmployeeSeatsStatusResponses[200]>(path, undefined, config);
  }

  /** Preview the employee seat charge */
  async preview(account: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<PublicApiV1EmployeeSeatsPreviewResponses[200]> {
    const path = this.buildPath("/accounts/{account}/employee-seats/preview", { "account": account });
    return this._get<PublicApiV1EmployeeSeatsPreviewResponses[200]>(path, params, config);
  }

  /** Subscribe to the employee seat add-on */
  async subscribe(account: string, config?: RequestConfig): Promise<PublicApiV1EmployeeSeatsSubscribeResponses[200]> {
    const path = this.buildPath("/accounts/{account}/employee-seats/subscribe", { "account": account });
    return this._send<PublicApiV1EmployeeSeatsSubscribeResponses[200]>("POST", path, undefined, config);
  }
}
