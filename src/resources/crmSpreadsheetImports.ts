// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


import type * as NativeApi from "../generated/types.gen.js";

export class CrmSpreadsheetImportsResource extends BaseResource {
  /** POST /crm/imports/{run}/apply */
  async apply(run: string, config?: RequestConfig): Promise<NativeApi.PublicApiV1CrmSpreadsheetImportsApplyResponse> {
    const path = this.buildPath("/crm/imports/{run}/apply", { "run": run });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.PublicApiV1CrmSpreadsheetImportsApplyResponse>("POST", path, undefined, config);
  }

  /** GET /crm/imports/{run} */
  async show(run: string, config?: RequestConfig): Promise<NativeApi.PublicApiV1CrmSpreadsheetImportsShowResponse> {
    const path = this.buildPath("/crm/imports/{run}", { "run": run });
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.PublicApiV1CrmSpreadsheetImportsShowResponse>(path, undefined, config);
  }

  /** POST /crm/imports/{run}/recovery-preview */
  async recoveryPreview(run: string, config?: RequestConfig): Promise<NativeApi.PublicApiV1CrmSpreadsheetImportsRecoveryPreviewResponse> {
    const path = this.buildPath("/crm/imports/{run}/recovery-preview", { "run": run });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.PublicApiV1CrmSpreadsheetImportsRecoveryPreviewResponse>("POST", path, undefined, config);
  }

  /** POST /crm/imports/preview */
  async preview(config?: RequestConfig): Promise<NativeApi.PublicApiV1CrmSpreadsheetImportsPreviewResponse> {
    const path = "/crm/imports/preview";
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.PublicApiV1CrmSpreadsheetImportsPreviewResponse>("POST", path, undefined, config);
  }
}
