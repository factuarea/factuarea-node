// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


import type * as NativeApi from "../generated/types.gen.js";

export class CrmLeadsResource extends BaseResource {
  /** Apply Lead Score Recalculation */
  async crmApplyLeadScoreRecalculation(run: string, body: NativeApi.CrmApplyLeadScoreRecalculationData["body"], config?: RequestConfig): Promise<NativeApi.CrmApplyLeadScoreRecalculationResponse> {
    const path = this.buildPath("/crm/lead-score-runs/{run}/apply", { "run": run });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmApplyLeadScoreRecalculationResponse>("POST", path, body, config);
  }

  /** Assign Lead */
  async crmAssignLead(lead: string, body: NativeApi.CrmAssignLeadData["body"], config?: RequestConfig): Promise<NativeApi.CrmAssignLeadResponse> {
    const path = this.buildPath("/crm/leads/{lead}/owner", { "lead": lead });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmAssignLeadResponse>("PUT", path, body, config);
  }

  /** Change Lead Stage */
  async crmChangeLeadStage(lead: string, body: NativeApi.CrmChangeLeadStageData["body"], config?: RequestConfig): Promise<NativeApi.CrmChangeLeadStageResponse> {
    const path = this.buildPath("/crm/leads/{lead}/stage", { "lead": lead });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmChangeLeadStageResponse>("PUT", path, body, config);
  }

  /** Convert Lead */
  async crmConvertLead(lead: string, body: NativeApi.CrmConvertLeadData["body"], config?: RequestConfig): Promise<NativeApi.CrmConvertLeadResponse> {
    const path = this.buildPath("/crm/leads/{lead}/convert", { "lead": lead });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmConvertLeadResponse>("POST", path, body, config);
  }

  /** Create Lead */
  async crmCreateLead(body: NativeApi.CrmCreateLeadData["body"], config?: RequestConfig): Promise<NativeApi.CrmCreateLeadResponse> {
    const path = "/crm/leads";
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmCreateLeadResponse>("POST", path, body, config);
  }

  /** List Leads */
  async crmListLeads(params?: NativeApi.CrmListLeadsData["query"], config?: RequestConfig): Promise<Page<NativeApi.CrmListLeadsResponse["data"]["data"][number]>> {
    config = this._nativeConfig(config, false);
    return this._paginateEnvelope<NativeApi.CrmListLeadsResponse["data"]["data"][number]>("/crm/leads", params, "cursor", ["data"], config);
  }

  /** Delete Lead */
  async crmDeleteLead(lead: string, body: NativeApi.CrmDeleteLeadData["body"], config?: RequestConfig): Promise<NativeApi.CrmDeleteLeadResponse> {
    const path = this.buildPath("/crm/leads/{lead}", { "lead": lead });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmDeleteLeadResponse>("DELETE", path, body, config);
  }

  /** Find Lead */
  async crmFindLead(lead: string, config?: RequestConfig): Promise<NativeApi.CrmFindLeadResponse> {
    const path = this.buildPath("/crm/leads/{lead}", { "lead": lead });
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.CrmFindLeadResponse>(path, undefined, config);
  }

  /** Update Lead */
  async crmUpdateLead(lead: string, body: NativeApi.CrmUpdateLeadData["body"], config?: RequestConfig): Promise<NativeApi.CrmUpdateLeadResponse> {
    const path = this.buildPath("/crm/leads/{lead}", { "lead": lead });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmUpdateLeadResponse>("PATCH", path, body, config);
  }

  /** Disqualify Lead */
  async crmDisqualifyLead(lead: string, body: NativeApi.CrmDisqualifyLeadData["body"], config?: RequestConfig): Promise<NativeApi.CrmDisqualifyLeadResponse> {
    const path = this.buildPath("/crm/leads/{lead}/disqualify", { "lead": lead });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmDisqualifyLeadResponse>("POST", path, body, config);
  }

  /** Export Lead Data */
  async crmExportLeadData(lead: string, config?: RequestConfig): Promise<NativeApi.CrmExportLeadDataResponse> {
    const path = this.buildPath("/crm/leads/{lead}/export", { "lead": lead });
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.CrmExportLeadDataResponse>(path, undefined, config);
  }

  /** Find Lead Duplicates */
  async crmFindLeadDuplicates(lead: string, params?: NativeApi.CrmFindLeadDuplicatesData["query"], config?: RequestConfig): Promise<Page<NativeApi.CrmFindLeadDuplicatesResponse["data"]["data"][number]>> {
    config = this._nativeConfig(config, false);
    const path = this.buildPath("/crm/leads/{lead}/duplicates", { "lead": lead });
    return this._paginateEnvelope<NativeApi.CrmFindLeadDuplicatesResponse["data"]["data"][number]>(path, params, "cursor", ["data"], config);
  }

  /** Find Lead Score Recalculation Run */
  async crmFindLeadScoreRecalculationRun(run: string, params?: NativeApi.CrmFindLeadScoreRecalculationRunData["query"], config?: RequestConfig): Promise<NativeApi.CrmFindLeadScoreRecalculationRunResponse> {
    const path = this.buildPath("/crm/lead-score-runs/{run}", { "run": run });
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.CrmFindLeadScoreRecalculationRunResponse>(path, params, config);
  }

  /** Retrieve the original lead creation */
  async crmGetLeadCreateOriginal(params: NativeApi.CrmGetLeadCreateOriginalData["query"], config: RequestConfig & { idempotencyKey: string }): Promise<NativeApi.CrmGetLeadCreateOriginalResponse> {
    const path = "/crm/leads/create/original";
    config = this._nativeConfig(config, true);
    return this._get<NativeApi.CrmGetLeadCreateOriginalResponse>(path, params, config);
  }

  /** Get Lead History */
  async crmGetLeadHistory(lead: string, params?: NativeApi.CrmGetLeadHistoryData["query"], config?: RequestConfig): Promise<Page<NativeApi.CrmGetLeadHistoryResponse["data"]["data"][number]>> {
    config = this._nativeConfig(config, false);
    const path = this.buildPath("/crm/leads/{lead}/history", { "lead": lead });
    return this._paginateEnvelope<NativeApi.CrmGetLeadHistoryResponse["data"]["data"][number]>(path, params, "cursor", ["data"], config);
  }

  /** Get Lead Stats */
  async crmGetLeadStats(params?: NativeApi.CrmGetLeadStatsData["query"], config?: RequestConfig): Promise<NativeApi.CrmGetLeadStatsResponse> {
    const path = "/crm/leads/stats";
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.CrmGetLeadStatsResponse>(path, params, config);
  }

  /** Preview Lead Conversion */
  async crmPreviewLeadConversion(lead: string, body: NativeApi.CrmPreviewLeadConversionData["body"], config?: RequestConfig): Promise<NativeApi.CrmPreviewLeadConversionResponse> {
    const path = this.buildPath("/crm/leads/{lead}/conversion-preview", { "lead": lead });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmPreviewLeadConversionResponse>("POST", path, body, config);
  }

  /** Preview Lead Erasure */
  async crmPreviewLeadErasure(lead: string, body: NativeApi.CrmPreviewLeadErasureData["body"], config?: RequestConfig): Promise<NativeApi.CrmPreviewLeadErasureResponse> {
    const path = this.buildPath("/crm/leads/{lead}/erasure-preview", { "lead": lead });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmPreviewLeadErasureResponse>("POST", path, body, config);
  }

  /** Preview Lead Score Recalculation */
  async crmPreviewLeadScoreRecalculation(body: NativeApi.CrmPreviewLeadScoreRecalculationData["body"], config?: RequestConfig): Promise<NativeApi.CrmPreviewLeadScoreRecalculationResponse> {
    const path = "/crm/lead-score-runs/preview";
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmPreviewLeadScoreRecalculationResponse>("POST", path, body, config);
  }

  /** Qualify Lead */
  async crmQualifyLead(lead: string, body: NativeApi.CrmQualifyLeadData["body"], config?: RequestConfig): Promise<NativeApi.CrmQualifyLeadResponse> {
    const path = this.buildPath("/crm/leads/{lead}/qualify", { "lead": lead });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmQualifyLeadResponse>("POST", path, body, config);
  }

  /** Recalculate Lead Score */
  async crmRecalculateLeadScore(lead: string, body: NativeApi.CrmRecalculateLeadScoreData["body"], config?: RequestConfig): Promise<NativeApi.CrmRecalculateLeadScoreResponse> {
    const path = this.buildPath("/crm/leads/{lead}/score/recalculate", { "lead": lead });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmRecalculateLeadScoreResponse>("POST", path, body, config);
  }

  /** Record Lead Consent */
  async crmRecordLeadConsent(lead: string, body: NativeApi.CrmRecordLeadConsentData["body"], config?: RequestConfig): Promise<NativeApi.CrmRecordLeadConsentResponse> {
    const path = this.buildPath("/crm/leads/{lead}/consents", { "lead": lead });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmRecordLeadConsentResponse>("POST", path, body, config);
  }

  /** Reopen Lead */
  async crmReopenLead(lead: string, body: NativeApi.CrmReopenLeadData["body"], config?: RequestConfig): Promise<NativeApi.CrmReopenLeadResponse> {
    const path = this.buildPath("/crm/leads/{lead}/reopen", { "lead": lead });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmReopenLeadResponse>("POST", path, body, config);
  }

  /** Search Leads */
  async crmSearchLeads(params?: NativeApi.CrmSearchLeadsData["query"], config?: RequestConfig): Promise<Page<NativeApi.CrmSearchLeadsResponse["data"]["data"][number]>> {
    config = this._nativeConfig(config, false);
    return this._paginateEnvelope<NativeApi.CrmSearchLeadsResponse["data"]["data"][number]>("/crm/leads/search", params, "cursor", ["data"], config);
  }
}
