// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";
import type { PublicApiV1TimeTrackingSettingsShowResponses, PublicApiV1TimeTrackingSettingsUpdateData, PublicApiV1TimeTrackingSettingsUpdateResponses } from "../generated/types.gen.js";


export class TimeTrackingSettingsResource extends BaseResource {
  /** Retrieve the time tracking settings */
  async show(company: string, config?: RequestConfig): Promise<PublicApiV1TimeTrackingSettingsShowResponses[200]> {
    const path = this.buildPath("/companies/{company}/time-tracking-settings", { "company": company });
    return this._get<PublicApiV1TimeTrackingSettingsShowResponses[200]>(path, undefined, config);
  }

  /** Update the time tracking settings */
  async update(company: string, body?: PublicApiV1TimeTrackingSettingsUpdateData["body"], config?: RequestConfig): Promise<PublicApiV1TimeTrackingSettingsUpdateResponses[200]> {
    const path = this.buildPath("/companies/{company}/time-tracking-settings", { "company": company });
    return this._send<PublicApiV1TimeTrackingSettingsUpdateResponses[200]>("PATCH", path, body, config);
  }
}
