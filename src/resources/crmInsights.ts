// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


import type * as NativeApi from "../generated/types.gen.js";

export class CrmInsightsResource extends BaseResource {
  /** POST /crm/forecast/snapshots */
  async captureSnapshot(body: NativeApi.PublicApiV1CrmInsightsCaptureSnapshotData["body"], config?: RequestConfig): Promise<NativeApi.PublicApiV1CrmInsightsCaptureSnapshotResponse> {
    const path = "/crm/forecast/snapshots";
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.PublicApiV1CrmInsightsCaptureSnapshotResponse>("POST", path, body, config);
  }

  /** GET /crm/forecast/snapshots/{snapshot}/comparison */
  async compareSnapshot(snapshot: string, params?: NativeApi.PublicApiV1CrmInsightsCompareSnapshotData["query"], config?: RequestConfig): Promise<NativeApi.PublicApiV1CrmInsightsCompareSnapshotResponse> {
    const path = this.buildPath("/crm/forecast/snapshots/{snapshot}/comparison", { "snapshot": snapshot });
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.PublicApiV1CrmInsightsCompareSnapshotResponse>(path, params, config);
  }

  /** POST /crm/forecast/adjustments */
  async createAdjustment(body: NativeApi.PublicApiV1CrmInsightsCreateAdjustmentData["body"], config?: RequestConfig): Promise<NativeApi.PublicApiV1CrmInsightsCreateAdjustmentResponse> {
    const path = "/crm/forecast/adjustments";
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.PublicApiV1CrmInsightsCreateAdjustmentResponse>("POST", path, body, config);
  }

  /** POST /crm/report-definitions */
  async createDefinition(body: NativeApi.PublicApiV1CrmInsightsCreateDefinitionData["body"], config?: RequestConfig): Promise<NativeApi.PublicApiV1CrmInsightsCreateDefinitionResponse> {
    const path = "/crm/report-definitions";
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.PublicApiV1CrmInsightsCreateDefinitionResponse>("POST", path, body, config);
  }

  /** GET /crm/report-definitions */
  async listDefinitions(params?: NativeApi.PublicApiV1CrmInsightsListDefinitionsData["query"], config?: RequestConfig): Promise<NativeApi.PublicApiV1CrmInsightsListDefinitionsResponse> {
    const path = "/crm/report-definitions";
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.PublicApiV1CrmInsightsListDefinitionsResponse>(path, params, config);
  }

  /** POST /crm/crminsights/exports */
  async export(body: NativeApi.PublicApiV1CrmInsightsExportData["body"], config?: RequestConfig): Promise<NativeApi.PublicApiV1CrmInsightsExportResponse> {
    const path = "/crm/crminsights/exports";
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.PublicApiV1CrmInsightsExportResponse>("POST", path, body, config);
  }

  /** GET /crm/crminsights/forecast */
  async forecast(params: NativeApi.PublicApiV1CrmInsightsForecastData["query"], config?: RequestConfig): Promise<NativeApi.PublicApiV1CrmInsightsForecastResponse> {
    const path = "/crm/crminsights/forecast";
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.PublicApiV1CrmInsightsForecastResponse>(path, params, config);
  }

  /** GET /crm/crminsights/funnel */
  async salesInsights(params: NativeApi.PublicApiV1CrmInsightsSalesInsightsData["query"], config?: RequestConfig): Promise<NativeApi.PublicApiV1CrmInsightsSalesInsightsResponse> {
    const path = "/crm/crminsights/funnel";
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.PublicApiV1CrmInsightsSalesInsightsResponse>(path, params, config);
  }

  /** GET /crm/crminsights/stalled */
  async stalled(params: NativeApi.PublicApiV1CrmInsightsStalledData["query"], config?: RequestConfig): Promise<NativeApi.PublicApiV1CrmInsightsStalledResponse> {
    const path = "/crm/crminsights/stalled";
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.PublicApiV1CrmInsightsStalledResponse>(path, params, config);
  }

  /** GET /crm/report-definitions/{definition}/result */
  async runDefinition(definition: string, params: NativeApi.PublicApiV1CrmInsightsRunDefinitionData["query"], config?: RequestConfig): Promise<NativeApi.PublicApiV1CrmInsightsRunDefinitionResponse> {
    const path = this.buildPath("/crm/report-definitions/{definition}/result", { "definition": definition });
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.PublicApiV1CrmInsightsRunDefinitionResponse>(path, params, config);
  }

  /** PUT /crm/report-definitions/{definition} */
  async saveDefinition(definition: string, body: NativeApi.PublicApiV1CrmInsightsSaveDefinitionData["body"], config?: RequestConfig): Promise<NativeApi.PublicApiV1CrmInsightsSaveDefinitionResponse> {
    const path = this.buildPath("/crm/report-definitions/{definition}", { "definition": definition });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.PublicApiV1CrmInsightsSaveDefinitionResponse>("PUT", path, body, config);
  }

  /** PUT /crm/forecast/adjustments/{adjustment} */
  async setAdjustment(adjustment: string, body: NativeApi.PublicApiV1CrmInsightsSetAdjustmentData["body"], config?: RequestConfig): Promise<NativeApi.PublicApiV1CrmInsightsSetAdjustmentResponse> {
    const path = this.buildPath("/crm/forecast/adjustments/{adjustment}", { "adjustment": adjustment });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.PublicApiV1CrmInsightsSetAdjustmentResponse>("PUT", path, body, config);
  }

  /** PUT /crm/crminsights/targets/{target} */
  async setTarget(target: string, body: NativeApi.PublicApiV1CrmInsightsSetTargetData["body"], config?: RequestConfig): Promise<NativeApi.PublicApiV1CrmInsightsSetTargetResponse> {
    const path = this.buildPath("/crm/crminsights/targets/{target}", { "target": target });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.PublicApiV1CrmInsightsSetTargetResponse>("PUT", path, body, config);
  }
}
