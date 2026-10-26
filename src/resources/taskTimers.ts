// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";
import type { PublicApiV1TaskTimersCurrentResponses, PublicApiV1TaskTimersStopResponses } from "../generated/types.gen.js";


export class TaskTimersResource extends BaseResource {
  /** Retrieve the running task timer */
  async current(company: string, config?: RequestConfig): Promise<PublicApiV1TaskTimersCurrentResponses[200]> {
    const path = this.buildPath("/companies/{company}/task-timers/current", { "company": company });
    return this._get<PublicApiV1TaskTimersCurrentResponses[200]>(path, undefined, config);
  }

  /** Stop the running task timer */
  async stop(company: string, config?: RequestConfig): Promise<PublicApiV1TaskTimersStopResponses[200]> {
    const path = this.buildPath("/companies/{company}/task-timers/stop", { "company": company });
    return this._send<PublicApiV1TaskTimersStopResponses[200]>("POST", path, undefined, config);
  }
}
