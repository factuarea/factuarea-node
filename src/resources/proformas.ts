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
  async accept(company: string, proforma: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/proformas/{proforma}/accept", { "company": company, "proforma": proforma });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Bulk delete proformas */
  async bulkDelete(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/proformas/bulk-delete", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Bulk download proforma PDFs */
  async bulkPdf(company: string, body?: unknown, config?: RequestConfig): Promise<BinaryResponse> {
    const path = this.buildPath("/companies/{company}/proformas/bulk-pdf", { "company": company });
    return this._binary(path, "POST", undefined, body, config);
  }

  /** Bulk send proformas */
  async bulkSend(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/proformas/bulk-send", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Bulk change proforma status */
  async bulkStatus(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/proformas/bulk-status", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Convert proforma to invoice */
  async convert(company: string, proforma: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/proformas/{proforma}/convert", { "company": company, "proforma": proforma });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Create a proforma */
  async create(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/proformas", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** List all proformas */
  async list(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/proformas", { "company": company });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Delete a proforma */
  async delete(company: string, proforma: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/proformas/{proforma}", { "company": company, "proforma": proforma });
    return this._send<unknown>("DELETE", path, undefined, config);
  }

  /** Retrieve a proforma */
  async show(company: string, proforma: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/proformas/{proforma}", { "company": company, "proforma": proforma });
    return this._get<unknown>(path, undefined, config);
  }

  /** Update a proforma */
  async update(company: string, proforma: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/proformas/{proforma}", { "company": company, "proforma": proforma });
    return this._send<unknown>("PATCH", path, body, config);
  }

  /** Download proforma PDF */
  async pdf(company: string, proforma: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<BinaryResponse> {
    const path = this.buildPath("/companies/{company}/proformas/{proforma}/pdf", { "company": company, "proforma": proforma });
    return this._binary(path, "GET", params, undefined, config);
  }

  /** Duplicate a proforma */
  async duplicate(company: string, proforma: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/proformas/{proforma}/duplicate", { "company": company, "proforma": proforma });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Find a proforma by external ID */
  async findByExternalId(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/proformas/find-by-external-id", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Retrieve proforma public link */
  async publicLinkGet(company: string, proforma: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/proformas/{proforma}/public-link", { "company": company, "proforma": proforma });
    return this._get<unknown>(path, undefined, config);
  }

  /** Update proforma public link */
  async publicLinkUpdate(company: string, proforma: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/proformas/{proforma}/public-link", { "company": company, "proforma": proforma });
    return this._send<unknown>("PATCH", path, body, config);
  }

  /** Get proforma stats */
  async stats(company: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/proformas/stats", { "company": company });
    return this._get<unknown>(path, undefined, config);
  }

  /** List proforma statuses */
  async statuses(company: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/proformas/statuses", { "company": company });
    return this._get<unknown>(path, undefined, config);
  }

  /** Reject a proforma */
  async reject(company: string, proforma: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/proformas/{proforma}/reject", { "company": company, "proforma": proforma });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Send proforma by email */
  async send(company: string, proforma: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/proformas/{proforma}/send", { "company": company, "proforma": proforma });
    return this._send<unknown>("POST", path, body, config);
  }
}
