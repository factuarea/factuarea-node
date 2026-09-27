// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class PurchaseInvoicesResource extends BaseResource {
  /** Attach a file to an expense */
  async attachFile(purchaseInvoice: string, formData: FormData, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/purchase_invoices/{purchase_invoice}/attach-file", { "purchase_invoice": purchaseInvoice });
    return this._sendForm<unknown>(path, formData, config);
  }

  /** Bulk delete expenses */
  async bulkDelete(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/purchase_invoices/bulk-delete";
    return this._send<unknown>("POST", path, body, config);
  }

  /** Bulk change expense status */
  async bulkStatus(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/purchase_invoices/bulk-status";
    return this._send<unknown>("POST", path, body, config);
  }

  /** Create an expense */
  async create(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/purchase_invoices";
    return this._send<unknown>("POST", path, body, config);
  }

  /** List all expenses */
  async list(params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    return this._paginate<unknown>("/purchase_invoices", params, "starting_after", config);
  }

  /** Delete an expense */
  async delete(purchaseInvoice: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/purchase_invoices/{purchase_invoice}", { "purchase_invoice": purchaseInvoice });
    return this._send<unknown>("DELETE", path, undefined, config, { idempotent: true });
  }

  /** Retrieve an expense */
  async show(purchaseInvoice: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/purchase_invoices/{purchase_invoice}", { "purchase_invoice": purchaseInvoice });
    return this._get<unknown>(path, undefined, config);
  }

  /** Update an expense */
  async update(purchaseInvoice: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/purchase_invoices/{purchase_invoice}", { "purchase_invoice": purchaseInvoice });
    return this._send<unknown>("PUT", path, body, config);
  }

  /** Remove an expense file */
  async deleteFile(purchaseInvoice: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/purchase_invoices/{purchase_invoice}/file", { "purchase_invoice": purchaseInvoice });
    return this._send<unknown>("DELETE", path, undefined, config);
  }

  /** Download the original expense file */
  async file(purchaseInvoice: string, config?: RequestConfig): Promise<BinaryResponse> {
    const path = this.buildPath("/purchase_invoices/{purchase_invoice}/file", { "purchase_invoice": purchaseInvoice });
    return this._binary(path, "GET", undefined, undefined, config);
  }

  /** Download an expense payment receipt */
  async paymentReceipt(purchaseInvoice: string, config?: RequestConfig): Promise<BinaryResponse> {
    const path = this.buildPath("/purchase_invoices/{purchase_invoice}/payment-receipt", { "purchase_invoice": purchaseInvoice });
    return this._binary(path, "GET", undefined, undefined, config);
  }

  /** Find an expense by external ID */
  async findByExternalId(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/purchase_invoices/find-by-external-id";
    return this._send<unknown>("POST", path, body, config);
  }

  /** Get expense stats */
  async stats(config?: RequestConfig): Promise<unknown> {
    const path = "/purchase_invoices/stats";
    return this._get<unknown>(path, undefined, config);
  }

  /** List expense categories */
  async expenseCategories(config?: RequestConfig): Promise<unknown> {
    const path = "/purchase_invoices/expense_categories";
    return this._get<unknown>(path, undefined, config);
  }

  /** List overdue expenses */
  async overdue(params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    return this._paginate<unknown>("/purchase_invoices/overdue", params, "cursor", config);
  }

  /** List pending expenses */
  async pending(params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    return this._paginate<unknown>("/purchase_invoices/pending", params, "cursor", config);
  }

  /** List expense payments */
  async listPayments(purchaseInvoice: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/purchase_invoices/{purchase_invoice}/payments", { "purchase_invoice": purchaseInvoice });
    return this._get<unknown>(path, undefined, config);
  }

  /** Register an expense payment */
  async registerPayment(purchaseInvoice: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/purchase_invoices/{purchase_invoice}/payments", { "purchase_invoice": purchaseInvoice });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Mark expense as paid */
  async markPaid(purchaseInvoice: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/purchase_invoices/{purchase_invoice}/mark_paid", { "purchase_invoice": purchaseInvoice });
    return this._send<unknown>("POST", path, body, config);
  }
}
