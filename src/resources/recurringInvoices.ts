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
  async activate(recurringInvoice: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/recurring_invoices/{recurring_invoice}/activate", { "recurring_invoice": recurringInvoice });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Bulk delete recurring invoices */
  async bulkDelete(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/recurring_invoices/bulk-delete";
    return this._send<unknown>("POST", path, body, config);
  }

  /** Cancel recurring invoice */
  async cancel(recurringInvoice: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/recurring_invoices/{recurring_invoice}/cancel", { "recurring_invoice": recurringInvoice });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Create a recurring invoice */
  async create(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/recurring_invoices";
    return this._send<unknown>("POST", path, body, config);
  }

  /** List all recurring invoices */
  async list(params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    return this._paginate<unknown>("/recurring_invoices", params, "starting_after");
  }

  /** Delete a recurring invoice */
  async delete(recurringInvoice: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/recurring_invoices/{recurring_invoice}", { "recurring_invoice": recurringInvoice });
    return this._send<unknown>("DELETE", path, undefined, config);
  }

  /** Retrieve a recurring invoice */
  async show(recurringInvoice: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/recurring_invoices/{recurring_invoice}", { "recurring_invoice": recurringInvoice });
    return this._get<unknown>(path, undefined, config);
  }

  /** Update a recurring invoice */
  async update(recurringInvoice: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/recurring_invoices/{recurring_invoice}", { "recurring_invoice": recurringInvoice });
    return this._send<unknown>("PUT", path, body, config);
  }

  /** Generate an invoice from a recurring template */
  async generate(recurringInvoice: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/recurring_invoices/{recurring_invoice}/generate", { "recurring_invoice": recurringInvoice });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Retrieve recurring invoice stats */
  async stats(config?: RequestConfig): Promise<unknown> {
    const path = "/recurring_invoices/stats";
    return this._get<unknown>(path, undefined, config);
  }

  /** List recurring invoice activity */
  async activities(recurringInvoice: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/recurring_invoices/{recurring_invoice}/activities", { "recurring_invoice": recurringInvoice });
    return this._get<unknown>(path, undefined, config);
  }

  /** List recurring invoice execution logs */
  async logs(recurringInvoice: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/recurring_invoices/{recurring_invoice}/logs", { "recurring_invoice": recurringInvoice });
    return this._paginate<unknown>(path, params, "cursor");
  }

  /** Pause recurring invoice */
  async pause(recurringInvoice: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/recurring_invoices/{recurring_invoice}/pause", { "recurring_invoice": recurringInvoice });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Preview upcoming recurring invoice dates */
  async preview(recurringInvoice: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/recurring_invoices/{recurring_invoice}/preview", { "recurring_invoice": recurringInvoice });
    return this._get<unknown>(path, params, config);
  }

  /** Resume recurring invoice */
  async resume(recurringInvoice: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/recurring_invoices/{recurring_invoice}/resume", { "recurring_invoice": recurringInvoice });
    return this._send<unknown>("POST", path, undefined, config);
  }
}
