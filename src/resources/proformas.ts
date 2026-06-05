// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.0.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class ProformasResource extends BaseResource {
  /** Accept a proforma */
  async accept(proforma: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/proformas/{proforma}/accept", { "proforma": proforma });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Bulk delete proformas */
  async bulkDelete(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/proformas/bulk-delete";
    return this._send<unknown>("POST", path, body, config);
  }

  /** Convert proforma to invoice */
  async convert(proforma: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/proformas/{proforma}/convert", { "proforma": proforma });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Create a proforma */
  async create(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/proformas";
    return this._send<unknown>("POST", path, body, config);
  }

  /** List all proformas */
  async list(params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    return this._paginate<unknown>("/proformas", params, "starting_after");
  }

  /** Delete a proforma */
  async delete(proforma: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/proformas/{proforma}", { "proforma": proforma });
    return this._send<unknown>("DELETE", path, undefined, config);
  }

  /** Retrieve a proforma */
  async show(proforma: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/proformas/{proforma}", { "proforma": proforma });
    return this._get<unknown>(path, undefined, config);
  }

  /** Update a proforma */
  async update(proforma: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/proformas/{proforma}", { "proforma": proforma });
    return this._send<unknown>("PUT", path, body, config);
  }

  /** Download proforma PDF */
  async pdf(proforma: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/proformas/{proforma}/pdf", { "proforma": proforma });
    return this._get<unknown>(path, params, config);
  }

  /** Duplicate a proforma */
  async duplicate(proforma: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/proformas/{proforma}/duplicate", { "proforma": proforma });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Retrieve proforma public link */
  async publicLinkGet(proforma: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/proformas/{proforma}/public-link", { "proforma": proforma });
    return this._get<unknown>(path, undefined, config);
  }

  /** Update proforma public link */
  async publicLinkUpdate(proforma: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/proformas/{proforma}/public-link", { "proforma": proforma });
    return this._send<unknown>("PUT", path, body, config);
  }

  /** Get proforma stats */
  async stats(config?: RequestConfig): Promise<unknown> {
    const path = "/proformas/stats";
    return this._get<unknown>(path, undefined, config);
  }

  /** List proforma statuses */
  async statuses(config?: RequestConfig): Promise<unknown> {
    const path = "/proformas/statuses";
    return this._get<unknown>(path, undefined, config);
  }

  /** Reject a proforma */
  async reject(proforma: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/proformas/{proforma}/reject", { "proforma": proforma });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Send proforma by email */
  async send(proforma: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/proformas/{proforma}/send", { "proforma": proforma });
    return this._send<unknown>("POST", path, body, config);
  }
}
