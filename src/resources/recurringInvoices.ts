// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.0.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class RecurringInvoicesResource extends BaseResource {
  /** Activate recurring invoice */
  async activate(company: string, recurringInvoice: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/recurring-invoices/{recurring_invoice}/activate", { "company": company, "recurring_invoice": recurringInvoice });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Bulk delete recurring invoices */
  async bulkDelete(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/recurring-invoices/bulk-delete", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Bulk change recurring invoice status */
  async bulkStatus(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/recurring-invoices/bulk-status", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Cancel recurring invoice */
  async cancel(company: string, recurringInvoice: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/recurring-invoices/{recurring_invoice}/cancel", { "company": company, "recurring_invoice": recurringInvoice });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Create a recurring invoice */
  async create(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/recurring-invoices", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** List all recurring invoices */
  async list(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/recurring-invoices", { "company": company });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Delete a recurring invoice */
  async delete(company: string, recurringInvoice: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/recurring-invoices/{recurring_invoice}", { "company": company, "recurring_invoice": recurringInvoice });
    return this._send<unknown>("DELETE", path, undefined, config);
  }

  /** Retrieve a recurring invoice */
  async show(company: string, recurringInvoice: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/recurring-invoices/{recurring_invoice}", { "company": company, "recurring_invoice": recurringInvoice });
    return this._get<unknown>(path, undefined, config);
  }

  /** Update a recurring invoice */
  async update(company: string, recurringInvoice: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/recurring-invoices/{recurring_invoice}", { "company": company, "recurring_invoice": recurringInvoice });
    return this._send<unknown>("PUT", path, body, config);
  }

  /** Find a recurring invoice by external ID */
  async findByExternalId(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/recurring-invoices/find-by-external-id", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Generate an invoice from a recurring template */
  async generate(company: string, recurringInvoice: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/recurring-invoices/{recurring_invoice}/generate", { "company": company, "recurring_invoice": recurringInvoice });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Retrieve recurring invoice stats */
  async stats(company: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/recurring-invoices/stats", { "company": company });
    return this._get<unknown>(path, undefined, config);
  }

  /** List recurring invoice activity */
  async activities(company: string, recurringInvoice: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/recurring-invoices/{recurring_invoice}/activities", { "company": company, "recurring_invoice": recurringInvoice });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** List recurring invoice execution logs */
  async logs(company: string, recurringInvoice: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/recurring-invoices/{recurring_invoice}/logs", { "company": company, "recurring_invoice": recurringInvoice });
    return this._paginate<unknown>(path, params, "cursor", config);
  }

  /** Pause recurring invoice */
  async pause(company: string, recurringInvoice: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/recurring-invoices/{recurring_invoice}/pause", { "company": company, "recurring_invoice": recurringInvoice });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Preview upcoming recurring invoice dates */
  async preview(company: string, recurringInvoice: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/recurring-invoices/{recurring_invoice}/preview", { "company": company, "recurring_invoice": recurringInvoice });
    return this._get<unknown>(path, params, config);
  }

  /** Resume recurring invoice */
  async resume(company: string, recurringInvoice: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/recurring-invoices/{recurring_invoice}/resume", { "company": company, "recurring_invoice": recurringInvoice });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Skip the next recurring invoice generation */
  async skip(company: string, recurringInvoice: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/recurring-invoices/{recurring_invoice}/skip", { "company": company, "recurring_invoice": recurringInvoice });
    return this._send<unknown>("POST", path, undefined, config);
  }
}
