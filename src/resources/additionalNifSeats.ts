// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";
import type { PublicApiV1AdditionalNifSeatsPreviewResponses, PublicApiV1AdditionalNifSeatsStatusResponses, PublicApiV1AdditionalNifSeatsUpdateData, PublicApiV1AdditionalNifSeatsUpdateResponses } from "../generated/types.gen.js";


export class AdditionalNifSeatsResource extends BaseResource {
  /** Retrieve the additional tax ID seats */
  async status(account: string, config?: RequestConfig): Promise<PublicApiV1AdditionalNifSeatsStatusResponses[200]> {
    const path = this.buildPath("/accounts/{account}/additional-nif-seats", { "account": account });
    return this._get<PublicApiV1AdditionalNifSeatsStatusResponses[200]>(path, undefined, config);
  }

  /** Set the contracted additional tax ID seats */
  async update(account: string, body?: PublicApiV1AdditionalNifSeatsUpdateData["body"], config?: RequestConfig): Promise<PublicApiV1AdditionalNifSeatsUpdateResponses[200]> {
    const path = this.buildPath("/accounts/{account}/additional-nif-seats", { "account": account });
    return this._send<PublicApiV1AdditionalNifSeatsUpdateResponses[200]>("PATCH", path, body, config, { idempotent: true });
  }

  /** Preview a change of the additional tax ID seats */
  async preview(account: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<PublicApiV1AdditionalNifSeatsPreviewResponses[200]> {
    const path = this.buildPath("/accounts/{account}/additional-nif-seats/preview", { "account": account });
    return this._get<PublicApiV1AdditionalNifSeatsPreviewResponses[200]>(path, params, config);
  }
}
