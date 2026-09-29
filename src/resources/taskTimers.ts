// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class TaskTimersResource extends BaseResource {
  /** Retrieve the running task timer */
  async current(config?: RequestConfig): Promise<unknown> {
    const path = "/task-timers/current";
    return this._get<unknown>(path, undefined, config);
  }

  /** Stop the running task timer */
  async stop(config?: RequestConfig): Promise<unknown> {
    const path = "/task-timers/stop";
    return this._send<unknown>("POST", path, undefined, config);
  }
}
