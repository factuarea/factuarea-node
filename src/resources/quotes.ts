// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.0.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class QuotesResource extends BaseResource {
  /** Accept a quote */
  async accept(company: string, quote: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/quotes/{quote}/accept", { "company": company, "quote": quote });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Bulk delete quotes */
  async bulkDelete(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/quotes/bulk-delete", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Bulk download quote PDFs */
  async bulkPdf(company: string, body?: unknown, config?: RequestConfig): Promise<BinaryResponse> {
    const path = this.buildPath("/companies/{company}/quotes/bulk-pdf", { "company": company });
    return this._binary(path, "POST", undefined, body, config);
  }

  /** Bulk send quotes */
  async bulkSend(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/quotes/bulk-send", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Bulk change quote status */
  async bulkStatus(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/quotes/bulk-status", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Convert quote to invoice */
  async convert(company: string, quote: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/quotes/{quote}/convert", { "company": company, "quote": quote });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Create a quote */
  async create(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/quotes", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** List all quotes */
  async list(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/quotes", { "company": company });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Delete a quote */
  async delete(company: string, quote: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/quotes/{quote}", { "company": company, "quote": quote });
    return this._send<unknown>("DELETE", path, undefined, config);
  }

  /** Retrieve a quote */
  async show(company: string, quote: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/quotes/{quote}", { "company": company, "quote": quote });
    return this._get<unknown>(path, undefined, config);
  }

  /** Update a quote */
  async update(company: string, quote: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/quotes/{quote}", { "company": company, "quote": quote });
    return this._send<unknown>("PATCH", path, body, config);
  }

  /** Download quote PDF */
  async pdf(company: string, quote: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<BinaryResponse> {
    const path = this.buildPath("/companies/{company}/quotes/{quote}/pdf", { "company": company, "quote": quote });
    return this._binary(path, "GET", params, undefined, config);
  }

  /** Duplicate a quote */
  async duplicate(company: string, quote: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/quotes/{quote}/duplicate", { "company": company, "quote": quote });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Find a quote by external ID */
  async findByExternalId(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/quotes/find-by-external-id", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Retrieve quote public link */
  async publicLinkGet(company: string, quote: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/quotes/{quote}/public-link", { "company": company, "quote": quote });
    return this._get<unknown>(path, undefined, config);
  }

  /** Update quote public link */
  async publicLinkUpdate(company: string, quote: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/quotes/{quote}/public-link", { "company": company, "quote": quote });
    return this._send<unknown>("PATCH", path, body, config);
  }

  /** Get quote stats */
  async stats(company: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/quotes/stats", { "company": company });
    return this._get<unknown>(path, undefined, config);
  }

  /** List quote statuses */
  async statuses(company: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/quotes/statuses", { "company": company });
    return this._get<unknown>(path, undefined, config);
  }

  /** Reject a quote */
  async reject(company: string, quote: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/quotes/{quote}/reject", { "company": company, "quote": quote });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Send quote by email */
  async send(company: string, quote: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/quotes/{quote}/send", { "company": company, "quote": quote });
    return this._send<unknown>("POST", path, body, config);
  }
}
