// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


import type * as NativeApi from "../generated/types.gen.js";

export class CrmOpportunitiesResource extends BaseResource {
  /** Bulk Update Opportunities */
  async crmBulkUpdateOpportunities(body: NativeApi.CrmBulkUpdateOpportunitiesData["body"], config?: RequestConfig): Promise<NativeApi.CrmBulkUpdateOpportunitiesResponse> {
    const path = "/crm/opportunity/bulk";
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmBulkUpdateOpportunitiesResponse>("POST", path, body, config);
  }

  /** Close Opportunity */
  async crmCloseOpportunity(opportunity: string, body: NativeApi.CrmCloseOpportunityData["body"], config?: RequestConfig): Promise<NativeApi.CrmCloseOpportunityResponse> {
    const path = this.buildPath("/crm/opportunity/{opportunity}/close", { "opportunity": opportunity });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmCloseOpportunityResponse>("POST", path, body, config);
  }

  /** Create Opportunity */
  async crmCreateOpportunity(body: NativeApi.CrmCreateOpportunityData["body"], config?: RequestConfig): Promise<NativeApi.CrmCreateOpportunityResponse> {
    const path = "/crm/opportunity";
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmCreateOpportunityResponse>("POST", path, body, config);
  }

  /** List Opportunities */
  async crmListOpportunities(params?: NativeApi.CrmListOpportunitiesData["query"], config?: RequestConfig): Promise<NativeApi.CrmListOpportunitiesResponse> {
    const path = "/crm/opportunity";
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.CrmListOpportunitiesResponse>(path, params, config);
  }

  /** Export Opportunities */
  async crmExportOpportunities(params: NativeApi.CrmExportOpportunitiesData["query"], config?: RequestConfig): Promise<NativeApi.CrmExportOpportunitiesResponse> {
    const path = "/crm/opportunity/export";
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.CrmExportOpportunitiesResponse>(path, params, config);
  }

  /** Retrieve the original opportunity creation */
  async crmGetOpportunityCreateOriginal(params: NativeApi.CrmGetOpportunityCreateOriginalData["query"], config: RequestConfig & { idempotencyKey: string }): Promise<NativeApi.CrmGetOpportunityCreateOriginalResponse> {
    const path = "/crm/opportunity/create/original";
    config = this._nativeConfig(config, true);
    return this._get<NativeApi.CrmGetOpportunityCreateOriginalResponse>(path, params, config);
  }

  /** Retrieve the original opportunity transition */
  async crmGetOpportunityStageOriginal(opportunity: string, params: NativeApi.CrmGetOpportunityStageOriginalData["query"], config: RequestConfig & { idempotencyKey: string }): Promise<NativeApi.CrmGetOpportunityStageOriginalResponse> {
    const path = this.buildPath("/crm/opportunity/{opportunity}/stage/original", { "opportunity": opportunity });
    config = this._nativeConfig(config, true);
    return this._get<NativeApi.CrmGetOpportunityStageOriginalResponse>(path, params, config);
  }

  /** Get Opportunity */
  async crmGetOpportunity(opportunity: string, config?: RequestConfig): Promise<NativeApi.CrmGetOpportunityResponse> {
    const path = this.buildPath("/crm/opportunity/{opportunity}", { "opportunity": opportunity });
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.CrmGetOpportunityResponse>(path, undefined, config);
  }

  /** Update Opportunity */
  async crmUpdateOpportunity(opportunity: string, body: NativeApi.CrmUpdateOpportunityData["body"], config?: RequestConfig): Promise<NativeApi.CrmUpdateOpportunityResponse> {
    const path = this.buildPath("/crm/opportunity/{opportunity}", { "opportunity": opportunity });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmUpdateOpportunityResponse>("PATCH", path, body, config);
  }

  /** Move Opportunity Stage */
  async crmMoveOpportunityStage(opportunity: string, body: NativeApi.CrmMoveOpportunityStageData["body"], config?: RequestConfig): Promise<NativeApi.CrmMoveOpportunityStageResponse> {
    const path = this.buildPath("/crm/opportunity/{opportunity}/stage", { "opportunity": opportunity });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmMoveOpportunityStageResponse>("POST", path, body, config);
  }

  /** Reopen Opportunity */
  async crmReopenOpportunity(opportunity: string, body: NativeApi.CrmReopenOpportunityData["body"], config?: RequestConfig): Promise<NativeApi.CrmReopenOpportunityResponse> {
    const path = this.buildPath("/crm/opportunity/{opportunity}/reopen", { "opportunity": opportunity });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmReopenOpportunityResponse>("POST", path, body, config);
  }

  /** Set Opportunity Participants */
  async crmSetOpportunityParticipants(opportunity: string, body: NativeApi.CrmSetOpportunityParticipantsData["body"], config?: RequestConfig): Promise<NativeApi.CrmSetOpportunityParticipantsResponse> {
    const path = this.buildPath("/crm/opportunity/{opportunity}/participants", { "opportunity": opportunity });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmSetOpportunityParticipantsResponse>("PUT", path, body, config);
  }
}
