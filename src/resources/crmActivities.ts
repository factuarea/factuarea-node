// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


import type * as NativeApi from "../generated/types.gen.js";

export class CrmActivitiesResource extends BaseResource {
  /** Comentar una actividad */
  async crmCommentCrmActivity(activity: string, body: NativeApi.CrmCommentCrmActivityData["body"], config?: RequestConfig): Promise<NativeApi.CrmCommentCrmActivityResponse> {
    const path = this.buildPath("/crm/crmactivity/{activity}/comments", { "activity": activity });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmCommentCrmActivityResponse>("POST", path, body, config);
  }

  /** Crear una actividad comercial */
  async crmCreateCrmActivity(body: NativeApi.CrmCreateCrmActivityData["body"], config?: RequestConfig): Promise<NativeApi.CrmCreateCrmActivityResponse> {
    const path = "/crm/crmactivity";
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmCreateCrmActivityResponse>("POST", path, body, config);
  }

  /** Listar actividades autorizadas */
  async crmListCrmActivities(params?: NativeApi.CrmListCrmActivitiesData["query"], config?: RequestConfig): Promise<NativeApi.CrmListCrmActivitiesResponse> {
    const path = "/crm/crmactivity";
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.CrmListCrmActivitiesResponse>(path, params, config);
  }

  /** Retirar un adjunto de una actividad */
  async crmDeleteCrmActivityAttachment(activity: string, attachment: string, body: NativeApi.CrmDeleteCrmActivityAttachmentData["body"], config?: RequestConfig): Promise<NativeApi.CrmDeleteCrmActivityAttachmentResponse> {
    const path = this.buildPath("/crm/crmactivity/{activity}/attachments/{attachment}", { "activity": activity, "attachment": attachment });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmDeleteCrmActivityAttachmentResponse>("DELETE", path, body, config);
  }

  /** Obtener un ticket de adjunto privado */
  async crmDownloadCrmActivityAttachment(activity: string, attachment: string, config?: RequestConfig): Promise<NativeApi.CrmDownloadCrmActivityAttachmentResponse> {
    const path = this.buildPath("/crm/crmactivity/{activity}/attachments/{attachment}", { "activity": activity, "attachment": attachment });
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.CrmDownloadCrmActivityAttachmentResponse>(path, undefined, config);
  }

  /** Retrieve the original activity creation */
  async crmGetCrmActivityCreateOriginal(params: NativeApi.CrmGetCrmActivityCreateOriginalData["query"], config: RequestConfig & { idempotencyKey: string }): Promise<NativeApi.CrmGetCrmActivityCreateOriginalResponse> {
    const path = "/crm/crmactivity/create/original";
    config = this._nativeConfig(config, true);
    return this._get<NativeApi.CrmGetCrmActivityCreateOriginalResponse>(path, params, config);
  }

  /** Obtener una actividad y su colaboración */
  async crmGetCrmActivity(activity: string, config?: RequestConfig): Promise<NativeApi.CrmGetCrmActivityResponse> {
    const path = this.buildPath("/crm/crmactivity/{activity}", { "activity": activity });
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.CrmGetCrmActivityResponse>(path, undefined, config);
  }

  /** Editar una actividad comercial */
  async crmUpdateCrmActivity(activity: string, body: NativeApi.CrmUpdateCrmActivityData["body"], config?: RequestConfig): Promise<NativeApi.CrmUpdateCrmActivityResponse> {
    const path = this.buildPath("/crm/crmactivity/{activity}", { "activity": activity });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmUpdateCrmActivityResponse>("PATCH", path, body, config);
  }

  /** Cambiar el estado de una actividad */
  async crmTransitionCrmActivity(activity: string, body: NativeApi.CrmTransitionCrmActivityData["body"], config?: RequestConfig): Promise<NativeApi.CrmTransitionCrmActivityResponse> {
    const path = this.buildPath("/crm/crmactivity/{activity}/status", { "activity": activity });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmTransitionCrmActivityResponse>("POST", path, body, config);
  }
}
