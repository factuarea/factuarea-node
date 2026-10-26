// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, splitQueryAndConfig, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryOrJsonResponse, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";
import type { PublicApiV1InvoicesActivitiesResponses, PublicApiV1InvoicesAdministrativeRevisionsIndexResponses, PublicApiV1InvoicesAdministrativeRevisionsStoreData, PublicApiV1InvoicesAdministrativeRevisionsStoreResponses, PublicApiV1InvoicesAnnulData, PublicApiV1InvoicesAnnulResponses, PublicApiV1InvoicesAssignPresentationData, PublicApiV1InvoicesAssignPresentationResponses, PublicApiV1InvoicesAssignRealNumberResponses, PublicApiV1InvoicesBulkCreateData, PublicApiV1InvoicesBulkCreateResponses, PublicApiV1InvoicesBulkDeleteData, PublicApiV1InvoicesBulkDeleteResponses, PublicApiV1InvoicesBulkPdfData, PublicApiV1InvoicesBulkSendData, PublicApiV1InvoicesBulkSendResponses, PublicApiV1InvoicesBulkStatusData, PublicApiV1InvoicesBulkStatusResponses, PublicApiV1InvoicesCanAnnulResponses, PublicApiV1InvoicesCorrectiveData, PublicApiV1InvoicesCorrectiveResponses, PublicApiV1InvoicesCorrectivesResponses, PublicApiV1InvoicesCreateData, PublicApiV1InvoicesCreateRecurringData, PublicApiV1InvoicesCreateRecurringResponses, PublicApiV1InvoicesCreateResponses, PublicApiV1InvoicesDuplicateData, PublicApiV1InvoicesDuplicateResponses, PublicApiV1InvoicesExportExcelData, PublicApiV1InvoicesExportExcelResponses, PublicApiV1InvoicesFaceSubmissionsListResponses, PublicApiV1InvoicesFaceSubmissionsSubmitData, PublicApiV1InvoicesFaceSubmissionsSubmitResponses, PublicApiV1InvoicesFindByExternalIdData, PublicApiV1InvoicesFindByExternalIdResponses, PublicApiV1InvoicesFindByNumberData, PublicApiV1InvoicesFindByNumberResponses, PublicApiV1InvoicesGetPresentationResponses, PublicApiV1InvoicesIssueData, PublicApiV1InvoicesIssueResponses, PublicApiV1InvoicesListPresentationsResponses, PublicApiV1InvoicesMarkPaidData, PublicApiV1InvoicesMarkPaidResponses, PublicApiV1InvoicesMarkSentResponses, PublicApiV1InvoicesPaymentsCreateData, PublicApiV1InvoicesPaymentsCreateResponses, PublicApiV1InvoicesPaymentsListResponses, PublicApiV1InvoicesPaymentsRevertData, PublicApiV1InvoicesPaymentsRevertResponses, PublicApiV1InvoicesPdfLinkResponses, PublicApiV1InvoicesPdfResponses, PublicApiV1InvoicesPublicLinkGetResponses, PublicApiV1InvoicesPublicLinkUpdateData, PublicApiV1InvoicesPublicLinkUpdateResponses, PublicApiV1InvoicesQuarterlyAvailableResponses, PublicApiV1InvoicesQuarterlyDownloadZipData, PublicApiV1InvoicesQuarterlySendEmailData, PublicApiV1InvoicesQuarterlySendEmailResponses, PublicApiV1InvoicesReminderPreviewData, PublicApiV1InvoicesReminderPreviewResponses, PublicApiV1InvoicesRescheduleData, PublicApiV1InvoicesRescheduleResponses, PublicApiV1InvoicesRevisePresentationData, PublicApiV1InvoicesRevisePresentationResponses, PublicApiV1InvoicesScheduleData, PublicApiV1InvoicesScheduleResponses, PublicApiV1InvoicesSendData, PublicApiV1InvoicesSendReminderData, PublicApiV1InvoicesSendReminderResponses, PublicApiV1InvoicesSendResponses, PublicApiV1InvoicesShowResponses, PublicApiV1InvoicesSimplifiedEligibilityData, PublicApiV1InvoicesSimplifiedEligibilityResponses, PublicApiV1InvoicesStatsResponses, PublicApiV1InvoicesStatusesResponses, PublicApiV1InvoicesSubstituteSimplifiedData, PublicApiV1InvoicesSubstituteSimplifiedResponses, PublicApiV1InvoicesUnscheduleResponses, PublicApiV1InvoicesUnsendResponses, PublicApiV1InvoicesUpdateData, PublicApiV1InvoicesUpdateResponses, PublicApiV1InvoicesVerifactuCreateResponses, PublicApiV1InvoicesVerifactuGetResponses, PublicApiV1InvoicesVoidData, PublicApiV1InvoicesVoidResponses } from "../generated/types.gen.js";


export class InvoicesAdministrativeRevisionsResource extends BaseResource {
  /** Retrieve invoice administrative routing history */
  async index(company: string, invoice: string, config?: RequestConfig): Promise<PublicApiV1InvoicesAdministrativeRevisionsIndexResponses[200]> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}/administrative-revisions", { "company": company, "invoice": invoice });
    return this._get<PublicApiV1InvoicesAdministrativeRevisionsIndexResponses[200]>(path, undefined, config);
  }

  /** Revise invoice administrative routing */
  async store(company: string, invoice: string, body?: PublicApiV1InvoicesAdministrativeRevisionsStoreData["body"], config?: RequestConfig): Promise<PublicApiV1InvoicesAdministrativeRevisionsStoreResponses[201]> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}/administrative-revisions", { "company": company, "invoice": invoice });
    return this._send<PublicApiV1InvoicesAdministrativeRevisionsStoreResponses[201]>("POST", path, body, config);
  }
}

export class InvoicesFaceSubmissionsResource extends BaseResource {
  /** List invoice FACe submissions */
  async list(company: string, invoice: string, config?: RequestConfig): Promise<PublicApiV1InvoicesFaceSubmissionsListResponses[200]> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}/face-submissions", { "company": company, "invoice": invoice });
    return this._get<PublicApiV1InvoicesFaceSubmissionsListResponses[200]>(path, undefined, config);
  }

  /**
   * Prepare or continue a FACe submission
   * Never retried automatically: sends the invoice to FACe (a third party): a repeated call can submit it twice.
   */
  async submit(company: string, invoice: string, body?: PublicApiV1InvoicesFaceSubmissionsSubmitData["body"], config?: RequestConfig): Promise<PublicApiV1InvoicesFaceSubmissionsSubmitResponses[200 | 201]> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}/face-submissions", { "company": company, "invoice": invoice });
    return this._send<PublicApiV1InvoicesFaceSubmissionsSubmitResponses[200 | 201]>("POST", path, body, config, { noRetry: true });
  }
}

export class InvoicesQuarterlyResource extends BaseResource {
  /** List quarters to export */
  async available(company: string, config?: RequestConfig): Promise<PublicApiV1InvoicesQuarterlyAvailableResponses[200]> {
    const path = this.buildPath("/companies/{company}/invoices/quarterly/available-quarters", { "company": company });
    return this._get<PublicApiV1InvoicesQuarterlyAvailableResponses[200]>(path, undefined, config);
  }

  /** Generate quarterly ZIP archive */
  async downloadZip(company: string, body?: PublicApiV1InvoicesQuarterlyDownloadZipData["body"], config?: RequestConfig): Promise<BinaryResponse> {
    const path = this.buildPath("/companies/{company}/invoices/quarterly/download-zip", { "company": company });
    return this._binary(path, "POST", undefined, body, config);
  }

  /** Email quarterly ZIP to accountant */
  async sendEmail(company: string, body?: PublicApiV1InvoicesQuarterlySendEmailData["body"], config?: RequestConfig): Promise<PublicApiV1InvoicesQuarterlySendEmailResponses[200]> {
    const path = this.buildPath("/companies/{company}/invoices/quarterly/send-email", { "company": company });
    return this._send<PublicApiV1InvoicesQuarterlySendEmailResponses[200]>("POST", path, body, config);
  }
}

export class InvoicesResource extends BaseResource {
  readonly administrativeRevisions: InvoicesAdministrativeRevisionsResource;
  readonly faceSubmissions: InvoicesFaceSubmissionsResource;
  readonly quarterly: InvoicesQuarterlyResource;

  constructor(client: HttpClient) {
    super(client);
    this.administrativeRevisions = new InvoicesAdministrativeRevisionsResource(client);
    this.faceSubmissions = new InvoicesFaceSubmissionsResource(client);
    this.quarterly = new InvoicesQuarterlyResource(client);
  }

  /** Annul an invoice */
  async annul(company: string, invoice: string, body?: PublicApiV1InvoicesAnnulData["body"], config?: RequestConfig): Promise<PublicApiV1InvoicesAnnulResponses[200]> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}/annul", { "company": company, "invoice": invoice });
    return this._send<PublicApiV1InvoicesAnnulResponses[200]>("POST", path, body, config);
  }

  /**
   * Assign the invoice visual template
   * Conditional: pass the `ETag` of the last read as `config.ifMatch`.
   */
  async assignPresentation(company: string, invoice: string, body?: PublicApiV1InvoicesAssignPresentationData["body"], config?: RequestConfig): Promise<PublicApiV1InvoicesAssignPresentationResponses[200]> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}/presentation", { "company": company, "invoice": invoice });
    return this._send<PublicApiV1InvoicesAssignPresentationResponses[200]>("PATCH", path, body, config);
  }

  /** Get the invoice presentation */
  async getPresentation(company: string, invoice: string, config?: RequestConfig): Promise<PublicApiV1InvoicesGetPresentationResponses[200]> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}/presentation", { "company": company, "invoice": invoice });
    return this._get<PublicApiV1InvoicesGetPresentationResponses[200]>(path, undefined, config);
  }

  /** Assign a real invoice number */
  async assignRealNumber(company: string, invoice: string, config?: RequestConfig): Promise<PublicApiV1InvoicesAssignRealNumberResponses[200]> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}/assign-real-number", { "company": company, "invoice": invoice });
    return this._send<PublicApiV1InvoicesAssignRealNumberResponses[200]>("POST", path, undefined, config);
  }

  /** Bulk create invoices */
  async bulkCreate(company: string, body?: PublicApiV1InvoicesBulkCreateData["body"], config?: RequestConfig): Promise<PublicApiV1InvoicesBulkCreateResponses[200]> {
    const path = this.buildPath("/companies/{company}/invoices/bulk-create", { "company": company });
    return this._send<PublicApiV1InvoicesBulkCreateResponses[200]>("POST", path, body, config);
  }

  /** Bulk delete invoices */
  async bulkDelete(company: string, body?: PublicApiV1InvoicesBulkDeleteData["body"], config?: RequestConfig): Promise<PublicApiV1InvoicesBulkDeleteResponses[200]> {
    const path = this.buildPath("/companies/{company}/invoices/bulk-delete", { "company": company });
    return this._send<PublicApiV1InvoicesBulkDeleteResponses[200]>("POST", path, body, config);
  }

  /** Bulk download invoice PDFs */
  async bulkPdf(company: string, body?: PublicApiV1InvoicesBulkPdfData["body"], config?: RequestConfig): Promise<BinaryResponse> {
    const path = this.buildPath("/companies/{company}/invoices/bulk-pdf", { "company": company });
    return this._binary(path, "POST", undefined, body, config);
  }

  /** Bulk send invoices */
  async bulkSend(company: string, body?: PublicApiV1InvoicesBulkSendData["body"], config?: RequestConfig): Promise<PublicApiV1InvoicesBulkSendResponses[200]> {
    const path = this.buildPath("/companies/{company}/invoices/bulk-send", { "company": company });
    return this._send<PublicApiV1InvoicesBulkSendResponses[200]>("POST", path, body, config);
  }

  /** Bulk change invoice status */
  async bulkStatus(company: string, body?: PublicApiV1InvoicesBulkStatusData["body"], config?: RequestConfig): Promise<PublicApiV1InvoicesBulkStatusResponses[200]> {
    const path = this.buildPath("/companies/{company}/invoices/bulk-status", { "company": company });
    return this._send<PublicApiV1InvoicesBulkStatusResponses[200]>("POST", path, body, config);
  }

  /** Check annulment eligibility */
  async canAnnul(company: string, invoice: string, config?: RequestConfig): Promise<PublicApiV1InvoicesCanAnnulResponses[200]> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}/can-annul", { "company": company, "invoice": invoice });
    return this._get<PublicApiV1InvoicesCanAnnulResponses[200]>(path, undefined, config);
  }

  /** Check simplified invoice eligibility */
  async simplifiedEligibility(company: string, body?: PublicApiV1InvoicesSimplifiedEligibilityData["body"], config?: RequestConfig): Promise<PublicApiV1InvoicesSimplifiedEligibilityResponses[200]> {
    const path = this.buildPath("/companies/{company}/invoices/simplified-eligibility", { "company": company });
    return this._send<PublicApiV1InvoicesSimplifiedEligibilityResponses[200]>("POST", path, body, config);
  }

  /** Generate corrective invoice */
  async corrective(company: string, invoice: string, body?: PublicApiV1InvoicesCorrectiveData["body"], config?: RequestConfig): Promise<PublicApiV1InvoicesCorrectiveResponses[201]> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}/corrective", { "company": company, "invoice": invoice });
    return this._send<PublicApiV1InvoicesCorrectiveResponses[201]>("POST", path, body, config);
  }

  /** Create an invoice */
  async create(company: string, body?: PublicApiV1InvoicesCreateData["body"], config?: RequestConfig): Promise<PublicApiV1InvoicesCreateResponses[200 | 201]> {
    const path = this.buildPath("/companies/{company}/invoices", { "company": company });
    return this._send<PublicApiV1InvoicesCreateResponses[200 | 201]>("POST", path, body, config);
  }

  /** List all invoices */
  async list(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/invoices", { "company": company });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Force-create VeriFactu record for invoice */
  async verifactuCreate(company: string, invoice: string, config?: RequestConfig): Promise<PublicApiV1InvoicesVerifactuCreateResponses[201]> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}/verifactu", { "company": company, "invoice": invoice });
    return this._send<PublicApiV1InvoicesVerifactuCreateResponses[201]>("POST", path, undefined, config);
  }

  /** Retrieve invoice VeriFactu record */
  async verifactuGet(company: string, invoice: string, config?: RequestConfig): Promise<PublicApiV1InvoicesVerifactuGetResponses[200]> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}/verifactu", { "company": company, "invoice": invoice });
    return this._get<PublicApiV1InvoicesVerifactuGetResponses[200]>(path, undefined, config);
  }

  /** Create a recurring invoice from an invoice */
  async createRecurring(company: string, invoice: string, body?: PublicApiV1InvoicesCreateRecurringData["body"], config?: RequestConfig): Promise<PublicApiV1InvoicesCreateRecurringResponses[201]> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}/create-recurring", { "company": company, "invoice": invoice });
    return this._send<PublicApiV1InvoicesCreateRecurringResponses[201]>("POST", path, body, config);
  }

  /** Delete an invoice */
  async delete(company: string, invoice: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}", { "company": company, "invoice": invoice });
    return this._send<unknown>("DELETE", path, undefined, config, { idempotent: true });
  }

  /** Retrieve an invoice */
  async show(company: string, invoice: string, config?: RequestConfig): Promise<PublicApiV1InvoicesShowResponses[200]> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}", { "company": company, "invoice": invoice });
    return this._get<PublicApiV1InvoicesShowResponses[200]>(path, undefined, config);
  }

  /** Update an invoice */
  async update(company: string, invoice: string, body?: PublicApiV1InvoicesUpdateData["body"], config?: RequestConfig): Promise<PublicApiV1InvoicesUpdateResponses[200]> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}", { "company": company, "invoice": invoice });
    return this._send<PublicApiV1InvoicesUpdateResponses[200]>("PATCH", path, body, config);
  }

  /** Download current or retained Facturae XML */
  async facturae(company: string, invoice: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<BinaryResponse> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}/facturae", { "company": company, "invoice": invoice });
    return this._binary(path, "GET", params, undefined, config);
  }

  /**
   * Download invoice PDF
   * Pass the `ETag` you hold as `config.ifNoneMatch` to get a `not_modified` result when it is current.
   */
  async pdf(company: string, invoice: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<BinaryOrJsonResponse<PublicApiV1InvoicesPdfResponses[202]>> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}/pdf", { "company": company, "invoice": invoice });
    return this._binaryOrJson<PublicApiV1InvoicesPdfResponses[202]>(path, "GET", params, undefined, config);
  }

  /** Duplicate an invoice */
  async duplicate(company: string, invoice: string, body?: PublicApiV1InvoicesDuplicateData["body"], config?: RequestConfig): Promise<PublicApiV1InvoicesDuplicateResponses[201]> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}/duplicate", { "company": company, "invoice": invoice });
    return this._send<PublicApiV1InvoicesDuplicateResponses[201]>("POST", path, body, config);
  }

  /** Export invoices to a spreadsheet */
  async exportExcel(company: string, body?: PublicApiV1InvoicesExportExcelData["body"], config?: RequestConfig): Promise<PublicApiV1InvoicesExportExcelResponses[200]> {
    const path = this.buildPath("/companies/{company}/invoices/export/excel", { "company": company });
    return this._send<PublicApiV1InvoicesExportExcelResponses[200]>("POST", path, body, config);
  }

  /** Find an invoice by external ID */
  async findByExternalId(company: string, body?: PublicApiV1InvoicesFindByExternalIdData["body"], config?: RequestConfig): Promise<PublicApiV1InvoicesFindByExternalIdResponses[200]> {
    const path = this.buildPath("/companies/{company}/invoices/find-by-external-id", { "company": company });
    return this._send<PublicApiV1InvoicesFindByExternalIdResponses[200]>("POST", path, body, config);
  }

  /** Find an invoice by number */
  async findByNumber(company: string, body?: PublicApiV1InvoicesFindByNumberData["body"], config?: RequestConfig): Promise<PublicApiV1InvoicesFindByNumberResponses[200]> {
    const path = this.buildPath("/companies/{company}/invoices/find-by-number", { "company": company });
    return this._send<PublicApiV1InvoicesFindByNumberResponses[200]>("POST", path, body, config);
  }

  /** Generate temporary PDF link */
  pdfLink(company: string, invoice: string, config?: RequestConfig): Promise<PublicApiV1InvoicesPdfLinkResponses[200 | 202]>;
  pdfLink(company: string, invoice: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<PublicApiV1InvoicesPdfLinkResponses[200 | 202]>;
  async pdfLink(company: string, invoice: string, paramsOrConfig?: Record<string, unknown> | RequestConfig, config?: RequestConfig): Promise<PublicApiV1InvoicesPdfLinkResponses[200 | 202]> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}/pdf-link", { "company": company, "invoice": invoice });
    const args = splitQueryAndConfig(paramsOrConfig, config);
    return this._get<PublicApiV1InvoicesPdfLinkResponses[200 | 202]>(path, args.params, args.config);
  }

  /** Retrieve invoice public link */
  async publicLinkGet(company: string, invoice: string, config?: RequestConfig): Promise<PublicApiV1InvoicesPublicLinkGetResponses[200]> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}/public-link", { "company": company, "invoice": invoice });
    return this._get<PublicApiV1InvoicesPublicLinkGetResponses[200]>(path, undefined, config);
  }

  /** Update invoice public link */
  async publicLinkUpdate(company: string, invoice: string, body?: PublicApiV1InvoicesPublicLinkUpdateData["body"], config?: RequestConfig): Promise<PublicApiV1InvoicesPublicLinkUpdateResponses[200]> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}/public-link", { "company": company, "invoice": invoice });
    return this._send<PublicApiV1InvoicesPublicLinkUpdateResponses[200]>("PATCH", path, body, config);
  }

  /** Get invoice statistics */
  async stats(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<PublicApiV1InvoicesStatsResponses[200]> {
    const path = this.buildPath("/companies/{company}/invoices/stats", { "company": company });
    return this._get<PublicApiV1InvoicesStatsResponses[200]>(path, params, config);
  }

  /** Issue an invoice */
  async issue(company: string, invoice: string, body?: PublicApiV1InvoicesIssueData["body"], config?: RequestConfig): Promise<PublicApiV1InvoicesIssueResponses[200]> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}/issue", { "company": company, "invoice": invoice });
    return this._send<PublicApiV1InvoicesIssueResponses[200]>("POST", path, body, config);
  }

  /** List retained invoice presentations */
  async listPresentations(company: string, invoice: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<PublicApiV1InvoicesListPresentationsResponses[200]> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}/presentation-history", { "company": company, "invoice": invoice });
    return this._get<PublicApiV1InvoicesListPresentationsResponses[200]>(path, params, config);
  }

  /** List invoice activity */
  async activities(company: string, invoice: string, config?: RequestConfig): Promise<PublicApiV1InvoicesActivitiesResponses[200]> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}/activities", { "company": company, "invoice": invoice });
    return this._get<PublicApiV1InvoicesActivitiesResponses[200]>(path, undefined, config);
  }

  /** List corrective invoices */
  async correctives(company: string, invoice: string, config?: RequestConfig): Promise<PublicApiV1InvoicesCorrectivesResponses[200]> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}/correctives", { "company": company, "invoice": invoice });
    return this._get<PublicApiV1InvoicesCorrectivesResponses[200]>(path, undefined, config);
  }

  /** List invoice payments */
  async paymentsList(company: string, invoice: string, config?: RequestConfig): Promise<PublicApiV1InvoicesPaymentsListResponses[200]> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}/payments", { "company": company, "invoice": invoice });
    return this._get<PublicApiV1InvoicesPaymentsListResponses[200]>(path, undefined, config);
  }

  /** Register a payment */
  async paymentsCreate(company: string, invoice: string, body?: PublicApiV1InvoicesPaymentsCreateData["body"], config?: RequestConfig): Promise<PublicApiV1InvoicesPaymentsCreateResponses[201]> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}/payments", { "company": company, "invoice": invoice });
    return this._send<PublicApiV1InvoicesPaymentsCreateResponses[201]>("POST", path, body, config);
  }

  /** List invoice statuses */
  async statuses(company: string, config?: RequestConfig): Promise<PublicApiV1InvoicesStatusesResponses[200]> {
    const path = this.buildPath("/companies/{company}/invoices/statuses", { "company": company });
    return this._get<PublicApiV1InvoicesStatusesResponses[200]>(path, undefined, config);
  }

  /** Mark invoice as paid */
  async markPaid(company: string, invoice: string, body?: PublicApiV1InvoicesMarkPaidData["body"], config?: RequestConfig): Promise<PublicApiV1InvoicesMarkPaidResponses[200]> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}/mark-paid", { "company": company, "invoice": invoice });
    return this._send<PublicApiV1InvoicesMarkPaidResponses[200]>("POST", path, body, config);
  }

  /** Mark an invoice as sent */
  async markSent(company: string, invoice: string, config?: RequestConfig): Promise<PublicApiV1InvoicesMarkSentResponses[200]> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}/mark-sent", { "company": company, "invoice": invoice });
    return this._send<PublicApiV1InvoicesMarkSentResponses[200]>("POST", path, undefined, config);
  }

  /** Preview an invoice draft PDF */
  async pdfPreview(company: string, invoice: string, config?: RequestConfig): Promise<BinaryResponse> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}/pdf/preview", { "company": company, "invoice": invoice });
    return this._binary(path, "GET", undefined, undefined, config);
  }

  /** Preview a payment reminder email */
  async reminderPreview(company: string, invoice: string, body?: PublicApiV1InvoicesReminderPreviewData["body"], config?: RequestConfig): Promise<PublicApiV1InvoicesReminderPreviewResponses[200]> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}/reminder-preview", { "company": company, "invoice": invoice });
    return this._send<PublicApiV1InvoicesReminderPreviewResponses[200]>("POST", path, body, config);
  }

  /** Download the receipt PDF of a payment */
  async paymentReceipt(company: string, invoice: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<BinaryResponse> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}/payment-receipt", { "company": company, "invoice": invoice });
    return this._binary(path, "GET", params, undefined, config);
  }

  /** Reschedule an invoice */
  async reschedule(company: string, invoice: string, body?: PublicApiV1InvoicesRescheduleData["body"], config?: RequestConfig): Promise<PublicApiV1InvoicesRescheduleResponses[200]> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}/reschedule", { "company": company, "invoice": invoice });
    return this._send<PublicApiV1InvoicesRescheduleResponses[200]>("PATCH", path, body, config);
  }

  /** Revert an invoice payment */
  async paymentsRevert(company: string, invoice: string, payment: string, body?: PublicApiV1InvoicesPaymentsRevertData["body"], config?: RequestConfig): Promise<PublicApiV1InvoicesPaymentsRevertResponses[200]> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}/payments/{payment}/reversal", { "company": company, "invoice": invoice, "payment": payment });
    return this._send<PublicApiV1InvoicesPaymentsRevertResponses[200]>("POST", path, body, config);
  }

  /** Create an invoice presentation revision */
  async revisePresentation(company: string, invoice: string, body?: PublicApiV1InvoicesRevisePresentationData["body"], config?: RequestConfig): Promise<PublicApiV1InvoicesRevisePresentationResponses[201]> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}/presentation-revisions", { "company": company, "invoice": invoice });
    return this._send<PublicApiV1InvoicesRevisePresentationResponses[201]>("POST", path, body, config);
  }

  /** Schedule an invoice */
  async schedule(company: string, invoice: string, body?: PublicApiV1InvoicesScheduleData["body"], config?: RequestConfig): Promise<PublicApiV1InvoicesScheduleResponses[200]> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}/schedule", { "company": company, "invoice": invoice });
    return this._send<PublicApiV1InvoicesScheduleResponses[200]>("POST", path, body, config);
  }

  /** Send invoice by email */
  async send(company: string, invoice: string, body?: PublicApiV1InvoicesSendData["body"], config?: RequestConfig): Promise<PublicApiV1InvoicesSendResponses[200]> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}/send", { "company": company, "invoice": invoice });
    return this._send<PublicApiV1InvoicesSendResponses[200]>("POST", path, body, config);
  }

  /** Send a payment reminder */
  async sendReminder(company: string, invoice: string, body?: PublicApiV1InvoicesSendReminderData["body"], config?: RequestConfig): Promise<PublicApiV1InvoicesSendReminderResponses[200]> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}/send-reminder", { "company": company, "invoice": invoice });
    return this._send<PublicApiV1InvoicesSendReminderResponses[200]>("POST", path, body, config);
  }

  /** Substitute simplified invoices with full invoice */
  async substituteSimplified(company: string, body?: PublicApiV1InvoicesSubstituteSimplifiedData["body"], config?: RequestConfig): Promise<PublicApiV1InvoicesSubstituteSimplifiedResponses[201]> {
    const path = this.buildPath("/companies/{company}/invoices/substitute-simplified", { "company": company });
    return this._send<PublicApiV1InvoicesSubstituteSimplifiedResponses[201]>("POST", path, body, config);
  }

  /** Unschedule an invoice */
  async unschedule(company: string, invoice: string, config?: RequestConfig): Promise<PublicApiV1InvoicesUnscheduleResponses[200]> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}/unschedule", { "company": company, "invoice": invoice });
    return this._send<PublicApiV1InvoicesUnscheduleResponses[200]>("POST", path, undefined, config);
  }

  /** Unsend an invoice */
  async unsend(company: string, invoice: string, config?: RequestConfig): Promise<PublicApiV1InvoicesUnsendResponses[200]> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}/unsend", { "company": company, "invoice": invoice });
    return this._send<PublicApiV1InvoicesUnsendResponses[200]>("POST", path, undefined, config);
  }

  /** Void an invoice */
  async void(company: string, invoice: string, body?: PublicApiV1InvoicesVoidData["body"], config?: RequestConfig): Promise<PublicApiV1InvoicesVoidResponses[200]> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}/void", { "company": company, "invoice": invoice });
    return this._send<PublicApiV1InvoicesVoidResponses[200]>("POST", path, body, config);
  }
}
