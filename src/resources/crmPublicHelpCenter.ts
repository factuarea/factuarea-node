// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


import type * as NativeApi from "../generated/types.gen.js";

export class CrmPublicHelpCenterResource extends BaseResource {
  /** Get current help center administration */
  async get(config?: RequestConfig): Promise<NativeApi.PublicApiV1CrmPublicHelpCenterGetResponse> {
    const path = "/crm/public-help-center";
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.PublicApiV1CrmPublicHelpCenterGetResponse>(path, undefined, config);
  }

  /** Recover the original publish receipt */
  async receiptPublish(config: RequestConfig & { idempotencyKey: string }): Promise<NativeApi.PublicApiV1CrmPublicHelpCenterReceiptPublishResponse> {
    const path = "/crm/public-help-center/receipts/publish";
    config = this._nativeConfig(config, true);
    return this._get<NativeApi.PublicApiV1CrmPublicHelpCenterReceiptPublishResponse>(path, undefined, config);
  }

  /** Recover the original unpublish receipt */
  async receiptUnpublish(config: RequestConfig & { idempotencyKey: string }): Promise<NativeApi.PublicApiV1CrmPublicHelpCenterReceiptUnpublishResponse> {
    const path = "/crm/public-help-center/receipts/unpublish";
    config = this._nativeConfig(config, true);
    return this._get<NativeApi.PublicApiV1CrmPublicHelpCenterReceiptUnpublishResponse>(path, undefined, config);
  }

  /** Publish the help center with its original intent */
  async publish(body: NativeApi.PublicApiV1CrmPublicHelpCenterPublishData["body"], config: RequestConfig & { idempotencyKey: string }): Promise<NativeApi.PublicApiV1CrmPublicHelpCenterPublishResponse> {
    const path = "/crm/public-help-center/publish";
    config = this._nativeConfig(config, true);
    return this._sendNative<NativeApi.PublicApiV1CrmPublicHelpCenterPublishResponse>("POST", path, body, config);
  }

  /** Withdraw the help center with its original intent */
  async unpublish(center: string, body: NativeApi.PublicApiV1CrmPublicHelpCenterUnpublishData["body"], config: RequestConfig & { idempotencyKey: string }): Promise<NativeApi.PublicApiV1CrmPublicHelpCenterUnpublishResponse> {
    const path = this.buildPath("/crm/public-help-center/{center}/unpublish", { "center": center });
    config = this._nativeConfig(config, true);
    return this._sendNative<NativeApi.PublicApiV1CrmPublicHelpCenterUnpublishResponse>("POST", path, body, config);
  }
}
