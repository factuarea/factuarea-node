// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


import type * as NativeApi from "../generated/types.gen.js";

export class CrmOpportunitydocumentsResource extends BaseResource {
  /** Create Opportunity Quote */
  async crmCreateOpportunityQuote(opportunity: string, body: NativeApi.CrmCreateOpportunityQuoteData["body"], config?: RequestConfig): Promise<NativeApi.CrmCreateOpportunityQuoteResponse> {
    const path = this.buildPath("/crm/opportunitydocuments/{opportunity}/quotes", { "opportunity": opportunity });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmCreateOpportunityQuoteResponse>("POST", path, body, config);
  }

  /** Get Opportunity Financial Summary */
  async crmGetOpportunityFinancialSummary(opportunity: string, config?: RequestConfig): Promise<NativeApi.CrmGetOpportunityFinancialSummaryResponse> {
    const path = this.buildPath("/crm/opportunitydocuments/{opportunity}/financial-summary", { "opportunity": opportunity });
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.CrmGetOpportunityFinancialSummaryResponse>(path, undefined, config);
  }

  /** Link Opportunity Document */
  async crmLinkOpportunityDocument(opportunity: string, body: NativeApi.CrmLinkOpportunityDocumentData["body"], config?: RequestConfig): Promise<NativeApi.CrmLinkOpportunityDocumentResponse> {
    const path = this.buildPath("/crm/opportunitydocuments/{opportunity}/documents", { "opportunity": opportunity });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmLinkOpportunityDocumentResponse>("POST", path, body, config);
  }

  /** List Opportunity Documents */
  async crmListOpportunityDocuments(opportunity: string, params?: NativeApi.CrmListOpportunityDocumentsData["query"], config?: RequestConfig): Promise<NativeApi.CrmListOpportunityDocumentsResponse> {
    const path = this.buildPath("/crm/opportunitydocuments/{opportunity}/documents", { "opportunity": opportunity });
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.CrmListOpportunityDocumentsResponse>(path, params, config);
  }

  /** Buscar candidatos documentales autorizados de una oportunidad */
  async crmListOpportunityDocumentCandidates(opportunity: string, params: NativeApi.CrmListOpportunityDocumentCandidatesData["query"], config?: RequestConfig): Promise<NativeApi.CrmListOpportunityDocumentCandidatesResponse> {
    const path = this.buildPath("/crm/opportunities/{opportunity}/documents/candidates", { "opportunity": opportunity });
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.CrmListOpportunityDocumentCandidatesResponse>(path, params, config);
  }

  /** Unlink Opportunity Document */
  async crmUnlinkOpportunityDocument(opportunity: string, link: string, body: NativeApi.CrmUnlinkOpportunityDocumentData["body"], config?: RequestConfig): Promise<NativeApi.CrmUnlinkOpportunityDocumentResponse> {
    const path = this.buildPath("/crm/opportunitydocuments/{opportunity}/documents/{link}", { "opportunity": opportunity, "link": link });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CrmUnlinkOpportunityDocumentResponse>("DELETE", path, body, config);
  }
}
