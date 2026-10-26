// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";
import type { PublicApiV1IntegrationsEventsReplayResponses, PublicApiV1IntegrationsEventsShowResponses } from "../generated/types.gen.js";


export class IntegrationsEventsResource extends BaseResource {
  /** List integration events */
  async list(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/integrations/events", { "company": company });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Replay a parked integration event */
  async replay(company: string, event: string, config?: RequestConfig): Promise<PublicApiV1IntegrationsEventsReplayResponses[202]> {
    const path = this.buildPath("/companies/{company}/integrations/events/{event}/replay", { "company": company, "event": event });
    return this._send<PublicApiV1IntegrationsEventsReplayResponses[202]>("POST", path, undefined, config);
  }

  /** Retrieve an integration event */
  async show(company: string, event: string, config?: RequestConfig): Promise<PublicApiV1IntegrationsEventsShowResponses[200]> {
    const path = this.buildPath("/companies/{company}/integrations/events/{event}", { "company": company, "event": event });
    return this._get<PublicApiV1IntegrationsEventsShowResponses[200]>(path, undefined, config);
  }
}

export class IntegrationsResource extends BaseResource {
  readonly events: IntegrationsEventsResource;

  constructor(client: HttpClient) {
    super(client);
    this.events = new IntegrationsEventsResource(client);
  }
}
