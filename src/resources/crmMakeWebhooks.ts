// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


import type * as NativeApi from "../generated/types.gen.js";

export class CrmMakeWebhooksResource extends BaseResource {
  /** POST /crm/make/webhooks/{verification_id}/attach */
  async attach(verificationId: string, body: NativeApi.PublicApiV1CrmMakeWebhooksAttachData["body"], config?: RequestConfig): Promise<NativeApi.PublicApiV1CrmMakeWebhooksAttachResponse> {
    const path = this.buildPath("/crm/make/webhooks/{verification_id}/attach", { "verification_id": verificationId });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.PublicApiV1CrmMakeWebhooksAttachResponse>("POST", path, body, config);
  }

  /** DELETE /crm/make/webhooks/{verification_id} */
  async detach(verificationId: string, config?: RequestConfig): Promise<NativeApi.PublicApiV1CrmMakeWebhooksDetachResponse> {
    const path = this.buildPath("/crm/make/webhooks/{verification_id}", { "verification_id": verificationId });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.PublicApiV1CrmMakeWebhooksDetachResponse>("DELETE", path, undefined, config);
  }

  /** GET /crm/make/webhooks/{verification_id}/deliveries/{receipt_id}/original */
  async original(verificationId: string, receiptId: string, params: NativeApi.PublicApiV1CrmMakeWebhooksOriginalData["query"], config?: RequestConfig): Promise<NativeApi.PublicApiV1CrmMakeWebhooksOriginalResponse> {
    const path = this.buildPath("/crm/make/webhooks/{verification_id}/deliveries/{receipt_id}/original", { "verification_id": verificationId, "receipt_id": receiptId });
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.PublicApiV1CrmMakeWebhooksOriginalResponse>(path, params, config);
  }

  /** POST /crm/make/webhooks/preparations */
  async prepare(body: NativeApi.PublicApiV1CrmMakeWebhooksPrepareData["body"], config?: RequestConfig): Promise<NativeApi.PublicApiV1CrmMakeWebhooksPrepareResponse> {
    const path = "/crm/make/webhooks/preparations";
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.PublicApiV1CrmMakeWebhooksPrepareResponse>("POST", path, body, config);
  }
}
