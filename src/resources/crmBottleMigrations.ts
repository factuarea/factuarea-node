// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


import type * as NativeApi from "../generated/types.gen.js";

export class CrmBottleMigrationsResource extends BaseResource {
  /** GET /crm/bottle-migrations/source-preview */
  async sourcePreview(params: NativeApi.PublicApiV1CrmBottleMigrationsSourcePreviewData["query"], config?: RequestConfig): Promise<NativeApi.PublicApiV1CrmBottleMigrationsSourcePreviewResponse> {
    const path = "/crm/bottle-migrations/source-preview";
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.PublicApiV1CrmBottleMigrationsSourcePreviewResponse>(path, params, config);
  }
}
