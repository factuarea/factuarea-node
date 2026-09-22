// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.0.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class PurchaseInvoicesResource extends BaseResource {
  /** Attach a file to a purchase invoice */
  async attachFile(company: string, purchaseInvoice: string, formData: FormData, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/purchase-invoices/{purchase_invoice}/attach-file", { "company": company, "purchase_invoice": purchaseInvoice });
    return this._sendForm<unknown>(path, formData, config);
  }

  /** Bulk delete purchase invoices */
  async bulkDelete(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/purchase-invoices/bulk-delete", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Bulk change purchase invoice status */
  async bulkStatus(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/purchase-invoices/bulk-status", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Create a purchase invoice */
  async create(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/purchase-invoices", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** List all purchase invoices */
  async list(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/purchase-invoices", { "company": company });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Delete a purchase invoice */
  async delete(company: string, purchaseInvoice: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/purchase-invoices/{purchase_invoice}", { "company": company, "purchase_invoice": purchaseInvoice });
    return this._send<unknown>("DELETE", path, undefined, config);
  }

  /** Retrieve a purchase invoice */
  async show(company: string, purchaseInvoice: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/purchase-invoices/{purchase_invoice}", { "company": company, "purchase_invoice": purchaseInvoice });
    return this._get<unknown>(path, undefined, config);
  }

  /** Update a purchase invoice */
  async update(company: string, purchaseInvoice: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/purchase-invoices/{purchase_invoice}", { "company": company, "purchase_invoice": purchaseInvoice });
    return this._send<unknown>("PATCH", path, body, config);
  }

  /** Remove a purchase invoice file */
  async deleteFile(company: string, purchaseInvoice: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/purchase-invoices/{purchase_invoice}/file", { "company": company, "purchase_invoice": purchaseInvoice });
    return this._send<unknown>("DELETE", path, undefined, config);
  }

  /** Download the original purchase invoice file */
  async file(company: string, purchaseInvoice: string, config?: RequestConfig): Promise<BinaryResponse> {
    const path = this.buildPath("/companies/{company}/purchase-invoices/{purchase_invoice}/file", { "company": company, "purchase_invoice": purchaseInvoice });
    return this._binary(path, "GET", undefined, undefined, config);
  }

  /** Download a purchase invoice payment receipt */
  async paymentReceipt(company: string, purchaseInvoice: string, config?: RequestConfig): Promise<BinaryResponse> {
    const path = this.buildPath("/companies/{company}/purchase-invoices/{purchase_invoice}/payment-receipt", { "company": company, "purchase_invoice": purchaseInvoice });
    return this._binary(path, "GET", undefined, undefined, config);
  }

  /** Find a purchase invoice by external ID */
  async findByExternalId(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/purchase-invoices/find-by-external-id", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Get purchase invoice stats */
  async stats(company: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/purchase-invoices/stats", { "company": company });
    return this._get<unknown>(path, undefined, config);
  }

  /** List overdue purchase invoices */
  async overdue(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/purchase-invoices/overdue", { "company": company });
    return this._paginate<unknown>(path, params, "cursor", config);
  }

  /** List pending purchase invoices */
  async pending(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/purchase-invoices/pending", { "company": company });
    return this._paginate<unknown>(path, params, "cursor", config);
  }

  /** List purchase invoice payments */
  async listPayments(company: string, purchaseInvoice: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/purchase-invoices/{purchase_invoice}/payments", { "company": company, "purchase_invoice": purchaseInvoice });
    return this._get<unknown>(path, undefined, config);
  }

  /** Register a purchase invoice payment */
  async registerPayment(company: string, purchaseInvoice: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/purchase-invoices/{purchase_invoice}/payments", { "company": company, "purchase_invoice": purchaseInvoice });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Mark purchase invoice as paid */
  async markPaid(company: string, purchaseInvoice: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/purchase-invoices/{purchase_invoice}/mark-paid", { "company": company, "purchase_invoice": purchaseInvoice });
    return this._send<unknown>("POST", path, body, config);
  }
}
