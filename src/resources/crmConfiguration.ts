// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


import type * as NativeApi from "../generated/types.gen.js";

export class CrmConfigurationResource extends BaseResource {
  /** ApplyPack */
  async crmConfigurationApplyPack(config?: RequestConfig): Promise<NativeApi.CrmConfigurationApplyPackResponse> {
    const path = "/crm/configuration/pack-plans/{plan}/apply";
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmConfigurationApplyPackResponse>("POST", path, undefined, config);
  }

  /** ArchiveFieldDefinition */
  async crmConfigurationArchiveFieldDefinition(id: string, body: NativeApi.CrmConfigurationArchiveFieldDefinitionData["body"], config?: RequestConfig): Promise<NativeApi.CrmConfigurationArchiveFieldDefinitionResponse> {
    const path = this.buildPath("/crm/configuration/field-definitions/{id}/archive", { "id": id });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmConfigurationArchiveFieldDefinitionResponse>("POST", path, body, config);
  }

  /** CreateCrmScoringPolicy */
  async crmConfigurationCreateCrmScoringPolicy(body: NativeApi.CrmConfigurationCreateCrmScoringPolicyData["body"], config?: RequestConfig): Promise<NativeApi.CrmConfigurationCreateCrmScoringPolicyResponse> {
    const path = "/crm/scoring-policies";
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmConfigurationCreateCrmScoringPolicyResponse>("POST", path, body, config);
  }

  /** ListCrmScoringPolicies */
  async crmConfigurationListCrmScoringPolicies(params?: NativeApi.CrmConfigurationListCrmScoringPoliciesData["query"], config?: RequestConfig): Promise<NativeApi.CrmConfigurationListCrmScoringPoliciesResponse> {
    const path = "/crm/scoring-policies";
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.CrmConfigurationListCrmScoringPoliciesResponse>(path, params, config);
  }

  /** EnableContactLifecycle */
  async crmConfigurationEnableContactLifecycle(body: NativeApi.CrmConfigurationEnableContactLifecycleData["body"], config?: RequestConfig): Promise<NativeApi.CrmConfigurationEnableContactLifecycleResponse> {
    const path = "/crm/configuration/contact-lifecycle";
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmConfigurationEnableContactLifecycleResponse>("POST", path, body, config);
  }

  /** ExportCrmFieldValues */
  async crmConfigurationExportCrmFieldValues(id: string, scope: string, config?: RequestConfig): Promise<NativeApi.CrmConfigurationExportCrmFieldValuesResponse> {
    const path = this.buildPath("/crm/configuration/values/{scope}/{id}/export", { "id": id, "scope": scope });
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.CrmConfigurationExportCrmFieldValuesResponse>(path, undefined, config);
  }

  /** GetCrmFieldValues */
  async crmConfigurationGetCrmFieldValues(id: string, scope: string, config?: RequestConfig): Promise<NativeApi.CrmConfigurationGetCrmFieldValuesResponse> {
    const path = this.buildPath("/crm/configuration/values/{scope}/{id}", { "id": id, "scope": scope });
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.CrmConfigurationGetCrmFieldValuesResponse>(path, undefined, config);
  }

  /** ReplaceCrmFieldValues */
  async crmConfigurationReplaceCrmFieldValues(id: string, scope: string, body: NativeApi.CrmConfigurationReplaceCrmFieldValuesData["body"], config?: RequestConfig): Promise<NativeApi.CrmConfigurationReplaceCrmFieldValuesResponse> {
    const path = this.buildPath("/crm/configuration/values/{scope}/{id}", { "id": id, "scope": scope });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmConfigurationReplaceCrmFieldValuesResponse>("PUT", path, body, config);
  }

  /** GetCrmOptions */
  async crmConfigurationGetCrmOptions(params: NativeApi.CrmConfigurationGetCrmOptionsData["query"], config?: RequestConfig): Promise<NativeApi.CrmConfigurationGetCrmOptionsResponse> {
    const path = "/crm/configuration/options";
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.CrmConfigurationGetCrmOptionsResponse>(path, params, config);
  }

  /** GetPackConflicts */
  async crmConfigurationGetPackConflicts(config?: RequestConfig): Promise<NativeApi.CrmConfigurationGetPackConflictsResponse> {
    const path = "/crm/configuration/pack-plans/{plan}/conflicts";
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmConfigurationGetPackConflictsResponse>("POST", path, undefined, config);
  }

  /** GetPackPlan */
  async crmConfigurationGetPackPlan(config?: RequestConfig): Promise<NativeApi.CrmConfigurationGetPackPlanResponse> {
    const path = "/crm/configuration/pack-plans/{plan}/read";
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmConfigurationGetPackPlanResponse>("POST", path, undefined, config);
  }

  /** GetOriginalPackReceipt */
  async crmConfigurationGetOriginalPackReceipt(config?: RequestConfig): Promise<NativeApi.CrmConfigurationGetOriginalPackReceiptResponse> {
    const path = "/crm/configuration/pack-original-receipts/read";
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmConfigurationGetOriginalPackReceiptResponse>("POST", path, undefined, config);
  }

  /** ListCrmConfiguration */
  async crmConfigurationListCrmConfiguration(params?: NativeApi.CrmConfigurationListCrmConfigurationData["query"], config?: RequestConfig): Promise<NativeApi.CrmConfigurationListCrmConfigurationResponse> {
    const path = "/crm/configuration";
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.CrmConfigurationListCrmConfigurationResponse>(path, params, config);
  }

  /** ListPacks */
  async crmConfigurationListPacks(config?: RequestConfig): Promise<NativeApi.CrmConfigurationListPacksResponse> {
    const path = "/crm/configuration/packs";
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.CrmConfigurationListPacksResponse>(path, undefined, config);
  }

  /** PreviewCrmFieldValues */
  async crmConfigurationPreviewCrmFieldValues(body: NativeApi.CrmConfigurationPreviewCrmFieldValuesData["body"], config?: RequestConfig): Promise<NativeApi.CrmConfigurationPreviewCrmFieldValuesResponse> {
    const path = "/crm/configuration/values/preview";
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmConfigurationPreviewCrmFieldValuesResponse>("POST", path, body, config);
  }

  /** PreviewPack */
  async crmConfigurationPreviewPack(config?: RequestConfig): Promise<NativeApi.CrmConfigurationPreviewPackResponse> {
    const path = "/crm/configuration/packs/{pack}/preview";
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmConfigurationPreviewPackResponse>("POST", path, undefined, config);
  }

  /** PublishCrmScoringPolicy */
  async crmConfigurationPublishCrmScoringPolicy(policy: string, body: NativeApi.CrmConfigurationPublishCrmScoringPolicyData["body"], config?: RequestConfig): Promise<NativeApi.CrmConfigurationPublishCrmScoringPolicyResponse> {
    const path = this.buildPath("/crm/scoring-policies/{policy}/publish", { "policy": policy });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmConfigurationPublishCrmScoringPolicyResponse>("POST", path, body, config);
  }

  /** SaveCrmScoringPolicy */
  async crmConfigurationSaveCrmScoringPolicy(policy: string, body: NativeApi.CrmConfigurationSaveCrmScoringPolicyData["body"], config?: RequestConfig): Promise<NativeApi.CrmConfigurationSaveCrmScoringPolicyResponse> {
    const path = this.buildPath("/crm/scoring-policies/{policy}", { "policy": policy });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmConfigurationSaveCrmScoringPolicyResponse>("PUT", path, body, config);
  }

  /** SaveFieldDefinition */
  async crmConfigurationSaveFieldDefinition(body: NativeApi.CrmConfigurationSaveFieldDefinitionData["body"], config?: RequestConfig): Promise<NativeApi.CrmConfigurationSaveFieldDefinitionResponse> {
    const path = "/crm/configuration/field-definitions/save";
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmConfigurationSaveFieldDefinitionResponse>("POST", path, body, config);
  }

  /** SaveFieldOption */
  async crmConfigurationSaveFieldOption(body: NativeApi.CrmConfigurationSaveFieldOptionData["body"], config?: RequestConfig): Promise<NativeApi.CrmConfigurationSaveFieldOptionResponse> {
    const path = "/crm/configuration/field-options/save";
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmConfigurationSaveFieldOptionResponse>("POST", path, body, config);
  }

  /** SaveTaxonomyTerm */
  async crmConfigurationSaveTaxonomyTerm(body: NativeApi.CrmConfigurationSaveTaxonomyTermData["body"], config?: RequestConfig): Promise<NativeApi.CrmConfigurationSaveTaxonomyTermResponse> {
    const path = "/crm/configuration/taxonomy-terms/save";
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmConfigurationSaveTaxonomyTermResponse>("POST", path, body, config);
  }

  /** SaveTaxonomy */
  async crmConfigurationSaveTaxonomy(body: NativeApi.CrmConfigurationSaveTaxonomyData["body"], config?: RequestConfig): Promise<NativeApi.CrmConfigurationSaveTaxonomyResponse> {
    const path = "/crm/configuration/taxonomies/save";
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmConfigurationSaveTaxonomyResponse>("POST", path, body, config);
  }

  /** SimulateCrmScoringPolicy */
  async crmConfigurationSimulateCrmScoringPolicy(policy: string, body: NativeApi.CrmConfigurationSimulateCrmScoringPolicyData["body"], config?: RequestConfig): Promise<NativeApi.CrmConfigurationSimulateCrmScoringPolicyResponse> {
    const path = this.buildPath("/crm/scoring-policies/{policy}/simulate", { "policy": policy });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmConfigurationSimulateCrmScoringPolicyResponse>("POST", path, body, config);
  }

  /** UndoPackInstallation */
  async crmConfigurationUndoPackInstallation(config?: RequestConfig): Promise<NativeApi.CrmConfigurationUndoPackInstallationResponse> {
    const path = "/crm/configuration/pack-installations/{installation}/undo";
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmConfigurationUndoPackInstallationResponse>("POST", path, undefined, config);
  }
}
