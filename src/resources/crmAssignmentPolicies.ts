// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


import type * as NativeApi from "../generated/types.gen.js";

export class CrmAssignmentPoliciesResource extends BaseResource {
  /** Create a CRM assignment policy */
  async crmCreateCrmAssignmentPolicy(body: NativeApi.CrmCreateCrmAssignmentPolicyData["body"], config?: RequestConfig): Promise<NativeApi.CrmCreateCrmAssignmentPolicyResponse> {
    const path = "/crm/assignment-policies";
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmCreateCrmAssignmentPolicyResponse>("POST", path, body, config);
  }

  /** List CRM assignment policies */
  async crmListCrmAssignmentPolicies(params?: NativeApi.CrmListCrmAssignmentPoliciesData["query"], config?: RequestConfig): Promise<NativeApi.CrmListCrmAssignmentPoliciesResponse> {
    const path = "/crm/assignment-policies";
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.CrmListCrmAssignmentPoliciesResponse>(path, params, config);
  }

  /** Retrieve a CRM assignment policy */
  async crmGetCrmAssignmentPolicy(policy: string, config?: RequestConfig): Promise<NativeApi.CrmGetCrmAssignmentPolicyResponse> {
    const path = this.buildPath("/crm/assignment-policies/{policy}", { "policy": policy });
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.CrmGetCrmAssignmentPolicyResponse>(path, undefined, config);
  }

  /** Update a CRM assignment policy */
  async crmSaveCrmAssignmentPolicy(policy: string, body: NativeApi.CrmSaveCrmAssignmentPolicyData["body"], config?: RequestConfig): Promise<NativeApi.CrmSaveCrmAssignmentPolicyResponse> {
    const path = this.buildPath("/crm/assignment-policies/{policy}", { "policy": policy });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmSaveCrmAssignmentPolicyResponse>("PUT", path, body, config);
  }

  /** Preview a CRM assignment policy */
  async crmPreviewCrmAssignmentPolicy(policy: string, body: NativeApi.CrmPreviewCrmAssignmentPolicyData["body"], config?: RequestConfig): Promise<NativeApi.CrmPreviewCrmAssignmentPolicyResponse> {
    const path = this.buildPath("/crm/assignment-policies/{policy}/preview", { "policy": policy });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmPreviewCrmAssignmentPolicyResponse>("POST", path, body, config);
  }
}
