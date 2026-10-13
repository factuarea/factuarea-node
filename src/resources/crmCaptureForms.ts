// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


import type * as NativeApi from "../generated/types.gen.js";

export class CrmCaptureFormsResource extends BaseResource {
  /** Get Capture Form */
  async crmGetCaptureForm(form: string, params?: NativeApi.CrmGetCaptureFormData["query"], config?: RequestConfig): Promise<NativeApi.CrmGetCaptureFormResponse> {
    const path = this.buildPath("/crm/capture/forms/{form}", { "form": form });
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.CrmGetCaptureFormResponse>(path, params, config);
  }

  /** Get Capture Metrics */
  async crmGetCaptureMetrics(form: string, params: NativeApi.CrmGetCaptureMetricsData["query"], config?: RequestConfig): Promise<NativeApi.CrmGetCaptureMetricsResponse> {
    const path = this.buildPath("/crm/capture/forms/{form}/metrics", { "form": form });
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.CrmGetCaptureMetricsResponse>(path, params, config);
  }

  /** List current WebToTicket form references */
  async crmGetServiceFormReferences(config?: RequestConfig): Promise<NativeApi.CrmGetServiceFormReferencesResponse> {
    const path = "/crm/capture/service-form-references";
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.CrmGetServiceFormReferencesResponse>(path, undefined, config);
  }

  /** List Capture Forms */
  async crmListCaptureForms(params?: NativeApi.CrmListCaptureFormsData["query"], config?: RequestConfig): Promise<Page<NativeApi.CrmListCaptureFormsResponse["data"][number]>> {
    config = this._nativeConfig(config, false);
    return this._paginate<NativeApi.CrmListCaptureFormsResponse["data"][number]>("/crm/capture/forms", params, "cursor", config);
  }

  /** Save Capture Form */
  async crmSaveCaptureForm(body: NativeApi.CrmSaveCaptureFormData["body"], config?: RequestConfig): Promise<NativeApi.CrmSaveCaptureFormResponse> {
    const path = "/crm/capture/forms";
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmSaveCaptureFormResponse>("POST", path, body, config);
  }

  /** Publish Capture Form */
  async crmPublishCaptureForm(form: string, body: NativeApi.CrmPublishCaptureFormData["body"], config?: RequestConfig): Promise<NativeApi.CrmPublishCaptureFormResponse> {
    const path = this.buildPath("/crm/capture/forms/{form}/publish", { "form": form });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmPublishCaptureFormResponse>("POST", path, body, config);
  }

  /** Reauthorize Capture Form */
  async crmReauthorizeCaptureForm(form: string, body: NativeApi.CrmReauthorizeCaptureFormData["body"], config?: RequestConfig): Promise<NativeApi.CrmReauthorizeCaptureFormResponse> {
    const path = this.buildPath("/crm/capture/forms/{form}/reauthorize", { "form": form });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmReauthorizeCaptureFormResponse>("POST", path, body, config);
  }

  /** Reauthorize an exact Meta capture publication */
  async crmReauthorizeMetaCapture(connection: string, form: string, body: NativeApi.CrmReauthorizeMetaCaptureData["body"], config?: RequestConfig): Promise<NativeApi.CrmReauthorizeMetaCaptureResponse> {
    const path = this.buildPath("/crm/connections/{connection}/capture-forms/{form}/meta-reauthorizations", { "connection": connection, "form": form });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmReauthorizeMetaCaptureResponse>("POST", path, body, config);
  }

  /** Rotate Capture Access */
  async crmRotateCaptureAccess(form: string, body: NativeApi.CrmRotateCaptureAccessData["body"], config?: RequestConfig): Promise<NativeApi.CrmRotateCaptureAccessResponse> {
    const path = this.buildPath("/crm/capture/forms/{form}/rotate", { "form": form });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmRotateCaptureAccessResponse>("POST", path, body, config);
  }
}
