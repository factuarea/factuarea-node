// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


import type * as NativeApi from "../generated/types.gen.js";

export class CrmAccessPoliciesResource extends BaseResource {
  /** List CRM access policies */
  async crmListCrmAccessPolicies(params?: NativeApi.CrmListCrmAccessPoliciesData["query"], config?: RequestConfig): Promise<NativeApi.CrmListCrmAccessPoliciesResponse> {
    const path = "/crm/access-policies";
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.CrmListCrmAccessPoliciesResponse>(path, params, config);
  }

  /** Set a CRM access policy */
  async crmSetCrmAccessPolicy(user: string, body: NativeApi.CrmSetCrmAccessPolicyData["body"], config?: RequestConfig): Promise<NativeApi.CrmSetCrmAccessPolicyResponse> {
    const path = this.buildPath("/crm/access-policies/{user}", { "user": user });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmSetCrmAccessPolicyResponse>("PUT", path, body, config);
  }
}
