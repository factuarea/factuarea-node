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
  async archive(series: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/series/{series}/archive", { "series": series });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Create a series */
  async create(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/series";
    return this._send<unknown>("POST", path, body, config);
  }

  /** List all series */
  async list(params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    return this._paginate<unknown>("/series", params, "starting_after");
  }

  /** Find a series by code */
  async findByCode(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/series/find-by-code";
    return this._send<unknown>("POST", path, body, config);
  }

  /** Get the default series for a document type */
  async default(config?: RequestConfig): Promise<unknown> {
    const path = "/series/default";
    return this._get<unknown>(path, undefined, config);
  }

  /** List series activity timeline */
  async activities(series: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/series/{series}/activities", { "series": series });
    return this._get<unknown>(path, undefined, config);
  }

  /** Get series stats */
  async stats(config?: RequestConfig): Promise<unknown> {
    const path = "/series/stats";
    return this._get<unknown>(path, undefined, config);
  }

  /** List active series by document type */
  async active(config?: RequestConfig): Promise<unknown> {
    const path = "/series/active";
    return this._get<unknown>(path, undefined, config);
  }

  /** Mark a series as default for its type */
  async setDefault(series: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/series/{series}/default", { "series": series });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Retrieve a series */
  async show(series: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/series/{series}", { "series": series });
    return this._get<unknown>(path, undefined, config);
  }

  /** Unarchive a series */
  async unarchive(series: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/series/{series}/unarchive", { "series": series });
    return this._send<unknown>("POST", path, undefined, config);
  }
}
