// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";
import type { PublicApiV1TransportDocumentsCancelData, PublicApiV1TransportDocumentsCancelResponses, PublicApiV1TransportDocumentsCloseResponses, PublicApiV1TransportDocumentsCreateData, PublicApiV1TransportDocumentsCreateResponses, PublicApiV1TransportDocumentsEvidenceResponses, PublicApiV1TransportDocumentsIssueResponses, PublicApiV1TransportDocumentsModifyData, PublicApiV1TransportDocumentsModifyResponses, PublicApiV1TransportDocumentsReopenData, PublicApiV1TransportDocumentsReopenResponses, PublicApiV1TransportDocumentsSendData, PublicApiV1TransportDocumentsSendResponses, PublicApiV1TransportDocumentsShowResponses, PublicApiV1TransportDocumentsStatusesResponses, PublicApiV1TransportDocumentsSupersedeData, PublicApiV1TransportDocumentsSupersedeResponses, PublicApiV1TransportDocumentsUpdateData, PublicApiV1TransportDocumentsUpdateResponses } from "../generated/types.gen.js";


export class TransportDocumentsResource extends BaseResource {
  /** Cancel a transport document */
  async cancel(company: string, transportDocument: string, body?: PublicApiV1TransportDocumentsCancelData["body"], config?: RequestConfig): Promise<PublicApiV1TransportDocumentsCancelResponses[200]> {
    const path = this.buildPath("/companies/{company}/transport-documents/{transport_document}/cancel", { "company": company, "transport_document": transportDocument });
    return this._send<PublicApiV1TransportDocumentsCancelResponses[200]>("POST", path, body, config);
  }

  /** Close a transport document */
  async close(company: string, transportDocument: string, config?: RequestConfig): Promise<PublicApiV1TransportDocumentsCloseResponses[200]> {
    const path = this.buildPath("/companies/{company}/transport-documents/{transport_document}/close", { "company": company, "transport_document": transportDocument });
    return this._send<PublicApiV1TransportDocumentsCloseResponses[200]>("POST", path, undefined, config);
  }

  /** Create a transport document */
  async create(company: string, body?: PublicApiV1TransportDocumentsCreateData["body"], config?: RequestConfig): Promise<PublicApiV1TransportDocumentsCreateResponses[201]> {
    const path = this.buildPath("/companies/{company}/transport-documents", { "company": company });
    return this._send<PublicApiV1TransportDocumentsCreateResponses[201]>("POST", path, body, config);
  }

  /** List all transport documents */
  async index(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/transport-documents", { "company": company });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Delete a draft transport document */
  async delete(company: string, transportDocument: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/transport-documents/{transport_document}", { "company": company, "transport_document": transportDocument });
    return this._send<unknown>("DELETE", path, undefined, config);
  }

  /** Retrieve a transport document */
  async show(company: string, transportDocument: string, config?: RequestConfig): Promise<PublicApiV1TransportDocumentsShowResponses[200]> {
    const path = this.buildPath("/companies/{company}/transport-documents/{transport_document}", { "company": company, "transport_document": transportDocument });
    return this._get<PublicApiV1TransportDocumentsShowResponses[200]>(path, undefined, config);
  }

  /** Update a draft transport document */
  async update(company: string, transportDocument: string, body?: PublicApiV1TransportDocumentsUpdateData["body"], config?: RequestConfig): Promise<PublicApiV1TransportDocumentsUpdateResponses[200]> {
    const path = this.buildPath("/companies/{company}/transport-documents/{transport_document}", { "company": company, "transport_document": transportDocument });
    return this._send<PublicApiV1TransportDocumentsUpdateResponses[200]>("PATCH", path, body, config);
  }

  /** Download transport document issuance proof */
  async issuanceProof(company: string, transportDocument: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<BinaryResponse> {
    const path = this.buildPath("/companies/{company}/transport-documents/{transport_document}/issuance-proof", { "company": company, "transport_document": transportDocument });
    return this._binary(path, "GET", params, undefined, config);
  }

  /** Download transport document PDF */
  async pdf(company: string, transportDocument: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<BinaryResponse> {
    const path = this.buildPath("/companies/{company}/transport-documents/{transport_document}/pdf", { "company": company, "transport_document": transportDocument });
    return this._binary(path, "GET", params, undefined, config);
  }

  /** List transport document issuance evidence */
  async evidence(company: string, transportDocument: string, config?: RequestConfig): Promise<PublicApiV1TransportDocumentsEvidenceResponses[200]> {
    const path = this.buildPath("/companies/{company}/transport-documents/{transport_document}/evidence", { "company": company, "transport_document": transportDocument });
    return this._get<PublicApiV1TransportDocumentsEvidenceResponses[200]>(path, undefined, config);
  }

  /**
   * Download transport document QR code
   * Answers with JSON metadata by default; send `config.headers: { Accept: "image/png" }` (or another image type) to get the stored bytes.
   */
  async qr(company: string, transportDocument: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<BinaryResponse> {
    const path = this.buildPath("/companies/{company}/transport-documents/{transport_document}/qr", { "company": company, "transport_document": transportDocument });
    return this._binary(path, "GET", params, undefined, config);
  }

  /** List transport document statuses */
  async statuses(company: string, config?: RequestConfig): Promise<PublicApiV1TransportDocumentsStatusesResponses[200]> {
    const path = this.buildPath("/companies/{company}/transport-documents/statuses", { "company": company });
    return this._get<PublicApiV1TransportDocumentsStatusesResponses[200]>(path, undefined, config);
  }

  /** Issue a transport document */
  async issue(company: string, transportDocument: string, config?: RequestConfig): Promise<PublicApiV1TransportDocumentsIssueResponses[200]> {
    const path = this.buildPath("/companies/{company}/transport-documents/{transport_document}/issue", { "company": company, "transport_document": transportDocument });
    return this._send<PublicApiV1TransportDocumentsIssueResponses[200]>("POST", path, undefined, config);
  }

  /** Modify an issued transport document */
  async modify(company: string, transportDocument: string, body?: PublicApiV1TransportDocumentsModifyData["body"], config?: RequestConfig): Promise<PublicApiV1TransportDocumentsModifyResponses[200]> {
    const path = this.buildPath("/companies/{company}/transport-documents/{transport_document}/modify", { "company": company, "transport_document": transportDocument });
    return this._send<PublicApiV1TransportDocumentsModifyResponses[200]>("POST", path, body, config);
  }

  /** Reopen a transport document */
  async reopen(company: string, transportDocument: string, body?: PublicApiV1TransportDocumentsReopenData["body"], config?: RequestConfig): Promise<PublicApiV1TransportDocumentsReopenResponses[200]> {
    const path = this.buildPath("/companies/{company}/transport-documents/{transport_document}/reopen", { "company": company, "transport_document": transportDocument });
    return this._send<PublicApiV1TransportDocumentsReopenResponses[200]>("POST", path, body, config);
  }

  /** Send a transport document by email */
  async send(company: string, transportDocument: string, body?: PublicApiV1TransportDocumentsSendData["body"], config?: RequestConfig): Promise<PublicApiV1TransportDocumentsSendResponses[200]> {
    const path = this.buildPath("/companies/{company}/transport-documents/{transport_document}/send", { "company": company, "transport_document": transportDocument });
    return this._send<PublicApiV1TransportDocumentsSendResponses[200]>("POST", path, body, config);
  }

  /** Mark a transport document as superseded */
  async supersede(company: string, transportDocument: string, body?: PublicApiV1TransportDocumentsSupersedeData["body"], config?: RequestConfig): Promise<PublicApiV1TransportDocumentsSupersedeResponses[200]> {
    const path = this.buildPath("/companies/{company}/transport-documents/{transport_document}/supersede", { "company": company, "transport_document": transportDocument });
    return this._send<PublicApiV1TransportDocumentsSupersedeResponses[200]>("POST", path, body, config);
  }
}
