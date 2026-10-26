// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryOrJsonResponse, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";
import type { PublicApiV1ProformasAcceptData, PublicApiV1ProformasAcceptResponses, PublicApiV1ProformasAssignPresentationData, PublicApiV1ProformasAssignPresentationResponses, PublicApiV1ProformasBulkDeleteData, PublicApiV1ProformasBulkDeleteResponses, PublicApiV1ProformasBulkPdfData, PublicApiV1ProformasBulkSendData, PublicApiV1ProformasBulkSendResponses, PublicApiV1ProformasBulkStatusData, PublicApiV1ProformasBulkStatusResponses, PublicApiV1ProformasConvertData, PublicApiV1ProformasConvertResponses, PublicApiV1ProformasCreateData, PublicApiV1ProformasCreateResponses, PublicApiV1ProformasDuplicateData, PublicApiV1ProformasDuplicateResponses, PublicApiV1ProformasFindByExternalIdData, PublicApiV1ProformasFindByExternalIdResponses, PublicApiV1ProformasGetPresentationResponses, PublicApiV1ProformasListPresentationsResponses, PublicApiV1ProformasPdfResponses, PublicApiV1ProformasPublicLinkGetResponses, PublicApiV1ProformasPublicLinkUpdateData, PublicApiV1ProformasPublicLinkUpdateResponses, PublicApiV1ProformasRejectData, PublicApiV1ProformasRejectResponses, PublicApiV1ProformasRevisePresentationData, PublicApiV1ProformasRevisePresentationResponses, PublicApiV1ProformasSendData, PublicApiV1ProformasSendResponses, PublicApiV1ProformasShowResponses, PublicApiV1ProformasStatsResponses, PublicApiV1ProformasStatusesResponses, PublicApiV1ProformasUpdateData, PublicApiV1ProformasUpdateResponses } from "../generated/types.gen.js";


export class ProformasResource extends BaseResource {
  /** Accept a proforma */
  async accept(company: string, proforma: string, body?: PublicApiV1ProformasAcceptData["body"], config?: RequestConfig): Promise<PublicApiV1ProformasAcceptResponses[200]> {
    const path = this.buildPath("/companies/{company}/proformas/{proforma}/accept", { "company": company, "proforma": proforma });
    return this._send<PublicApiV1ProformasAcceptResponses[200]>("POST", path, body, config);
  }

  /**
   * Assign the proforma visual template
   * Conditional: pass the `ETag` of the last read as `config.ifMatch`.
   */
  async assignPresentation(company: string, proforma: string, body?: PublicApiV1ProformasAssignPresentationData["body"], config?: RequestConfig): Promise<PublicApiV1ProformasAssignPresentationResponses[200]> {
    const path = this.buildPath("/companies/{company}/proformas/{proforma}/presentation", { "company": company, "proforma": proforma });
    return this._send<PublicApiV1ProformasAssignPresentationResponses[200]>("PATCH", path, body, config);
  }

  /** Get the proforma presentation */
  async getPresentation(company: string, proforma: string, config?: RequestConfig): Promise<PublicApiV1ProformasGetPresentationResponses[200]> {
    const path = this.buildPath("/companies/{company}/proformas/{proforma}/presentation", { "company": company, "proforma": proforma });
    return this._get<PublicApiV1ProformasGetPresentationResponses[200]>(path, undefined, config);
  }

  /** Bulk delete proformas */
  async bulkDelete(company: string, body?: PublicApiV1ProformasBulkDeleteData["body"], config?: RequestConfig): Promise<PublicApiV1ProformasBulkDeleteResponses[200]> {
    const path = this.buildPath("/companies/{company}/proformas/bulk-delete", { "company": company });
    return this._send<PublicApiV1ProformasBulkDeleteResponses[200]>("POST", path, body, config);
  }

  /** Bulk download proforma PDFs */
  async bulkPdf(company: string, body?: PublicApiV1ProformasBulkPdfData["body"], config?: RequestConfig): Promise<BinaryResponse> {
    const path = this.buildPath("/companies/{company}/proformas/bulk-pdf", { "company": company });
    return this._binary(path, "POST", undefined, body, config);
  }

  /** Bulk send proformas */
  async bulkSend(company: string, body?: PublicApiV1ProformasBulkSendData["body"], config?: RequestConfig): Promise<PublicApiV1ProformasBulkSendResponses[200]> {
    const path = this.buildPath("/companies/{company}/proformas/bulk-send", { "company": company });
    return this._send<PublicApiV1ProformasBulkSendResponses[200]>("POST", path, body, config);
  }

  /** Bulk change proforma status */
  async bulkStatus(company: string, body?: PublicApiV1ProformasBulkStatusData["body"], config?: RequestConfig): Promise<PublicApiV1ProformasBulkStatusResponses[200]> {
    const path = this.buildPath("/companies/{company}/proformas/bulk-status", { "company": company });
    return this._send<PublicApiV1ProformasBulkStatusResponses[200]>("POST", path, body, config);
  }

  /** Convert proforma to invoice */
  async convert(company: string, proforma: string, body?: PublicApiV1ProformasConvertData["body"], config?: RequestConfig): Promise<PublicApiV1ProformasConvertResponses[201]> {
    const path = this.buildPath("/companies/{company}/proformas/{proforma}/convert", { "company": company, "proforma": proforma });
    return this._send<PublicApiV1ProformasConvertResponses[201]>("POST", path, body, config);
  }

  /** Create a proforma */
  async create(company: string, body?: PublicApiV1ProformasCreateData["body"], config?: RequestConfig): Promise<PublicApiV1ProformasCreateResponses[201]> {
    const path = this.buildPath("/companies/{company}/proformas", { "company": company });
    return this._send<PublicApiV1ProformasCreateResponses[201]>("POST", path, body, config);
  }

  /** List all proformas */
  async list(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/proformas", { "company": company });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Delete a proforma */
  async delete(company: string, proforma: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/proformas/{proforma}", { "company": company, "proforma": proforma });
    return this._send<unknown>("DELETE", path, undefined, config, { idempotent: true });
  }

  /** Retrieve a proforma */
  async show(company: string, proforma: string, config?: RequestConfig): Promise<PublicApiV1ProformasShowResponses[200]> {
    const path = this.buildPath("/companies/{company}/proformas/{proforma}", { "company": company, "proforma": proforma });
    return this._get<PublicApiV1ProformasShowResponses[200]>(path, undefined, config);
  }

  /** Update a proforma */
  async update(company: string, proforma: string, body?: PublicApiV1ProformasUpdateData["body"], config?: RequestConfig): Promise<PublicApiV1ProformasUpdateResponses[200]> {
    const path = this.buildPath("/companies/{company}/proformas/{proforma}", { "company": company, "proforma": proforma });
    return this._send<PublicApiV1ProformasUpdateResponses[200]>("PATCH", path, body, config);
  }

  /**
   * Download proforma PDF
   * Pass the `ETag` you hold as `config.ifNoneMatch` to get a `not_modified` result when it is current.
   */
  async pdf(company: string, proforma: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<BinaryOrJsonResponse<PublicApiV1ProformasPdfResponses[202]>> {
    const path = this.buildPath("/companies/{company}/proformas/{proforma}/pdf", { "company": company, "proforma": proforma });
    return this._binaryOrJson<PublicApiV1ProformasPdfResponses[202]>(path, "GET", params, undefined, config);
  }

  /** Duplicate a proforma */
  async duplicate(company: string, proforma: string, body?: PublicApiV1ProformasDuplicateData["body"], config?: RequestConfig): Promise<PublicApiV1ProformasDuplicateResponses[201]> {
    const path = this.buildPath("/companies/{company}/proformas/{proforma}/duplicate", { "company": company, "proforma": proforma });
    return this._send<PublicApiV1ProformasDuplicateResponses[201]>("POST", path, body, config);
  }

  /** Find a proforma by external ID */
  async findByExternalId(company: string, body?: PublicApiV1ProformasFindByExternalIdData["body"], config?: RequestConfig): Promise<PublicApiV1ProformasFindByExternalIdResponses[200]> {
    const path = this.buildPath("/companies/{company}/proformas/find-by-external-id", { "company": company });
    return this._send<PublicApiV1ProformasFindByExternalIdResponses[200]>("POST", path, body, config);
  }

  /** Retrieve proforma public link */
  async publicLinkGet(company: string, proforma: string, config?: RequestConfig): Promise<PublicApiV1ProformasPublicLinkGetResponses[200]> {
    const path = this.buildPath("/companies/{company}/proformas/{proforma}/public-link", { "company": company, "proforma": proforma });
    return this._get<PublicApiV1ProformasPublicLinkGetResponses[200]>(path, undefined, config);
  }

  /** Update proforma public link */
  async publicLinkUpdate(company: string, proforma: string, body?: PublicApiV1ProformasPublicLinkUpdateData["body"], config?: RequestConfig): Promise<PublicApiV1ProformasPublicLinkUpdateResponses[200]> {
    const path = this.buildPath("/companies/{company}/proformas/{proforma}/public-link", { "company": company, "proforma": proforma });
    return this._send<PublicApiV1ProformasPublicLinkUpdateResponses[200]>("PATCH", path, body, config);
  }

  /** Get proforma stats */
  async stats(company: string, config?: RequestConfig): Promise<PublicApiV1ProformasStatsResponses[200]> {
    const path = this.buildPath("/companies/{company}/proformas/stats", { "company": company });
    return this._get<PublicApiV1ProformasStatsResponses[200]>(path, undefined, config);
  }

  /** List retained proforma presentations */
  async listPresentations(company: string, proforma: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<PublicApiV1ProformasListPresentationsResponses[200]> {
    const path = this.buildPath("/companies/{company}/proformas/{proforma}/presentation-history", { "company": company, "proforma": proforma });
    return this._get<PublicApiV1ProformasListPresentationsResponses[200]>(path, params, config);
  }

  /** List proforma statuses */
  async statuses(company: string, config?: RequestConfig): Promise<PublicApiV1ProformasStatusesResponses[200]> {
    const path = this.buildPath("/companies/{company}/proformas/statuses", { "company": company });
    return this._get<PublicApiV1ProformasStatusesResponses[200]>(path, undefined, config);
  }

  /** Reject a proforma */
  async reject(company: string, proforma: string, body?: PublicApiV1ProformasRejectData["body"], config?: RequestConfig): Promise<PublicApiV1ProformasRejectResponses[200]> {
    const path = this.buildPath("/companies/{company}/proformas/{proforma}/reject", { "company": company, "proforma": proforma });
    return this._send<PublicApiV1ProformasRejectResponses[200]>("POST", path, body, config);
  }

  /** Create a proforma presentation revision */
  async revisePresentation(company: string, proforma: string, body?: PublicApiV1ProformasRevisePresentationData["body"], config?: RequestConfig): Promise<PublicApiV1ProformasRevisePresentationResponses[201]> {
    const path = this.buildPath("/companies/{company}/proformas/{proforma}/presentation-revisions", { "company": company, "proforma": proforma });
    return this._send<PublicApiV1ProformasRevisePresentationResponses[201]>("POST", path, body, config);
  }

  /** Send proforma by email */
  async send(company: string, proforma: string, body?: PublicApiV1ProformasSendData["body"], config?: RequestConfig): Promise<PublicApiV1ProformasSendResponses[200]> {
    const path = this.buildPath("/companies/{company}/proformas/{proforma}/send", { "company": company, "proforma": proforma });
    return this._send<PublicApiV1ProformasSendResponses[200]>("POST", path, body, config);
  }
}
