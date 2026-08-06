// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.0.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class EmployeeSeatsResource extends BaseResource {
  /** Cancel the employee seat add-on */
  async cancel(config?: RequestConfig): Promise<unknown> {
    const path = "/employee-seats/cancel";
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Sync the employee seat quantity */
  async changeQuantity(config?: RequestConfig): Promise<unknown> {
    const path = "/employee-seats/change-quantity";
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Retrieve employee seat billing status */
  async status(config?: RequestConfig): Promise<unknown> {
    const path = "/employee-seats";
    return this._get<unknown>(path, undefined, config);
  }

  /** Preview the employee seat charge */
  async preview(params?: Record<string, unknown>, config?: RequestConfig): Promise<unknown> {
    const path = "/employee-seats/preview";
    return this._get<unknown>(path, params, config);
  }

  /** Subscribe to the employee seat add-on */
  async subscribe(config?: RequestConfig): Promise<unknown> {
    const path = "/employee-seats/subscribe";
    return this._send<unknown>("POST", path, undefined, config);
  }
}
