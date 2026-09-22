// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.0.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class InvoicesFaceSubmissionsResource extends BaseResource {
  /** List invoice FACe submissions */
  async list(company: string, invoice: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}/face-submissions", { "company": company, "invoice": invoice });
    return this._get<unknown>(path, undefined, config);
  }

  /** Submit invoice to FACe */
  async submit(company: string, invoice: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}/face-submissions", { "company": company, "invoice": invoice });
    return this._send<unknown>("POST", path, undefined, config);
  }
}

export class InvoicesQuarterlyResource extends BaseResource {
  /** List quarters with invoices */
  async available(company: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/invoices/quarterly/available-quarters", { "company": company });
    return this._get<unknown>(path, undefined, config);
  }

  /** Generate quarterly ZIP archive */
  async downloadZip(company: string, body?: unknown, config?: RequestConfig): Promise<BinaryResponse> {
    const path = this.buildPath("/companies/{company}/invoices/quarterly/download-zip", { "company": company });
    return this._binary(path, "POST", undefined, body, config);
  }

  /** Email quarterly ZIP to accountant */
  async sendEmail(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/invoices/quarterly/send-email", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }
}

export class InvoicesResource extends BaseResource {
  readonly faceSubmissions: InvoicesFaceSubmissionsResource;
  readonly quarterly: InvoicesQuarterlyResource;

  constructor(client: HttpClient) {
    super(client);
    this.faceSubmissions = new InvoicesFaceSubmissionsResource(client);
    this.quarterly = new InvoicesQuarterlyResource(client);
  }

  /** Annul an invoice */
  async annul(company: string, invoice: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}/annul", { "company": company, "invoice": invoice });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Assign a real invoice number */
  async assignRealNumber(company: string, invoice: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}/assign-real-number", { "company": company, "invoice": invoice });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Bulk create invoices */
  async bulkCreate(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/invoices/bulk-create", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Bulk delete invoices */
  async bulkDelete(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/invoices/bulk-delete", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Bulk download invoice PDFs */
  async bulkPdf(company: string, body?: unknown, config?: RequestConfig): Promise<BinaryResponse> {
    const path = this.buildPath("/companies/{company}/invoices/bulk-pdf", { "company": company });
    return this._binary(path, "POST", undefined, body, config);
  }

  /** Bulk send invoices */
  async bulkSend(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/invoices/bulk-send", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Bulk change invoice status */
  async bulkStatus(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/invoices/bulk-status", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Check annulment eligibility */
  async canAnnul(company: string, invoice: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}/can-annul", { "company": company, "invoice": invoice });
    return this._get<unknown>(path, undefined, config);
  }

  /** Check simplified invoice eligibility */
  async simplifiedEligibility(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/invoices/simplified-eligibility", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Generate corrective invoice */
  async corrective(company: string, invoice: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}/corrective", { "company": company, "invoice": invoice });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Create an invoice */
  async create(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/invoices", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** List all invoices */
  async list(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/invoices", { "company": company });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Force-create VeriFactu record for invoice */
  async verifactuCreate(company: string, invoice: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}/verifactu", { "company": company, "invoice": invoice });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Retrieve invoice VeriFactu record */
  async verifactuGet(company: string, invoice: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}/verifactu", { "company": company, "invoice": invoice });
    return this._get<unknown>(path, undefined, config);
  }

  /** Create a recurring invoice from an invoice */
  async createRecurring(company: string, invoice: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}/create-recurring", { "company": company, "invoice": invoice });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Delete an invoice */
  async delete(company: string, invoice: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}", { "company": company, "invoice": invoice });
    return this._send<unknown>("DELETE", path, undefined, config);
  }

  /** Retrieve an invoice */
  async show(company: string, invoice: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}", { "company": company, "invoice": invoice });
    return this._get<unknown>(path, undefined, config);
  }

  /** Update an invoice */
  async update(company: string, invoice: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}", { "company": company, "invoice": invoice });
    return this._send<unknown>("PATCH", path, body, config);
  }

  /** Download FacturaE XML */
  async facturae(company: string, invoice: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}/facturae", { "company": company, "invoice": invoice });
    return this._get<unknown>(path, undefined, config);
  }

  /** Download invoice PDF */
  async pdf(company: string, invoice: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<BinaryResponse> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}/pdf", { "company": company, "invoice": invoice });
    return this._binary(path, "GET", params, undefined, config);
  }

  /** Duplicate an invoice */
  async duplicate(company: string, invoice: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}/duplicate", { "company": company, "invoice": invoice });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Export invoices to a spreadsheet */
  async exportExcel(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/invoices/export/excel", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Find an invoice by external ID */
  async findByExternalId(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/invoices/find-by-external-id", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Find an invoice by number */
  async findByNumber(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/invoices/find-by-number", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Generate temporary PDF link */
  async pdfLink(company: string, invoice: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}/pdf-link", { "company": company, "invoice": invoice });
    return this._get<unknown>(path, undefined, config);
  }

  /** Retrieve invoice public link */
  async publicLinkGet(company: string, invoice: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}/public-link", { "company": company, "invoice": invoice });
    return this._get<unknown>(path, undefined, config);
  }

  /** Update invoice public link */
  async publicLinkUpdate(company: string, invoice: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}/public-link", { "company": company, "invoice": invoice });
    return this._send<unknown>("PATCH", path, body, config);
  }

  /** Get invoice statistics */
  async stats(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/invoices/stats", { "company": company });
    return this._get<unknown>(path, params, config);
  }

  /** List invoice activity */
  async activities(company: string, invoice: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}/activities", { "company": company, "invoice": invoice });
    return this._get<unknown>(path, undefined, config);
  }

  /** List corrective invoices */
  async correctives(company: string, invoice: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}/correctives", { "company": company, "invoice": invoice });
    return this._get<unknown>(path, undefined, config);
  }

  /** List invoice payments */
  async paymentsList(company: string, invoice: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}/payments", { "company": company, "invoice": invoice });
    return this._get<unknown>(path, undefined, config);
  }

  /** Register a payment */
  async paymentsCreate(company: string, invoice: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}/payments", { "company": company, "invoice": invoice });
    return this._send<unknown>("POST", path, body, config);
  }

  /** List invoice statuses */
  async statuses(company: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/invoices/statuses", { "company": company });
    return this._get<unknown>(path, undefined, config);
  }

  /** Mark invoice as paid */
  async markPaid(company: string, invoice: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}/mark-paid", { "company": company, "invoice": invoice });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Mark an invoice as sent */
  async markSent(company: string, invoice: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}/mark-sent", { "company": company, "invoice": invoice });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Preview an invoice draft PDF */
  async pdfPreview(company: string, invoice: string, config?: RequestConfig): Promise<BinaryResponse> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}/pdf/preview", { "company": company, "invoice": invoice });
    return this._binary(path, "GET", undefined, undefined, config);
  }

  /** Preview a payment reminder email */
  async reminderPreview(company: string, invoice: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}/reminder-preview", { "company": company, "invoice": invoice });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Download payment receipt PDF */
  async paymentReceipt(company: string, invoice: string, config?: RequestConfig): Promise<BinaryResponse> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}/payment-receipt", { "company": company, "invoice": invoice });
    return this._binary(path, "GET", undefined, undefined, config);
  }

  /** Reschedule an invoice */
  async reschedule(company: string, invoice: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}/reschedule", { "company": company, "invoice": invoice });
    return this._send<unknown>("PATCH", path, body, config);
  }

  /** Revert an invoice payment */
  async paymentsRevert(company: string, invoice: string, payment: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}/payments/{payment}/reversal", { "company": company, "invoice": invoice, "payment": payment });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Schedule an invoice */
  async schedule(company: string, invoice: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}/schedule", { "company": company, "invoice": invoice });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Send invoice by email */
  async send(company: string, invoice: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}/send", { "company": company, "invoice": invoice });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Send a payment reminder */
  async sendReminder(company: string, invoice: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}/send-reminder", { "company": company, "invoice": invoice });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Substitute simplified invoices with full invoice */
  async substituteSimplified(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/invoices/substitute-simplified", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Unschedule an invoice */
  async unschedule(company: string, invoice: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}/unschedule", { "company": company, "invoice": invoice });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Unsend an invoice */
  async unsend(company: string, invoice: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}/unsend", { "company": company, "invoice": invoice });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Void an invoice */
  async void(company: string, invoice: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/invoices/{invoice}/void", { "company": company, "invoice": invoice });
    return this._send<unknown>("POST", path, body, config);
  }
}
