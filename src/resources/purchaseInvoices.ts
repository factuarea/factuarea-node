// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";
import type { PublicApiV1PurchaseInvoicesAttachFileResponses, PublicApiV1PurchaseInvoicesBulkDeleteData, PublicApiV1PurchaseInvoicesBulkDeleteResponses, PublicApiV1PurchaseInvoicesBulkStatusData, PublicApiV1PurchaseInvoicesBulkStatusResponses, PublicApiV1PurchaseInvoicesCreateData, PublicApiV1PurchaseInvoicesCreateResponses, PublicApiV1PurchaseInvoicesExpenseCategoriesResponses, PublicApiV1PurchaseInvoicesFindByExternalIdData, PublicApiV1PurchaseInvoicesFindByExternalIdResponses, PublicApiV1PurchaseInvoicesListPaymentsResponses, PublicApiV1PurchaseInvoicesMarkPaidData, PublicApiV1PurchaseInvoicesMarkPaidResponses, PublicApiV1PurchaseInvoicesRegisterPaymentData, PublicApiV1PurchaseInvoicesRegisterPaymentResponses, PublicApiV1PurchaseInvoicesShowResponses, PublicApiV1PurchaseInvoicesStatsResponses, PublicApiV1PurchaseInvoicesUpdateData, PublicApiV1PurchaseInvoicesUpdateResponses } from "../generated/types.gen.js";


export class PurchaseInvoicesResource extends BaseResource {
  /** Attach a file to an expense */
  async attachFile(company: string, purchaseInvoice: string, formData: FormData, config?: RequestConfig): Promise<PublicApiV1PurchaseInvoicesAttachFileResponses[200]> {
    const path = this.buildPath("/companies/{company}/purchase-invoices/{purchase_invoice}/attach-file", { "company": company, "purchase_invoice": purchaseInvoice });
    return this._sendForm<PublicApiV1PurchaseInvoicesAttachFileResponses[200]>(path, formData, config);
  }

  /** Bulk delete expenses */
  async bulkDelete(company: string, body?: PublicApiV1PurchaseInvoicesBulkDeleteData["body"], config?: RequestConfig): Promise<PublicApiV1PurchaseInvoicesBulkDeleteResponses[200]> {
    const path = this.buildPath("/companies/{company}/purchase-invoices/bulk-delete", { "company": company });
    return this._send<PublicApiV1PurchaseInvoicesBulkDeleteResponses[200]>("POST", path, body, config);
  }

  /** Bulk change expense status */
  async bulkStatus(company: string, body?: PublicApiV1PurchaseInvoicesBulkStatusData["body"], config?: RequestConfig): Promise<PublicApiV1PurchaseInvoicesBulkStatusResponses[200]> {
    const path = this.buildPath("/companies/{company}/purchase-invoices/bulk-status", { "company": company });
    return this._send<PublicApiV1PurchaseInvoicesBulkStatusResponses[200]>("POST", path, body, config);
  }

  /** Create an expense */
  async create(company: string, body?: PublicApiV1PurchaseInvoicesCreateData["body"], config?: RequestConfig): Promise<PublicApiV1PurchaseInvoicesCreateResponses[201]> {
    const path = this.buildPath("/companies/{company}/purchase-invoices", { "company": company });
    return this._send<PublicApiV1PurchaseInvoicesCreateResponses[201]>("POST", path, body, config);
  }

  /** List all expenses */
  async list(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/purchase-invoices", { "company": company });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Delete an expense */
  async delete(company: string, purchaseInvoice: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/purchase-invoices/{purchase_invoice}", { "company": company, "purchase_invoice": purchaseInvoice });
    return this._send<unknown>("DELETE", path, undefined, config, { idempotent: true });
  }

  /** Retrieve an expense */
  async show(company: string, purchaseInvoice: string, config?: RequestConfig): Promise<PublicApiV1PurchaseInvoicesShowResponses[200]> {
    const path = this.buildPath("/companies/{company}/purchase-invoices/{purchase_invoice}", { "company": company, "purchase_invoice": purchaseInvoice });
    return this._get<PublicApiV1PurchaseInvoicesShowResponses[200]>(path, undefined, config);
  }

  /** Update an expense */
  async update(company: string, purchaseInvoice: string, body?: PublicApiV1PurchaseInvoicesUpdateData["body"], config?: RequestConfig): Promise<PublicApiV1PurchaseInvoicesUpdateResponses[200]> {
    const path = this.buildPath("/companies/{company}/purchase-invoices/{purchase_invoice}", { "company": company, "purchase_invoice": purchaseInvoice });
    return this._send<PublicApiV1PurchaseInvoicesUpdateResponses[200]>("PATCH", path, body, config);
  }

  /** Remove an expense file */
  async deleteFile(company: string, purchaseInvoice: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/purchase-invoices/{purchase_invoice}/file", { "company": company, "purchase_invoice": purchaseInvoice });
    return this._send<unknown>("DELETE", path, undefined, config);
  }

  /**
   * Download the original expense file
   * Answers with JSON metadata by default; send `config.headers: { Accept: "image/png" }` (or another image type) to get the stored bytes.
   */
  async file(company: string, purchaseInvoice: string, config?: RequestConfig): Promise<BinaryResponse> {
    const path = this.buildPath("/companies/{company}/purchase-invoices/{purchase_invoice}/file", { "company": company, "purchase_invoice": purchaseInvoice });
    return this._binary(path, "GET", undefined, undefined, config);
  }

  /** Download the receipt PDF of an expense payment */
  async paymentReceipt(company: string, purchaseInvoice: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<BinaryResponse> {
    const path = this.buildPath("/companies/{company}/purchase-invoices/{purchase_invoice}/payment-receipt", { "company": company, "purchase_invoice": purchaseInvoice });
    return this._binary(path, "GET", params, undefined, config);
  }

  /** Find an expense by external ID */
  async findByExternalId(company: string, body?: PublicApiV1PurchaseInvoicesFindByExternalIdData["body"], config?: RequestConfig): Promise<PublicApiV1PurchaseInvoicesFindByExternalIdResponses[200]> {
    const path = this.buildPath("/companies/{company}/purchase-invoices/find-by-external-id", { "company": company });
    return this._send<PublicApiV1PurchaseInvoicesFindByExternalIdResponses[200]>("POST", path, body, config);
  }

  /** Get expense stats */
  async stats(company: string, config?: RequestConfig): Promise<PublicApiV1PurchaseInvoicesStatsResponses[200]> {
    const path = this.buildPath("/companies/{company}/purchase-invoices/stats", { "company": company });
    return this._get<PublicApiV1PurchaseInvoicesStatsResponses[200]>(path, undefined, config);
  }

  /** List expense categories */
  async expenseCategories(company: string, config?: RequestConfig): Promise<PublicApiV1PurchaseInvoicesExpenseCategoriesResponses[200]> {
    const path = this.buildPath("/companies/{company}/purchase-invoices/expense-categories", { "company": company });
    return this._get<PublicApiV1PurchaseInvoicesExpenseCategoriesResponses[200]>(path, undefined, config);
  }

  /** List overdue expenses */
  async overdue(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/purchase-invoices/overdue", { "company": company });
    return this._paginate<unknown>(path, params, "cursor", config);
  }

  /** List pending expenses */
  async pending(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/purchase-invoices/pending", { "company": company });
    return this._paginate<unknown>(path, params, "cursor", config);
  }

  /** List expense payments */
  async listPayments(company: string, purchaseInvoice: string, config?: RequestConfig): Promise<PublicApiV1PurchaseInvoicesListPaymentsResponses[200]> {
    const path = this.buildPath("/companies/{company}/purchase-invoices/{purchase_invoice}/payments", { "company": company, "purchase_invoice": purchaseInvoice });
    return this._get<PublicApiV1PurchaseInvoicesListPaymentsResponses[200]>(path, undefined, config);
  }

  /** Register an expense payment */
  async registerPayment(company: string, purchaseInvoice: string, body?: PublicApiV1PurchaseInvoicesRegisterPaymentData["body"], config?: RequestConfig): Promise<PublicApiV1PurchaseInvoicesRegisterPaymentResponses[201]> {
    const path = this.buildPath("/companies/{company}/purchase-invoices/{purchase_invoice}/payments", { "company": company, "purchase_invoice": purchaseInvoice });
    return this._send<PublicApiV1PurchaseInvoicesRegisterPaymentResponses[201]>("POST", path, body, config);
  }

  /** Mark expense as paid */
  async markPaid(company: string, purchaseInvoice: string, body?: PublicApiV1PurchaseInvoicesMarkPaidData["body"], config?: RequestConfig): Promise<PublicApiV1PurchaseInvoicesMarkPaidResponses[200]> {
    const path = this.buildPath("/companies/{company}/purchase-invoices/{purchase_invoice}/mark-paid", { "company": company, "purchase_invoice": purchaseInvoice });
    return this._send<PublicApiV1PurchaseInvoicesMarkPaidResponses[200]>("POST", path, body, config);
  }
}
