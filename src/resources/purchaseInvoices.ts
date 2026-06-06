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
  async attachFile(purchaseInvoice: string, formData: FormData, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/purchase_invoices/{purchase_invoice}/attach-file", { "purchase_invoice": purchaseInvoice });
    return this._sendForm<unknown>(path, formData, config);
  }

  /** Bulk delete purchase invoices */
  async bulkDelete(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/purchase_invoices/bulk-delete";
    return this._send<unknown>("POST", path, body, config);
  }

  /** Create a purchase invoice */
  async create(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/purchase_invoices";
    return this._send<unknown>("POST", path, body, config);
  }

  /** List all purchase invoices */
  async list(params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    return this._paginate<unknown>("/purchase_invoices", params, "starting_after");
  }

  /** Delete a purchase invoice */
  async delete(purchaseInvoice: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/purchase_invoices/{purchase_invoice}", { "purchase_invoice": purchaseInvoice });
    return this._send<unknown>("DELETE", path, undefined, config);
  }

  /** Retrieve a purchase invoice */
  async show(purchaseInvoice: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/purchase_invoices/{purchase_invoice}", { "purchase_invoice": purchaseInvoice });
    return this._get<unknown>(path, undefined, config);
  }

  /** Update a purchase invoice */
  async update(purchaseInvoice: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/purchase_invoices/{purchase_invoice}", { "purchase_invoice": purchaseInvoice });
    return this._send<unknown>("PUT", path, body, config);
  }

  /** Remove a purchase invoice file */
  async deleteFile(purchaseInvoice: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/purchase_invoices/{purchase_invoice}/file", { "purchase_invoice": purchaseInvoice });
    return this._send<unknown>("DELETE", path, undefined, config);
  }

  /** Download the original purchase invoice file */
  async file(purchaseInvoice: string, config?: RequestConfig): Promise<BinaryResponse> {
    const path = this.buildPath("/purchase_invoices/{purchase_invoice}/file", { "purchase_invoice": purchaseInvoice });
    return this._binary(path, "GET", undefined, undefined, config);
  }

  /** Download a purchase invoice payment receipt */
  async paymentReceipt(purchaseInvoice: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/purchase_invoices/{purchase_invoice}/payment-receipt", { "purchase_invoice": purchaseInvoice });
    return this._get<unknown>(path, undefined, config);
  }

  /** Get purchase invoice stats */
  async stats(config?: RequestConfig): Promise<unknown> {
    const path = "/purchase_invoices/stats";
    return this._get<unknown>(path, undefined, config);
  }

  /** List overdue purchase invoices */
  async overdue(params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    return this._paginate<unknown>("/purchase_invoices/overdue", params, "cursor");
  }

  /** List pending purchase invoices */
  async pending(params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    return this._paginate<unknown>("/purchase_invoices/pending", params, "cursor");
  }

  /** Mark purchase invoice as paid */
  async markPaid(purchaseInvoice: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/purchase_invoices/{purchase_invoice}/mark_paid", { "purchase_invoice": purchaseInvoice });
    return this._send<unknown>("POST", path, body, config);
  }
}
