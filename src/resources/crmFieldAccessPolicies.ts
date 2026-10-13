// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


import type * as NativeApi from "../generated/types.gen.js";

export class CrmFieldAccessPoliciesResource extends BaseResource {
  /** Create a CRM field access policy */
  async crmCreateCrmFieldAccessPolicy(body: NativeApi.CrmCreateCrmFieldAccessPolicyData["body"], config?: RequestConfig): Promise<NativeApi.CrmCreateCrmFieldAccessPolicyResponse> {
    const path = "/crm/field-policies";
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmCreateCrmFieldAccessPolicyResponse>("POST", path, body, config);
  }

  /** List CRM field access policies */
  async crmListCrmFieldAccessPolicies(params?: NativeApi.CrmListCrmFieldAccessPoliciesData["query"], config?: RequestConfig): Promise<NativeApi.CrmListCrmFieldAccessPoliciesResponse> {
    const path = "/crm/field-policies";
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.CrmListCrmFieldAccessPoliciesResponse>(path, params, config);
  }

  /** Retrieve a CRM field access policy */
  async crmGetCrmFieldAccessPolicy(policy: string, config?: RequestConfig): Promise<NativeApi.CrmGetCrmFieldAccessPolicyResponse> {
    const path = this.buildPath("/crm/field-policies/{policy}", { "policy": policy });
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.CrmGetCrmFieldAccessPolicyResponse>(path, undefined, config);
  }

  /** Update a CRM field access policy */
  async crmSaveCrmFieldAccessPolicy(policy: string, body: NativeApi.CrmSaveCrmFieldAccessPolicyData["body"], config?: RequestConfig): Promise<NativeApi.CrmSaveCrmFieldAccessPolicyResponse> {
    const path = this.buildPath("/crm/field-policies/{policy}", { "policy": policy });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmSaveCrmFieldAccessPolicyResponse>("PUT", path, body, config);
  }
}
