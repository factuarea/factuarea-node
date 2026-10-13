// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


import type * as NativeApi from "../generated/types.gen.js";

export class ServiceInsightsResource extends BaseResource {
  /** Consultar métricas CSAT */
  async getCrmServiceInsights(params: NativeApi.GetCrmServiceInsightsData["query"], config?: RequestConfig): Promise<NativeApi.GetCrmServiceInsightsResponse> {
    const path = "/crm/service-insights";
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.GetCrmServiceInsightsResponse>(path, params, config);
  }

  /** Consultar detalle de una métrica de servicio */
  async getCrmServiceInsightDrillThrough(params: NativeApi.GetCrmServiceInsightDrillThroughData["query"], config?: RequestConfig): Promise<NativeApi.GetCrmServiceInsightDrillThroughResponse> {
    const path = "/crm/service-insights/drill";
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.GetCrmServiceInsightDrillThroughResponse>(path, params, config);
  }

  /** Consultar métricas de servicio */
  async getCrmServiceMetrics(params: NativeApi.GetCrmServiceMetricsData["query"], config?: RequestConfig): Promise<NativeApi.GetCrmServiceMetricsResponse> {
    const path = "/crm/service-insights/service-metrics";
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.GetCrmServiceMetricsResponse>(path, params, config);
  }
}
