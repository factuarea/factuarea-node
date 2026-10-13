// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


import type * as NativeApi from "../generated/types.gen.js";

export class CrmContactPeopleResource extends BaseResource {
  /** Archive a CRM contact person or organization */
  async crmContactPeopleArchive(person: string, body: NativeApi.CrmContactPeopleArchiveData["body"], config?: RequestConfig): Promise<NativeApi.CrmContactPeopleArchiveResponse> {
    const path = this.buildPath("/crm/contact-people/{person}/archive", { "person": person });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmContactPeopleArchiveResponse>("POST", path, body, config);
  }

  /** Create a CRM contact person or organization */
  async crmContactPeopleCreate(body: NativeApi.CrmContactPeopleCreateData["body"], config?: RequestConfig): Promise<NativeApi.CrmContactPeopleCreateResponse> {
    const path = "/crm/contact-people";
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmContactPeopleCreateResponse>("POST", path, body, config);
  }

  /** List CRM contact people and organizations */
  async crmContactPeopleIndex(params?: NativeApi.CrmContactPeopleIndexData["query"], config?: RequestConfig): Promise<NativeApi.CrmContactPeopleIndexResponse> {
    const path = "/crm/contact-people";
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.CrmContactPeopleIndexResponse>(path, params, config);
  }

  /** Find visible CRM contact duplicate suggestions */
  async crmContactPeopleDuplicates(person: string, params?: NativeApi.CrmContactPeopleDuplicatesData["query"], config?: RequestConfig): Promise<NativeApi.CrmContactPeopleDuplicatesResponse> {
    const path = this.buildPath("/crm/contact-people/{person}/duplicates", { "person": person });
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.CrmContactPeopleDuplicatesResponse>(path, params, config);
  }

  /** Retrieve a CRM contact person or organization */
  async crmContactPeopleShow(person: string, params?: NativeApi.CrmContactPeopleShowData["query"], config?: RequestConfig): Promise<NativeApi.CrmContactPeopleShowResponse> {
    const path = this.buildPath("/crm/contact-people/{person}", { "person": person });
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.CrmContactPeopleShowResponse>(path, params, config);
  }

  /** Update a CRM contact person or organization */
  async crmContactPeopleUpdate(person: string, body: NativeApi.CrmContactPeopleUpdateData["body"], config?: RequestConfig): Promise<NativeApi.CrmContactPeopleUpdateResponse> {
    const path = this.buildPath("/crm/contact-people/{person}", { "person": person });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmContactPeopleUpdateResponse>("PATCH", path, body, config);
  }

  /** List authorized CRM contact relationship options */
  async crmContactPeopleOptions(params: NativeApi.CrmContactPeopleOptionsData["query"], config?: RequestConfig): Promise<NativeApi.CrmContactPeopleOptionsResponse> {
    const path = "/crm/contact-people/options";
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.CrmContactPeopleOptionsResponse>(path, params, config);
  }

  /** Merge CRM contact people or organizations */
  async crmContactPeopleMerge(body: NativeApi.CrmContactPeopleMergeData["body"], config?: RequestConfig): Promise<NativeApi.CrmContactPeopleMergeResponse> {
    const path = "/crm/contact-people/merge";
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmContactPeopleMergeResponse>("POST", path, body, config);
  }

  /** Preview CRM contact normalization */
  async crmContactPeopleNormalize(body: NativeApi.CrmContactPeopleNormalizeData["body"], config?: RequestConfig): Promise<NativeApi.CrmContactPeopleNormalizeResponse> {
    const path = "/crm/contact-people/normalization-preview";
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmContactPeopleNormalizeResponse>("POST", path, body, config);
  }

  /** Preview a CRM contact people merge */
  async crmContactPeopleMergePreview(body: NativeApi.CrmContactPeopleMergePreviewData["body"], config?: RequestConfig): Promise<NativeApi.CrmContactPeopleMergePreviewResponse> {
    const path = "/crm/contact-people/merge-preview";
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmContactPeopleMergePreviewResponse>("POST", path, body, config);
  }

  /** Replace CRM contact relationships */
  async crmContactPeopleRelationships(person: string, body: NativeApi.CrmContactPeopleRelationshipsData["body"], config?: RequestConfig): Promise<NativeApi.CrmContactPeopleRelationshipsResponse> {
    const path = this.buildPath("/crm/contact-people/{person}/relationships", { "person": person });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmContactPeopleRelationshipsResponse>("PUT", path, body, config);
  }
}
