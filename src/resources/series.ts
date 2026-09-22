// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.0.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class SeriesResource extends BaseResource {
  /** Archive a series */
  async archive(company: string, series: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/series/{series}/archive", { "company": company, "series": series });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Bootstrap the default series of a company */
  async bootstrap(company: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/series/bootstrap", { "company": company });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Create a series */
  async create(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/series", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** List all series */
  async list(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/series", { "company": company });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Find a series by code */
  async findByCode(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/series/find-by-code", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Get the default series for a document type */
  async default(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/series/default", { "company": company });
    return this._get<unknown>(path, params, config);
  }

  /** List series activity timeline */
  async activities(company: string, series: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/series/{series}/activities", { "company": company, "series": series });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Get series stats */
  async stats(company: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/series/stats", { "company": company });
    return this._get<unknown>(path, undefined, config);
  }

  /** List active series by document type */
  async active(company: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/series/active", { "company": company });
    return this._get<unknown>(path, undefined, config);
  }

  /** Mark a series as default for its type */
  async setDefault(company: string, series: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/series/{series}/default", { "company": company, "series": series });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Retrieve a series */
  async show(company: string, series: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/series/{series}", { "company": company, "series": series });
    return this._get<unknown>(path, undefined, config);
  }

  /** Unarchive a series */
  async unarchive(company: string, series: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/series/{series}/unarchive", { "company": company, "series": series });
    return this._send<unknown>("POST", path, undefined, config);
  }
}
