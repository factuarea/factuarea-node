// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


import type * as NativeApi from "../generated/types.gen.js";

export class CrmDataGovernanceResource extends BaseResource {
  /** POST /crm/crmdatagovernance/requests/{request}/approve */
  async crmApproveCrmDataRequest(request: string, body: NativeApi.CrmApproveCrmDataRequestData["body"], config?: RequestConfig): Promise<NativeApi.CrmApproveCrmDataRequestResponse> {
    const path = this.buildPath("/crm/crmdatagovernance/requests/{request}/approve", { "request": request });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmApproveCrmDataRequestResponse>("POST", path, body, config);
  }

  /** POST /crm/crmdatagovernance/requests/{request}/cancel */
  async crmCancelCrmDataRequest(request: string, body: NativeApi.CrmCancelCrmDataRequestData["body"], config?: RequestConfig): Promise<NativeApi.CrmCancelCrmDataRequestResponse> {
    const path = this.buildPath("/crm/crmdatagovernance/requests/{request}/cancel", { "request": request });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmCancelCrmDataRequestResponse>("POST", path, body, config);
  }

  /** GET /crm/crmdatagovernance/requests/{request}/download */
  async crmDownloadCrmDataExport(request: string, config?: RequestConfig): Promise<NativeApi.CrmDownloadCrmDataExportResponse> {
    const path = this.buildPath("/crm/crmdatagovernance/requests/{request}/download", { "request": request });
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.CrmDownloadCrmDataExportResponse>(path, undefined, config);
  }

  /** POST /crm/crmdatagovernance/requests/{request}/execute */
  async crmExecuteCrmDataRequest(request: string, body: NativeApi.CrmExecuteCrmDataRequestData["body"], config?: RequestConfig): Promise<NativeApi.CrmExecuteCrmDataRequestResponse> {
    const path = this.buildPath("/crm/crmdatagovernance/requests/{request}/execute", { "request": request });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmExecuteCrmDataRequestResponse>("POST", path, body, config);
  }

  /** GET /crm/crmdatagovernance/subjects/{subject}/contactability */
  async crmGetCrmContactability(subject: string, params: NativeApi.CrmGetCrmContactabilityData["query"], config?: RequestConfig): Promise<NativeApi.CrmGetCrmContactabilityResponse> {
    const path = this.buildPath("/crm/crmdatagovernance/subjects/{subject}/contactability", { "subject": subject });
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.CrmGetCrmContactabilityResponse>(path, params, config);
  }

  /** PUT /crm/crmdatagovernance/subjects/{subject}/contactability */
  async crmSetCrmContactability(subject: string, body: NativeApi.CrmSetCrmContactabilityData["body"], config?: RequestConfig): Promise<NativeApi.CrmSetCrmContactabilityResponse> {
    const path = this.buildPath("/crm/crmdatagovernance/subjects/{subject}/contactability", { "subject": subject });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmSetCrmContactabilityResponse>("PUT", path, body, config);
  }

  /** GET /crm/crmdatagovernance/requests/{request} */
  async crmGetCrmDataRequest(request: string, config?: RequestConfig): Promise<NativeApi.CrmGetCrmDataRequestResponse> {
    const path = this.buildPath("/crm/crmdatagovernance/requests/{request}", { "request": request });
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.CrmGetCrmDataRequestResponse>(path, undefined, config);
  }

  /** POST /crm/crmdatagovernance/requests/preview */
  async crmPreviewCrmDataRequest(body: NativeApi.CrmPreviewCrmDataRequestData["body"], config?: RequestConfig): Promise<NativeApi.CrmPreviewCrmDataRequestResponse> {
    const path = "/crm/crmdatagovernance/requests/preview";
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmPreviewCrmDataRequestResponse>("POST", path, body, config);
  }

  /** POST /crm/crmdatagovernance/requests/{request}/privacy-policy */
  async crmRatifyCrmPrivacyPolicy(request: string, body: NativeApi.CrmRatifyCrmPrivacyPolicyData["body"], config?: RequestConfig): Promise<NativeApi.CrmRatifyCrmPrivacyPolicyResponse> {
    const path = this.buildPath("/crm/crmdatagovernance/requests/{request}/privacy-policy", { "request": request });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmRatifyCrmPrivacyPolicyResponse>("POST", path, body, config);
  }
}
