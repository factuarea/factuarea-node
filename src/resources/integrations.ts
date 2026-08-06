// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.0.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class IntegrationsEventsResource extends BaseResource {
  /** List integration events */
  async list(params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    return this._paginate<unknown>("/integrations/events", params, "starting_after");
  }

  /** Replay a parked integration event */
  async replay(event: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/integrations/events/{event}/replay", { "event": event });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Retrieve an integration event */
  async show(event: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/integrations/events/{event}", { "event": event });
    return this._get<unknown>(path, undefined, config);
  }
}

export class IntegrationsResource extends BaseResource {
  readonly events: IntegrationsEventsResource;

  constructor(client: HttpClient) {
    super(client);
    this.events = new IntegrationsEventsResource(client);
  }
}
