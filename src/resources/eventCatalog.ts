// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";
import type { PublicApiV1EventCatalogListResponses } from "../generated/types.gen.js";


export class EventCatalogResource extends BaseResource {
  /** List event types */
  async list(config?: RequestConfig): Promise<PublicApiV1EventCatalogListResponses[200]> {
    const path = "/event-catalog";
    return this._get<PublicApiV1EventCatalogListResponses[200]>(path, undefined, config);
  }
}
