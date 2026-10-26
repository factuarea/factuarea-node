// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryOrJsonResponse, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";
import type { PublicApiV1QuotesAcceptData, PublicApiV1QuotesAcceptResponses, PublicApiV1QuotesAssignPresentationData, PublicApiV1QuotesAssignPresentationResponses, PublicApiV1QuotesBulkDeleteData, PublicApiV1QuotesBulkDeleteResponses, PublicApiV1QuotesBulkPdfData, PublicApiV1QuotesBulkSendData, PublicApiV1QuotesBulkSendResponses, PublicApiV1QuotesBulkStatusData, PublicApiV1QuotesBulkStatusResponses, PublicApiV1QuotesConvertData, PublicApiV1QuotesConvertResponses, PublicApiV1QuotesCreateData, PublicApiV1QuotesCreateResponses, PublicApiV1QuotesDuplicateData, PublicApiV1QuotesDuplicateResponses, PublicApiV1QuotesFindByExternalIdData, PublicApiV1QuotesFindByExternalIdResponses, PublicApiV1QuotesGetPresentationResponses, PublicApiV1QuotesListPresentationsResponses, PublicApiV1QuotesPdfResponses, PublicApiV1QuotesPublicLinkGetResponses, PublicApiV1QuotesPublicLinkUpdateData, PublicApiV1QuotesPublicLinkUpdateResponses, PublicApiV1QuotesRejectData, PublicApiV1QuotesRejectResponses, PublicApiV1QuotesRevisePresentationData, PublicApiV1QuotesRevisePresentationResponses, PublicApiV1QuotesSendData, PublicApiV1QuotesSendResponses, PublicApiV1QuotesShowResponses, PublicApiV1QuotesStatsResponses, PublicApiV1QuotesStatusesResponses, PublicApiV1QuotesUpdateData, PublicApiV1QuotesUpdateResponses } from "../generated/types.gen.js";


export class QuotesResource extends BaseResource {
  /** Accept a quote */
  async accept(company: string, quote: string, body?: PublicApiV1QuotesAcceptData["body"], config?: RequestConfig): Promise<PublicApiV1QuotesAcceptResponses[200]> {
    const path = this.buildPath("/companies/{company}/quotes/{quote}/accept", { "company": company, "quote": quote });
    return this._send<PublicApiV1QuotesAcceptResponses[200]>("POST", path, body, config);
  }

  /**
   * Assign the quote visual template
   * Conditional: pass the `ETag` of the last read as `config.ifMatch`.
   */
  async assignPresentation(company: string, quote: string, body?: PublicApiV1QuotesAssignPresentationData["body"], config?: RequestConfig): Promise<PublicApiV1QuotesAssignPresentationResponses[200]> {
    const path = this.buildPath("/companies/{company}/quotes/{quote}/presentation", { "company": company, "quote": quote });
    return this._send<PublicApiV1QuotesAssignPresentationResponses[200]>("PATCH", path, body, config);
  }

  /** Get the quote presentation */
  async getPresentation(company: string, quote: string, config?: RequestConfig): Promise<PublicApiV1QuotesGetPresentationResponses[200]> {
    const path = this.buildPath("/companies/{company}/quotes/{quote}/presentation", { "company": company, "quote": quote });
    return this._get<PublicApiV1QuotesGetPresentationResponses[200]>(path, undefined, config);
  }

  /** Bulk delete quotes */
  async bulkDelete(company: string, body?: PublicApiV1QuotesBulkDeleteData["body"], config?: RequestConfig): Promise<PublicApiV1QuotesBulkDeleteResponses[200]> {
    const path = this.buildPath("/companies/{company}/quotes/bulk-delete", { "company": company });
    return this._send<PublicApiV1QuotesBulkDeleteResponses[200]>("POST", path, body, config);
  }

  /** Bulk download quote PDFs */
  async bulkPdf(company: string, body?: PublicApiV1QuotesBulkPdfData["body"], config?: RequestConfig): Promise<BinaryResponse> {
    const path = this.buildPath("/companies/{company}/quotes/bulk-pdf", { "company": company });
    return this._binary(path, "POST", undefined, body, config);
  }

  /** Bulk send quotes */
  async bulkSend(company: string, body?: PublicApiV1QuotesBulkSendData["body"], config?: RequestConfig): Promise<PublicApiV1QuotesBulkSendResponses[200]> {
    const path = this.buildPath("/companies/{company}/quotes/bulk-send", { "company": company });
    return this._send<PublicApiV1QuotesBulkSendResponses[200]>("POST", path, body, config);
  }

  /** Bulk change quote status */
  async bulkStatus(company: string, body?: PublicApiV1QuotesBulkStatusData["body"], config?: RequestConfig): Promise<PublicApiV1QuotesBulkStatusResponses[200]> {
    const path = this.buildPath("/companies/{company}/quotes/bulk-status", { "company": company });
    return this._send<PublicApiV1QuotesBulkStatusResponses[200]>("POST", path, body, config);
  }

  /** Convert quote to invoice */
  async convert(company: string, quote: string, body?: PublicApiV1QuotesConvertData["body"], config?: RequestConfig): Promise<PublicApiV1QuotesConvertResponses[201]> {
    const path = this.buildPath("/companies/{company}/quotes/{quote}/convert", { "company": company, "quote": quote });
    return this._send<PublicApiV1QuotesConvertResponses[201]>("POST", path, body, config);
  }

  /** Create a quote */
  async create(company: string, body?: PublicApiV1QuotesCreateData["body"], config?: RequestConfig): Promise<PublicApiV1QuotesCreateResponses[201]> {
    const path = this.buildPath("/companies/{company}/quotes", { "company": company });
    return this._send<PublicApiV1QuotesCreateResponses[201]>("POST", path, body, config);
  }

  /** List all quotes */
  async list(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/quotes", { "company": company });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Delete a quote */
  async delete(company: string, quote: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/quotes/{quote}", { "company": company, "quote": quote });
    return this._send<unknown>("DELETE", path, undefined, config, { idempotent: true });
  }

  /** Retrieve a quote */
  async show(company: string, quote: string, config?: RequestConfig): Promise<PublicApiV1QuotesShowResponses[200]> {
    const path = this.buildPath("/companies/{company}/quotes/{quote}", { "company": company, "quote": quote });
    return this._get<PublicApiV1QuotesShowResponses[200]>(path, undefined, config);
  }

  /** Update a quote */
  async update(company: string, quote: string, body?: PublicApiV1QuotesUpdateData["body"], config?: RequestConfig): Promise<PublicApiV1QuotesUpdateResponses[200]> {
    const path = this.buildPath("/companies/{company}/quotes/{quote}", { "company": company, "quote": quote });
    return this._send<PublicApiV1QuotesUpdateResponses[200]>("PATCH", path, body, config);
  }

  /**
   * Download quote PDF
   * Pass the `ETag` you hold as `config.ifNoneMatch` to get a `not_modified` result when it is current.
   */
  async pdf(company: string, quote: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<BinaryOrJsonResponse<PublicApiV1QuotesPdfResponses[202]>> {
    const path = this.buildPath("/companies/{company}/quotes/{quote}/pdf", { "company": company, "quote": quote });
    return this._binaryOrJson<PublicApiV1QuotesPdfResponses[202]>(path, "GET", params, undefined, config);
  }

  /** Duplicate a quote */
  async duplicate(company: string, quote: string, body?: PublicApiV1QuotesDuplicateData["body"], config?: RequestConfig): Promise<PublicApiV1QuotesDuplicateResponses[201]> {
    const path = this.buildPath("/companies/{company}/quotes/{quote}/duplicate", { "company": company, "quote": quote });
    return this._send<PublicApiV1QuotesDuplicateResponses[201]>("POST", path, body, config);
  }

  /** Find a quote by external ID */
  async findByExternalId(company: string, body?: PublicApiV1QuotesFindByExternalIdData["body"], config?: RequestConfig): Promise<PublicApiV1QuotesFindByExternalIdResponses[200]> {
    const path = this.buildPath("/companies/{company}/quotes/find-by-external-id", { "company": company });
    return this._send<PublicApiV1QuotesFindByExternalIdResponses[200]>("POST", path, body, config);
  }

  /** Retrieve quote public link */
  async publicLinkGet(company: string, quote: string, config?: RequestConfig): Promise<PublicApiV1QuotesPublicLinkGetResponses[200]> {
    const path = this.buildPath("/companies/{company}/quotes/{quote}/public-link", { "company": company, "quote": quote });
    return this._get<PublicApiV1QuotesPublicLinkGetResponses[200]>(path, undefined, config);
  }

  /** Update quote public link */
  async publicLinkUpdate(company: string, quote: string, body?: PublicApiV1QuotesPublicLinkUpdateData["body"], config?: RequestConfig): Promise<PublicApiV1QuotesPublicLinkUpdateResponses[200]> {
    const path = this.buildPath("/companies/{company}/quotes/{quote}/public-link", { "company": company, "quote": quote });
    return this._send<PublicApiV1QuotesPublicLinkUpdateResponses[200]>("PATCH", path, body, config);
  }

  /** Get quote stats */
  async stats(company: string, config?: RequestConfig): Promise<PublicApiV1QuotesStatsResponses[200]> {
    const path = this.buildPath("/companies/{company}/quotes/stats", { "company": company });
    return this._get<PublicApiV1QuotesStatsResponses[200]>(path, undefined, config);
  }

  /** List retained quote presentations */
  async listPresentations(company: string, quote: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<PublicApiV1QuotesListPresentationsResponses[200]> {
    const path = this.buildPath("/companies/{company}/quotes/{quote}/presentation-history", { "company": company, "quote": quote });
    return this._get<PublicApiV1QuotesListPresentationsResponses[200]>(path, params, config);
  }

  /** List quote statuses */
  async statuses(company: string, config?: RequestConfig): Promise<PublicApiV1QuotesStatusesResponses[200]> {
    const path = this.buildPath("/companies/{company}/quotes/statuses", { "company": company });
    return this._get<PublicApiV1QuotesStatusesResponses[200]>(path, undefined, config);
  }

  /** Reject a quote */
  async reject(company: string, quote: string, body?: PublicApiV1QuotesRejectData["body"], config?: RequestConfig): Promise<PublicApiV1QuotesRejectResponses[200]> {
    const path = this.buildPath("/companies/{company}/quotes/{quote}/reject", { "company": company, "quote": quote });
    return this._send<PublicApiV1QuotesRejectResponses[200]>("POST", path, body, config);
  }

  /** Create a quote presentation revision */
  async revisePresentation(company: string, quote: string, body?: PublicApiV1QuotesRevisePresentationData["body"], config?: RequestConfig): Promise<PublicApiV1QuotesRevisePresentationResponses[201]> {
    const path = this.buildPath("/companies/{company}/quotes/{quote}/presentation-revisions", { "company": company, "quote": quote });
    return this._send<PublicApiV1QuotesRevisePresentationResponses[201]>("POST", path, body, config);
  }

  /** Send quote by email */
  async send(company: string, quote: string, body?: PublicApiV1QuotesSendData["body"], config?: RequestConfig): Promise<PublicApiV1QuotesSendResponses[200]> {
    const path = this.buildPath("/companies/{company}/quotes/{quote}/send", { "company": company, "quote": quote });
    return this._send<PublicApiV1QuotesSendResponses[200]>("POST", path, body, config);
  }
}
