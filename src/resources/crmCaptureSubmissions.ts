// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


import type * as NativeApi from "../generated/types.gen.js";

export class CrmCaptureSubmissionsResource extends BaseResource {
  /** List Capture Submissions */
  async crmListCaptureSubmissions(params?: NativeApi.CrmListCaptureSubmissionsData["query"], config?: RequestConfig): Promise<Page<NativeApi.CrmListCaptureSubmissionsResponse["data"][number]>> {
    config = this._nativeConfig(config, false);
    return this._paginate<NativeApi.CrmListCaptureSubmissionsResponse["data"][number]>("/crm/capture/submissions", params, "cursor", config);
  }

  /** Recover the original Meta capture receipt */
  async crmRecoverMetaCapture(connection: string, form: string, body: NativeApi.CrmRecoverMetaCaptureData["body"], config?: RequestConfig): Promise<NativeApi.CrmRecoverMetaCaptureResponse> {
    const path = this.buildPath("/crm/connections/{connection}/capture-forms/{form}/meta-recovery", { "connection": connection, "form": form });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmRecoverMetaCaptureResponse>("POST", path, body, config);
  }

  /** Replay Capture Submission */
  async crmReplayCaptureSubmission(submission: string, body: NativeApi.CrmReplayCaptureSubmissionData["body"], config?: RequestConfig): Promise<NativeApi.CrmReplayCaptureSubmissionResponse> {
    const path = this.buildPath("/crm/capture/submissions/{submission}/replay", { "submission": submission });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmReplayCaptureSubmissionResponse>("POST", path, body, config);
  }

  /** Submit Authenticated Capture */
  async crmSubmitAuthenticatedCapture(form: string, body: NativeApi.CrmSubmitAuthenticatedCaptureData["body"], config?: RequestConfig): Promise<NativeApi.CrmSubmitAuthenticatedCaptureResponse> {
    const path = this.buildPath("/crm/capture/forms/{form}/submissions", { "form": form });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmSubmitAuthenticatedCaptureResponse>("POST", path, body, config);
  }
}
