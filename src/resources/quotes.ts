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
  async accept(quote: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/quotes/{quote}/accept", { "quote": quote });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Bulk delete quotes */
  async bulkDelete(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/quotes/bulk-delete";
    return this._send<unknown>("POST", path, body, config);
  }

  /** Convert quote to invoice */
  async convert(quote: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/quotes/{quote}/convert", { "quote": quote });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Create a quote */
  async create(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/quotes";
    return this._send<unknown>("POST", path, body, config);
  }

  /** List all quotes */
  async list(params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    return this._paginate<unknown>("/quotes", params, "starting_after");
  }

  /** Delete a quote */
  async delete(quote: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/quotes/{quote}", { "quote": quote });
    return this._send<unknown>("DELETE", path, undefined, config);
  }

  /** Retrieve a quote */
  async show(quote: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/quotes/{quote}", { "quote": quote });
    return this._get<unknown>(path, undefined, config);
  }

  /** Update a quote */
  async update(quote: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/quotes/{quote}", { "quote": quote });
    return this._send<unknown>("PUT", path, body, config);
  }

  /** Download quote PDF */
  async pdf(quote: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/quotes/{quote}/pdf", { "quote": quote });
    return this._get<unknown>(path, params, config);
  }

  /** Duplicate a quote */
  async duplicate(quote: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/quotes/{quote}/duplicate", { "quote": quote });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Retrieve quote public link */
  async publicLinkGet(quote: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/quotes/{quote}/public-link", { "quote": quote });
    return this._get<unknown>(path, undefined, config);
  }

  /** Update quote public link */
  async publicLinkUpdate(quote: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/quotes/{quote}/public-link", { "quote": quote });
    return this._send<unknown>("PUT", path, body, config);
  }

  /** Get quote stats */
  async stats(config?: RequestConfig): Promise<unknown> {
    const path = "/quotes/stats";
    return this._get<unknown>(path, undefined, config);
  }

  /** List quote statuses */
  async statuses(config?: RequestConfig): Promise<unknown> {
    const path = "/quotes/statuses";
    return this._get<unknown>(path, undefined, config);
  }

  /** Reject a quote */
  async reject(quote: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/quotes/{quote}/reject", { "quote": quote });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Send quote by email */
  async send(quote: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/quotes/{quote}/send", { "quote": quote });
    return this._send<unknown>("POST", path, body, config);
  }
}
