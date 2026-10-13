// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


import type * as NativeApi from "../generated/types.gen.js";

export class CrmConnectionsResource extends BaseResource {
  /** Complete human Meta authorization */
  async completeCrmMetaOAuth(body: NativeApi.CompleteCrmMetaOAuthData["body"], config?: RequestConfig): Promise<NativeApi.CompleteCrmMetaOAuthResponse> {
    const path = "/crm/connections/meta-lead-ads/oauth/complete";
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CompleteCrmMetaOAuthResponse>("POST", path, body, config);
  }

  /** List current Meta connection options */
  async listCrmMetaConnectionOptions(config?: RequestConfig): Promise<NativeApi.ListCrmMetaConnectionOptionsResponse> {
    const path = "/crm/connections/meta-lead-ads/options";
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.ListCrmMetaConnectionOptionsResponse>(path, undefined, config);
  }

  /** Retrieve the published Meta mapping */
  async getCrmMetaMapping(connectionUuid: string, formUuid: string, config?: RequestConfig): Promise<NativeApi.GetCrmMetaMappingResponse> {
    const path = this.buildPath("/crm/connections/meta-lead-ads/{connectionUuid}/mappings/{formUuid}", { "connectionUuid": connectionUuid, "formUuid": formUuid });
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.GetCrmMetaMappingResponse>(path, undefined, config);
  }

  /** Publish a reviewed Meta mapping */
  async publishCrmMetaMapping(connectionUuid: string, formUuid: string, body: NativeApi.PublishCrmMetaMappingData["body"], config?: RequestConfig): Promise<NativeApi.PublishCrmMetaMappingResponse> {
    const path = this.buildPath("/crm/connections/meta-lead-ads/{connectionUuid}/mappings/{formUuid}", { "connectionUuid": connectionUuid, "formUuid": formUuid });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.PublishCrmMetaMappingResponse>("PUT", path, body, config);
  }

  /** Inspect a Meta form mapping */
  async inspectCrmMetaMapping(connectionUuid: string, formUuid: string, body: NativeApi.InspectCrmMetaMappingData["body"], config?: RequestConfig): Promise<NativeApi.InspectCrmMetaMappingResponse> {
    const path = this.buildPath("/crm/connections/meta-lead-ads/{connectionUuid}/mappings/{formUuid}/inspect", { "connectionUuid": connectionUuid, "formUuid": formUuid });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.InspectCrmMetaMappingResponse>("POST", path, body, config);
  }

  /** Prepare human Meta authorization */
  async prepareCrmMetaOAuth(body: NativeApi.PrepareCrmMetaOAuthData["body"], config?: RequestConfig): Promise<NativeApi.PrepareCrmMetaOAuthResponse> {
    const path = "/crm/connections/meta-lead-ads/oauth/prepare";
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.PrepareCrmMetaOAuthResponse>("POST", path, body, config);
  }

  /** Publish human Meta capture consent */
  async publishCrmMetaConsent(connectionUuid: string, body: NativeApi.PublishCrmMetaConsentData["body"], config?: RequestConfig): Promise<NativeApi.PublishCrmMetaConsentResponse> {
    const path = this.buildPath("/crm/connections/meta-lead-ads/{connectionUuid}/consent", { "connectionUuid": connectionUuid });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.PublishCrmMetaConsentResponse>("POST", path, body, config);
  }
}
