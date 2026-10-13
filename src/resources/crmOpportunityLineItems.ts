// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


import type * as NativeApi from "../generated/types.gen.js";

export class CrmOpportunityLineItemsResource extends BaseResource {
  /** Add Opportunity Line */
  async crmAddOpportunityLine(opportunity: string, body: NativeApi.CrmAddOpportunityLineData["body"], config?: RequestConfig): Promise<NativeApi.CrmAddOpportunityLineResponse> {
    const path = this.buildPath("/crm/opportunity/{opportunity}/lines", { "opportunity": opportunity });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmAddOpportunityLineResponse>("POST", path, body, config);
  }

  /** Replace Opportunity Lines */
  async crmReplaceOpportunityLines(opportunity: string, body: NativeApi.CrmReplaceOpportunityLinesData["body"], config?: RequestConfig): Promise<NativeApi.CrmReplaceOpportunityLinesResponse> {
    const path = this.buildPath("/crm/opportunity/{opportunity}/lines", { "opportunity": opportunity });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmReplaceOpportunityLinesResponse>("PUT", path, body, config);
  }

  /** Get Opportunity Line Totals */
  async crmGetOpportunityLineTotals(opportunity: string, params?: NativeApi.CrmGetOpportunityLineTotalsData["query"], config?: RequestConfig): Promise<NativeApi.CrmGetOpportunityLineTotalsResponse> {
    const path = this.buildPath("/crm/opportunity/{opportunity}/lines/totals", { "opportunity": opportunity });
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.CrmGetOpportunityLineTotalsResponse>(path, params, config);
  }

  /** Get Opportunity Quote Preview */
  async crmGetOpportunityQuotePreview(opportunity: string, config?: RequestConfig): Promise<NativeApi.CrmGetOpportunityQuotePreviewResponse> {
    const path = this.buildPath("/crm/opportunity/{opportunity}/lines/quote-preview", { "opportunity": opportunity });
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.CrmGetOpportunityQuotePreviewResponse>(path, undefined, config);
  }

  /** Remove Opportunity Line */
  async crmRemoveOpportunityLine(opportunity: string, line: string, body: NativeApi.CrmRemoveOpportunityLineData["body"], config?: RequestConfig): Promise<NativeApi.CrmRemoveOpportunityLineResponse> {
    const path = this.buildPath("/crm/opportunity/{opportunity}/lines/{line}", { "opportunity": opportunity, "line": line });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmRemoveOpportunityLineResponse>("DELETE", path, body, config);
  }

  /** Update Opportunity Line */
  async crmUpdateOpportunityLine(opportunity: string, line: string, body: NativeApi.CrmUpdateOpportunityLineData["body"], config?: RequestConfig): Promise<NativeApi.CrmUpdateOpportunityLineResponse> {
    const path = this.buildPath("/crm/opportunity/{opportunity}/lines/{line}", { "opportunity": opportunity, "line": line });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmUpdateOpportunityLineResponse>("PATCH", path, body, config);
  }
}
