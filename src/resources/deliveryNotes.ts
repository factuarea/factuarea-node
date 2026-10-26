// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryOrJsonResponse, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";
import type { PublicApiV1DeliveryNotesAssignPresentationData, PublicApiV1DeliveryNotesAssignPresentationResponses, PublicApiV1DeliveryNotesBulkDeleteData, PublicApiV1DeliveryNotesBulkDeleteResponses, PublicApiV1DeliveryNotesBulkPdfData, PublicApiV1DeliveryNotesBulkSendData, PublicApiV1DeliveryNotesBulkSendResponses, PublicApiV1DeliveryNotesBulkStatusData, PublicApiV1DeliveryNotesBulkStatusResponses, PublicApiV1DeliveryNotesCancelResponses, PublicApiV1DeliveryNotesConvertData, PublicApiV1DeliveryNotesConvertResponses, PublicApiV1DeliveryNotesCreateData, PublicApiV1DeliveryNotesCreateResponses, PublicApiV1DeliveryNotesDuplicateData, PublicApiV1DeliveryNotesDuplicateResponses, PublicApiV1DeliveryNotesFindByExternalIdData, PublicApiV1DeliveryNotesFindByExternalIdResponses, PublicApiV1DeliveryNotesGetPresentationResponses, PublicApiV1DeliveryNotesListPresentationsResponses, PublicApiV1DeliveryNotesMarkDeliveredData, PublicApiV1DeliveryNotesMarkDeliveredResponses, PublicApiV1DeliveryNotesPdfResponses, PublicApiV1DeliveryNotesPublicLinkGetResponses, PublicApiV1DeliveryNotesPublicLinkUpdateData, PublicApiV1DeliveryNotesPublicLinkUpdateResponses, PublicApiV1DeliveryNotesRevisePresentationData, PublicApiV1DeliveryNotesRevisePresentationResponses, PublicApiV1DeliveryNotesSendData, PublicApiV1DeliveryNotesSendResponses, PublicApiV1DeliveryNotesShowResponses, PublicApiV1DeliveryNotesSignData, PublicApiV1DeliveryNotesSignResponses, PublicApiV1DeliveryNotesSignatureAuditsForgetResponses, PublicApiV1DeliveryNotesStatsResponses, PublicApiV1DeliveryNotesStatusesResponses, PublicApiV1DeliveryNotesUpdateData, PublicApiV1DeliveryNotesUpdateResponses } from "../generated/types.gen.js";


export class DeliveryNotesSignatureAuditsResource extends BaseResource {
  /** Forget delivery note signature PII */
  async forget(company: string, auditId: string, config?: RequestConfig): Promise<PublicApiV1DeliveryNotesSignatureAuditsForgetResponses[200]> {
    const path = this.buildPath("/companies/{company}/delivery-notes/signature-audits/{auditId}/forget", { "company": company, "auditId": auditId });
    return this._send<PublicApiV1DeliveryNotesSignatureAuditsForgetResponses[200]>("POST", path, undefined, config);
  }
}

export class DeliveryNotesPublicLinkResource extends BaseResource {
  /** Retrieve a delivery note public link */
  async get(company: string, deliveryNote: string, config?: RequestConfig): Promise<PublicApiV1DeliveryNotesPublicLinkGetResponses[200]> {
    const path = this.buildPath("/companies/{company}/delivery-notes/{delivery_note}/public-link", { "company": company, "delivery_note": deliveryNote });
    return this._get<PublicApiV1DeliveryNotesPublicLinkGetResponses[200]>(path, undefined, config);
  }

  /** Update a delivery note public link */
  async update(company: string, deliveryNote: string, body?: PublicApiV1DeliveryNotesPublicLinkUpdateData["body"], config?: RequestConfig): Promise<PublicApiV1DeliveryNotesPublicLinkUpdateResponses[200]> {
    const path = this.buildPath("/companies/{company}/delivery-notes/{delivery_note}/public-link", { "company": company, "delivery_note": deliveryNote });
    return this._send<PublicApiV1DeliveryNotesPublicLinkUpdateResponses[200]>("PATCH", path, body, config);
  }
}

export class DeliveryNotesResource extends BaseResource {
  readonly signatureAudits: DeliveryNotesSignatureAuditsResource;
  readonly publicLink: DeliveryNotesPublicLinkResource;

  constructor(client: HttpClient) {
    super(client);
    this.signatureAudits = new DeliveryNotesSignatureAuditsResource(client);
    this.publicLink = new DeliveryNotesPublicLinkResource(client);
  }

  /**
   * Assign the delivery-note visual template
   * Conditional: pass the `ETag` of the last read as `config.ifMatch`.
   */
  async assignPresentation(company: string, deliveryNote: string, body?: PublicApiV1DeliveryNotesAssignPresentationData["body"], config?: RequestConfig): Promise<PublicApiV1DeliveryNotesAssignPresentationResponses[200]> {
    const path = this.buildPath("/companies/{company}/delivery-notes/{delivery_note}/presentation", { "company": company, "delivery_note": deliveryNote });
    return this._send<PublicApiV1DeliveryNotesAssignPresentationResponses[200]>("PATCH", path, body, config);
  }

  /** Get the delivery-note presentation */
  async getPresentation(company: string, deliveryNote: string, config?: RequestConfig): Promise<PublicApiV1DeliveryNotesGetPresentationResponses[200]> {
    const path = this.buildPath("/companies/{company}/delivery-notes/{delivery_note}/presentation", { "company": company, "delivery_note": deliveryNote });
    return this._get<PublicApiV1DeliveryNotesGetPresentationResponses[200]>(path, undefined, config);
  }

  /** Bulk delete delivery notes */
  async bulkDelete(company: string, body?: PublicApiV1DeliveryNotesBulkDeleteData["body"], config?: RequestConfig): Promise<PublicApiV1DeliveryNotesBulkDeleteResponses[200]> {
    const path = this.buildPath("/companies/{company}/delivery-notes/bulk-delete", { "company": company });
    return this._send<PublicApiV1DeliveryNotesBulkDeleteResponses[200]>("POST", path, body, config);
  }

  /** Bulk download delivery note PDFs */
  async bulkPdf(company: string, body?: PublicApiV1DeliveryNotesBulkPdfData["body"], config?: RequestConfig): Promise<BinaryResponse> {
    const path = this.buildPath("/companies/{company}/delivery-notes/bulk-pdf", { "company": company });
    return this._binary(path, "POST", undefined, body, config);
  }

  /** Bulk send delivery notes */
  async bulkSend(company: string, body?: PublicApiV1DeliveryNotesBulkSendData["body"], config?: RequestConfig): Promise<PublicApiV1DeliveryNotesBulkSendResponses[200]> {
    const path = this.buildPath("/companies/{company}/delivery-notes/bulk-send", { "company": company });
    return this._send<PublicApiV1DeliveryNotesBulkSendResponses[200]>("POST", path, body, config);
  }

  /** Bulk change delivery note status */
  async bulkStatus(company: string, body?: PublicApiV1DeliveryNotesBulkStatusData["body"], config?: RequestConfig): Promise<PublicApiV1DeliveryNotesBulkStatusResponses[200]> {
    const path = this.buildPath("/companies/{company}/delivery-notes/bulk-status", { "company": company });
    return this._send<PublicApiV1DeliveryNotesBulkStatusResponses[200]>("POST", path, body, config);
  }

  /** Cancel a delivery note */
  async cancel(company: string, deliveryNote: string, config?: RequestConfig): Promise<PublicApiV1DeliveryNotesCancelResponses[200]> {
    const path = this.buildPath("/companies/{company}/delivery-notes/{delivery_note}/cancel", { "company": company, "delivery_note": deliveryNote });
    return this._send<PublicApiV1DeliveryNotesCancelResponses[200]>("POST", path, undefined, config);
  }

  /** Convert delivery note to invoice */
  async convert(company: string, deliveryNote: string, body?: PublicApiV1DeliveryNotesConvertData["body"], config?: RequestConfig): Promise<PublicApiV1DeliveryNotesConvertResponses[201]> {
    const path = this.buildPath("/companies/{company}/delivery-notes/{delivery_note}/convert", { "company": company, "delivery_note": deliveryNote });
    return this._send<PublicApiV1DeliveryNotesConvertResponses[201]>("POST", path, body, config);
  }

  /** Create a delivery note */
  async create(company: string, body?: PublicApiV1DeliveryNotesCreateData["body"], config?: RequestConfig): Promise<PublicApiV1DeliveryNotesCreateResponses[201]> {
    const path = this.buildPath("/companies/{company}/delivery-notes", { "company": company });
    return this._send<PublicApiV1DeliveryNotesCreateResponses[201]>("POST", path, body, config);
  }

  /** List all delivery notes */
  async list(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/delivery-notes", { "company": company });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Delete a delivery note */
  async delete(company: string, deliveryNote: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/delivery-notes/{delivery_note}", { "company": company, "delivery_note": deliveryNote });
    return this._send<unknown>("DELETE", path, undefined, config, { idempotent: true });
  }

  /** Retrieve a delivery note */
  async show(company: string, deliveryNote: string, config?: RequestConfig): Promise<PublicApiV1DeliveryNotesShowResponses[200]> {
    const path = this.buildPath("/companies/{company}/delivery-notes/{delivery_note}", { "company": company, "delivery_note": deliveryNote });
    return this._get<PublicApiV1DeliveryNotesShowResponses[200]>(path, undefined, config);
  }

  /** Update a delivery note */
  async update(company: string, deliveryNote: string, body?: PublicApiV1DeliveryNotesUpdateData["body"], config?: RequestConfig): Promise<PublicApiV1DeliveryNotesUpdateResponses[200]> {
    const path = this.buildPath("/companies/{company}/delivery-notes/{delivery_note}", { "company": company, "delivery_note": deliveryNote });
    return this._send<PublicApiV1DeliveryNotesUpdateResponses[200]>("PATCH", path, body, config);
  }

  /**
   * Download delivery note PDF
   * Pass the `ETag` you hold as `config.ifNoneMatch` to get a `not_modified` result when it is current.
   */
  async pdf(company: string, deliveryNote: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<BinaryOrJsonResponse<PublicApiV1DeliveryNotesPdfResponses[202]>> {
    const path = this.buildPath("/companies/{company}/delivery-notes/{delivery_note}/pdf", { "company": company, "delivery_note": deliveryNote });
    return this._binaryOrJson<PublicApiV1DeliveryNotesPdfResponses[202]>(path, "GET", params, undefined, config);
  }

  /** Duplicate a delivery note */
  async duplicate(company: string, deliveryNote: string, body?: PublicApiV1DeliveryNotesDuplicateData["body"], config?: RequestConfig): Promise<PublicApiV1DeliveryNotesDuplicateResponses[201]> {
    const path = this.buildPath("/companies/{company}/delivery-notes/{delivery_note}/duplicate", { "company": company, "delivery_note": deliveryNote });
    return this._send<PublicApiV1DeliveryNotesDuplicateResponses[201]>("POST", path, body, config);
  }

  /** Find a delivery note by external ID */
  async findByExternalId(company: string, body?: PublicApiV1DeliveryNotesFindByExternalIdData["body"], config?: RequestConfig): Promise<PublicApiV1DeliveryNotesFindByExternalIdResponses[200]> {
    const path = this.buildPath("/companies/{company}/delivery-notes/find-by-external-id", { "company": company });
    return this._send<PublicApiV1DeliveryNotesFindByExternalIdResponses[200]>("POST", path, body, config);
  }

  /** Retrieve delivery note stats */
  async stats(company: string, config?: RequestConfig): Promise<PublicApiV1DeliveryNotesStatsResponses[200]> {
    const path = this.buildPath("/companies/{company}/delivery-notes/stats", { "company": company });
    return this._get<PublicApiV1DeliveryNotesStatsResponses[200]>(path, undefined, config);
  }

  /** List delivery note statuses */
  async statuses(company: string, config?: RequestConfig): Promise<PublicApiV1DeliveryNotesStatusesResponses[200]> {
    const path = this.buildPath("/companies/{company}/delivery-notes/statuses", { "company": company });
    return this._get<PublicApiV1DeliveryNotesStatusesResponses[200]>(path, undefined, config);
  }

  /** List retained delivery-note presentations */
  async listPresentations(company: string, deliveryNote: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<PublicApiV1DeliveryNotesListPresentationsResponses[200]> {
    const path = this.buildPath("/companies/{company}/delivery-notes/{delivery_note}/presentation-history", { "company": company, "delivery_note": deliveryNote });
    return this._get<PublicApiV1DeliveryNotesListPresentationsResponses[200]>(path, params, config);
  }

  /** Mark delivery note as delivered */
  async markDelivered(company: string, deliveryNote: string, body?: PublicApiV1DeliveryNotesMarkDeliveredData["body"], config?: RequestConfig): Promise<PublicApiV1DeliveryNotesMarkDeliveredResponses[200]> {
    const path = this.buildPath("/companies/{company}/delivery-notes/{delivery_note}/mark-delivered", { "company": company, "delivery_note": deliveryNote });
    return this._send<PublicApiV1DeliveryNotesMarkDeliveredResponses[200]>("POST", path, body, config);
  }

  /** Create a delivery-note presentation revision */
  async revisePresentation(company: string, deliveryNote: string, body?: PublicApiV1DeliveryNotesRevisePresentationData["body"], config?: RequestConfig): Promise<PublicApiV1DeliveryNotesRevisePresentationResponses[201]> {
    const path = this.buildPath("/companies/{company}/delivery-notes/{delivery_note}/presentation-revisions", { "company": company, "delivery_note": deliveryNote });
    return this._send<PublicApiV1DeliveryNotesRevisePresentationResponses[201]>("POST", path, body, config);
  }

  /** Send a delivery note */
  async send(company: string, deliveryNote: string, body?: PublicApiV1DeliveryNotesSendData["body"], config?: RequestConfig): Promise<PublicApiV1DeliveryNotesSendResponses[200]> {
    const path = this.buildPath("/companies/{company}/delivery-notes/{delivery_note}/send", { "company": company, "delivery_note": deliveryNote });
    return this._send<PublicApiV1DeliveryNotesSendResponses[200]>("POST", path, body, config);
  }

  /** Sign a delivery note */
  async sign(company: string, deliveryNote: string, body?: PublicApiV1DeliveryNotesSignData["body"], config?: RequestConfig): Promise<PublicApiV1DeliveryNotesSignResponses[200]> {
    const path = this.buildPath("/companies/{company}/delivery-notes/{delivery_note}/sign", { "company": company, "delivery_note": deliveryNote });
    return this._send<PublicApiV1DeliveryNotesSignResponses[200]>("POST", path, body, config);
  }
}
