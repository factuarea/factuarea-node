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
  async list(invoice: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/invoices/{invoice}/face-submissions", { "invoice": invoice });
    return this._get<unknown>(path, undefined, config);
  }

  /** Submit invoice to FACe */
  async submit(invoice: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/invoices/{invoice}/face-submissions", { "invoice": invoice });
    return this._send<unknown>("POST", path, undefined, config);
  }
}

export class InvoicesQuarterlyResource extends BaseResource {
  /** List quarters with invoices */
  async available(config?: RequestConfig): Promise<unknown> {
    const path = "/invoices/quarterly/available-quarters";
    return this._get<unknown>(path, undefined, config);
  }

  /** Generate quarterly ZIP archive */
  async downloadZip(body?: unknown, config?: RequestConfig): Promise<BinaryResponse> {
    const path = "/invoices/quarterly/download-zip";
    return this._binary(path, "POST", undefined, body, config);
  }

  /** Email quarterly ZIP to accountant */
  async sendEmail(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/invoices/quarterly/send-email";
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
  async annul(invoice: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/invoices/{invoice}/annul", { "invoice": invoice });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Assign a real invoice number */
  async assignRealNumber(invoice: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/invoices/{invoice}/assign-real-number", { "invoice": invoice });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Bulk create invoices */
  async bulkCreate(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/invoices/bulk-create";
    return this._send<unknown>("POST", path, body, config);
  }

  /** Bulk delete invoices */
  async bulkDelete(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/invoices/bulk-delete";
    return this._send<unknown>("POST", path, body, config);
  }

  /** Bulk download invoice PDFs */
  async bulkPdf(body?: unknown, config?: RequestConfig): Promise<BinaryResponse> {
    const path = "/invoices/bulk-pdf";
    return this._binary(path, "POST", undefined, body, config);
  }

  /** Bulk send invoices */
  async bulkSend(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/invoices/bulk-send";
    return this._send<unknown>("POST", path, body, config);
  }

  /** Bulk change invoice status */
  async bulkStatus(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/invoices/bulk-status";
    return this._send<unknown>("POST", path, body, config);
  }

  /** Check annulment eligibility */
  async canAnnul(invoice: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/invoices/{invoice}/can-annul", { "invoice": invoice });
    return this._get<unknown>(path, undefined, config);
  }

  /** Check simplified invoice eligibility */
  async simplifiedEligibility(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/invoices/simplified-eligibility";
    return this._send<unknown>("POST", path, body, config);
  }

  /** Generate corrective invoice */
  async corrective(invoice: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/invoices/{invoice}/corrective", { "invoice": invoice });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Create an invoice */
  async create(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/invoices";
    return this._send<unknown>("POST", path, body, config);
  }

  /** List all invoices */
  async list(params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    return this._paginate<unknown>("/invoices", params, "starting_after");
  }

  /** Force-create VeriFactu record for invoice */
  async verifactuCreate(invoice: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/invoices/{invoice}/verifactu", { "invoice": invoice });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Retrieve invoice VeriFactu record */
  async verifactuGet(invoice: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/invoices/{invoice}/verifactu", { "invoice": invoice });
    return this._get<unknown>(path, undefined, config);
  }

  /** Create a recurring invoice from an invoice */
  async createRecurring(invoice: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/invoices/{invoice}/create-recurring", { "invoice": invoice });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Delete an invoice */
  async delete(invoice: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/invoices/{invoice}", { "invoice": invoice });
    return this._send<unknown>("DELETE", path, undefined, config);
  }

  /** Retrieve an invoice */
  async show(invoice: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/invoices/{invoice}", { "invoice": invoice });
    return this._get<unknown>(path, undefined, config);
  }

  /** Update an invoice */
  async update(invoice: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/invoices/{invoice}", { "invoice": invoice });
    return this._send<unknown>("PUT", path, body, config);
  }

  /** Download FacturaE XML */
  async facturae(invoice: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/invoices/{invoice}/facturae", { "invoice": invoice });
    return this._get<unknown>(path, undefined, config);
  }

  /** Download invoice PDF */
  async pdf(invoice: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<BinaryResponse> {
    const path = this.buildPath("/invoices/{invoice}/pdf", { "invoice": invoice });
    return this._binary(path, "GET", params, undefined, config);
  }

  /** Duplicate an invoice */
  async duplicate(invoice: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/invoices/{invoice}/duplicate", { "invoice": invoice });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Export invoices to a spreadsheet */
  async exportExcel(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/invoices/export/excel";
    return this._send<unknown>("POST", path, body, config);
  }

  /** Find an invoice by external ID */
  async findByExternalId(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/invoices/find-by-external-id";
    return this._send<unknown>("POST", path, body, config);
  }

  /** Find an invoice by number */
  async findByNumber(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/invoices/find-by-number";
    return this._send<unknown>("POST", path, body, config);
  }

  /** Generate temporary PDF link */
  async pdfLink(invoice: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/invoices/{invoice}/pdf-link", { "invoice": invoice });
    return this._get<unknown>(path, undefined, config);
  }

  /** Retrieve invoice public link */
  async publicLinkGet(invoice: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/invoices/{invoice}/public-link", { "invoice": invoice });
    return this._get<unknown>(path, undefined, config);
  }

  /** Update invoice public link */
  async publicLinkUpdate(invoice: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/invoices/{invoice}/public-link", { "invoice": invoice });
    return this._send<unknown>("PUT", path, body, config);
  }

  /** Get invoice statistics */
  async stats(params?: Record<string, unknown>, config?: RequestConfig): Promise<unknown> {
    const path = "/invoices/stats";
    return this._get<unknown>(path, params, config);
  }

  /** List invoice activity */
  async activities(invoice: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/invoices/{invoice}/activities", { "invoice": invoice });
    return this._get<unknown>(path, undefined, config);
  }

  /** List corrective invoices */
  async correctives(invoice: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/invoices/{invoice}/correctives", { "invoice": invoice });
    return this._get<unknown>(path, undefined, config);
  }

  /** List invoice payments */
  async paymentsList(invoice: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/invoices/{invoice}/payments", { "invoice": invoice });
    return this._get<unknown>(path, undefined, config);
  }

  /** Register a payment */
  async paymentsCreate(invoice: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/invoices/{invoice}/payments", { "invoice": invoice });
    return this._send<unknown>("POST", path, body, config);
  }

  /** List invoice statuses */
  async statuses(config?: RequestConfig): Promise<unknown> {
    const path = "/invoices/statuses";
    return this._get<unknown>(path, undefined, config);
  }

  /** Mark invoice as paid */
  async markPaid(invoice: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/invoices/{invoice}/mark-paid", { "invoice": invoice });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Mark an invoice as sent */
  async markSent(invoice: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/invoices/{invoice}/mark-sent", { "invoice": invoice });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Preview an invoice draft PDF */
  async pdfPreview(invoice: string, config?: RequestConfig): Promise<BinaryResponse> {
    const path = this.buildPath("/invoices/{invoice}/pdf/preview", { "invoice": invoice });
    return this._binary(path, "GET", undefined, undefined, config);
  }

  /** Preview a payment reminder email */
  async reminderPreview(invoice: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/invoices/{invoice}/reminder-preview", { "invoice": invoice });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Download payment receipt PDF */
  async paymentReceipt(invoice: string, config?: RequestConfig): Promise<BinaryResponse> {
    const path = this.buildPath("/invoices/{invoice}/payment-receipt", { "invoice": invoice });
    return this._binary(path, "GET", undefined, undefined, config);
  }

  /** Reschedule an invoice */
  async reschedule(invoice: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/invoices/{invoice}/reschedule", { "invoice": invoice });
    return this._send<unknown>("PATCH", path, body, config);
  }

  /** Revert an invoice payment */
  async paymentsRevert(invoice: string, payment: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/invoices/{invoice}/payments/{payment}/reversal", { "invoice": invoice, "payment": payment });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Schedule an invoice */
  async schedule(invoice: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/invoices/{invoice}/schedule", { "invoice": invoice });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Send invoice by email */
  async send(invoice: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/invoices/{invoice}/send", { "invoice": invoice });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Send a payment reminder */
  async sendReminder(invoice: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/invoices/{invoice}/send-reminder", { "invoice": invoice });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Substitute simplified invoices with full invoice */
  async substituteSimplified(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/invoices/substitute-simplified";
    return this._send<unknown>("POST", path, body, config);
  }

  /** Unschedule an invoice */
  async unschedule(invoice: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/invoices/{invoice}/unschedule", { "invoice": invoice });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Unsend an invoice */
  async unsend(invoice: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/invoices/{invoice}/unsend", { "invoice": invoice });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Void an invoice */
  async void(invoice: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/invoices/{invoice}/void", { "invoice": invoice });
    return this._send<unknown>("POST", path, body, config);
  }
}
