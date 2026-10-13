// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


import type * as NativeApi from "../generated/types.gen.js";

export class CrmAccessContextResource extends BaseResource {
  /** Retrieve the current CRM access context */
  async crmGetCrmAccessContext(config?: RequestConfig): Promise<NativeApi.CrmGetCrmAccessContextResponse> {
    const path = "/crm/access-context";
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.CrmGetCrmAccessContextResponse>(path, undefined, config);
  }
}
