// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";
import type { PublicApiV1NotificationsMarkAllReadResponses, PublicApiV1NotificationsReadResponses } from "../generated/types.gen.js";


export class NotificationsResource extends BaseResource {
  /** List notifications */
  async list(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/notifications", { "company": company });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Mark all notifications as read */
  async markAllRead(company: string, config?: RequestConfig): Promise<PublicApiV1NotificationsMarkAllReadResponses[200]> {
    const path = this.buildPath("/companies/{company}/notifications/mark-all-read", { "company": company });
    return this._send<PublicApiV1NotificationsMarkAllReadResponses[200]>("POST", path, undefined, config);
  }

  /** Mark a notification as read */
  async read(company: string, notification: string, config?: RequestConfig): Promise<PublicApiV1NotificationsReadResponses[200]> {
    const path = this.buildPath("/companies/{company}/notifications/{notification}/read", { "company": company, "notification": notification });
    return this._send<PublicApiV1NotificationsReadResponses[200]>("POST", path, undefined, config);
  }
}
