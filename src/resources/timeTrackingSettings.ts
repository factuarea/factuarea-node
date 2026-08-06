// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.0.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class TimeTrackingSettingsResource extends BaseResource {
  /** Retrieve the time tracking settings */
  async show(config?: RequestConfig): Promise<unknown> {
    const path = "/time-tracking-settings";
    return this._get<unknown>(path, undefined, config);
  }

  /** Update the time tracking settings */
  async update(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/time-tracking-settings";
    return this._send<unknown>("PUT", path, body, config);
  }
}
