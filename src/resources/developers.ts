// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.0.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class DevelopersRequestLogsResource extends BaseResource {
  /** List your API request logs */
  async list(params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    return this._paginate<unknown>("/developers/request-logs", params, "starting_after");
  }

  /** Retrieve an API request log */
  async show(requestId: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/developers/request-logs/{request_id}", { "request_id": requestId });
    return this._get<unknown>(path, undefined, config);
  }
}

export class DevelopersResource extends BaseResource {
  readonly requestLogs: DevelopersRequestLogsResource;

  constructor(client: HttpClient) {
    super(client);
    this.requestLogs = new DevelopersRequestLogsResource(client);
  }
}
