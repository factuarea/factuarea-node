// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.0.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class AbsenceCalendarResource extends BaseResource {
  /** Get the team absence calendar */
  async show(params?: Record<string, unknown>, config?: RequestConfig): Promise<unknown> {
    const path = "/absence-calendar";
    return this._get<unknown>(path, params, config);
  }
}
