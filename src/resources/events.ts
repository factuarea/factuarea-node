// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.0.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class EventsResource extends BaseResource {
  /** List all events */
  async list(params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    return this._paginate<unknown>("/events", params, "starting_after");
  }

  /** Retrieve an event */
  async show(event: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/events/{event}", { "event": event });
    return this._get<unknown>(path, undefined, config);
  }
}
