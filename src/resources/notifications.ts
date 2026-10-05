// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class NotificationsResource extends BaseResource {
  /** List notifications */
  async list(params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    return this._paginate<unknown>("/notifications", params, "starting_after", config);
  }

  /** Mark all notifications as read */
  async markAllRead(config?: RequestConfig): Promise<unknown> {
    const path = "/notifications/mark-all-read";
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Mark a notification as read */
  async read(notification: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/notifications/{notification}/read", { "notification": notification });
    return this._send<unknown>("POST", path, undefined, config);
  }
}
