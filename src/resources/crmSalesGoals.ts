// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


import type * as NativeApi from "../generated/types.gen.js";

export class CrmSalesGoalsResource extends BaseResource {
  /** Archive Sales Goal */
  async crmArchiveSalesGoal(goal: string, body: NativeApi.CrmArchiveSalesGoalData["body"], config?: RequestConfig): Promise<NativeApi.CrmArchiveSalesGoalResponse> {
    const path = this.buildPath("/crm/sales-goals/{goal}/archive", { "goal": goal });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmArchiveSalesGoalResponse>("POST", path, body, config);
  }

  /** Seleccionar el tipo comercial publicado */
  async crmBindSalesGoalDealType(body: NativeApi.CrmBindSalesGoalDealTypeData["body"], config?: RequestConfig): Promise<NativeApi.CrmBindSalesGoalDealTypeResponse> {
    const path = "/crm/sales-goals/deal-type-binding";
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmBindSalesGoalDealTypeResponse>("POST", path, body, config);
  }

  /** Consultar la selección comercial actual */
  async crmGetSalesGoalDealTypeBinding(params?: NativeApi.CrmGetSalesGoalDealTypeBindingData["query"], config?: RequestConfig): Promise<NativeApi.CrmGetSalesGoalDealTypeBindingResponse> {
    const path = "/crm/sales-goals/deal-type-binding";
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.CrmGetSalesGoalDealTypeBindingResponse>(path, params, config);
  }

  /** Create Sales Goal */
  async crmCreateSalesGoal(body: NativeApi.CrmCreateSalesGoalData["body"], config?: RequestConfig): Promise<NativeApi.CrmCreateSalesGoalResponse> {
    const path = "/crm/sales-goals";
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmCreateSalesGoalResponse>("POST", path, body, config);
  }

  /** List Sales Goals */
  async crmListSalesGoals(params?: NativeApi.CrmListSalesGoalsData["query"], config?: RequestConfig): Promise<NativeApi.CrmListSalesGoalsResponse> {
    const path = "/crm/sales-goals";
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.CrmListSalesGoalsResponse>(path, params, config);
  }

  /** Get Opportunity Health */
  async crmGetOpportunityHealth(opportunity: string, config?: RequestConfig): Promise<NativeApi.CrmGetOpportunityHealthResponse> {
    const path = this.buildPath("/crm/opportunities/{opportunity}/health", { "opportunity": opportunity });
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.CrmGetOpportunityHealthResponse>(path, undefined, config);
  }

  /** Get Sales Goal Drill Through */
  async crmGetSalesGoalDrillThrough(goal: string, params?: NativeApi.CrmGetSalesGoalDrillThroughData["query"], config?: RequestConfig): Promise<NativeApi.CrmGetSalesGoalDrillThroughResponse> {
    const path = this.buildPath("/crm/sales-goals/{goal}/drill-through", { "goal": goal });
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.CrmGetSalesGoalDrillThroughResponse>(path, params, config);
  }

  /** Get Sales Goal Progress */
  async crmGetSalesGoalProgress(goal: string, config?: RequestConfig): Promise<NativeApi.CrmGetSalesGoalProgressResponse> {
    const path = this.buildPath("/crm/sales-goals/{goal}/progress", { "goal": goal });
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.CrmGetSalesGoalProgressResponse>(path, undefined, config);
  }

  /** Update Sales Goal */
  async crmUpdateSalesGoal(goal: string, body: NativeApi.CrmUpdateSalesGoalData["body"], config?: RequestConfig): Promise<NativeApi.CrmUpdateSalesGoalResponse> {
    const path = this.buildPath("/crm/sales-goals/{goal}", { "goal": goal });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmUpdateSalesGoalResponse>("PUT", path, body, config);
  }
}
