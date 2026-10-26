// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, splitQueryAndConfig, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";
import type { PublicApiV1SeriesActiveResponses, PublicApiV1SeriesAssignPdfTemplateData, PublicApiV1SeriesAssignPdfTemplateResponses, PublicApiV1SeriesBootstrapResponses, PublicApiV1SeriesCreateData, PublicApiV1SeriesCreateResponses, PublicApiV1SeriesDefaultResponses, PublicApiV1SeriesFindByCodeData, PublicApiV1SeriesFindByCodeResponses, PublicApiV1SeriesGetPdfTemplateResponses, PublicApiV1SeriesShowResponses, PublicApiV1SeriesStatsResponses, PublicApiV1SeriesUpdateData, PublicApiV1SeriesUpdateResponses } from "../generated/types.gen.js";


export class SeriesResource extends BaseResource {
  /** Archive a series */
  async archive(company: string, series: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/series/{series}/archive", { "company": company, "series": series });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /**
   * Assign the PDF template of a series
   * Conditional: pass the `ETag` of the last read as `config.ifMatch`.
   */
  async assignPdfTemplate(company: string, series: string, body?: PublicApiV1SeriesAssignPdfTemplateData["body"], config?: RequestConfig): Promise<PublicApiV1SeriesAssignPdfTemplateResponses[200]> {
    const path = this.buildPath("/companies/{company}/series/{series}/pdf-template", { "company": company, "series": series });
    return this._send<PublicApiV1SeriesAssignPdfTemplateResponses[200]>("PATCH", path, body, config);
  }

  /** Retrieve the PDF template of a series */
  async getPdfTemplate(company: string, series: string, config?: RequestConfig): Promise<PublicApiV1SeriesGetPdfTemplateResponses[200]> {
    const path = this.buildPath("/companies/{company}/series/{series}/pdf-template", { "company": company, "series": series });
    return this._get<PublicApiV1SeriesGetPdfTemplateResponses[200]>(path, undefined, config);
  }

  /** Bootstrap the default series of a company */
  async bootstrap(company: string, config?: RequestConfig): Promise<PublicApiV1SeriesBootstrapResponses[200]> {
    const path = this.buildPath("/companies/{company}/series/bootstrap", { "company": company });
    return this._send<PublicApiV1SeriesBootstrapResponses[200]>("POST", path, undefined, config);
  }

  /** Create a series */
  async create(company: string, body?: PublicApiV1SeriesCreateData["body"], config?: RequestConfig): Promise<PublicApiV1SeriesCreateResponses[201]> {
    const path = this.buildPath("/companies/{company}/series", { "company": company });
    return this._send<PublicApiV1SeriesCreateResponses[201]>("POST", path, body, config);
  }

  /** List all series */
  async list(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/series", { "company": company });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Find a series by code */
  async findByCode(company: string, body?: PublicApiV1SeriesFindByCodeData["body"], config?: RequestConfig): Promise<PublicApiV1SeriesFindByCodeResponses[200]> {
    const path = this.buildPath("/companies/{company}/series/find-by-code", { "company": company });
    return this._send<PublicApiV1SeriesFindByCodeResponses[200]>("POST", path, body, config);
  }

  /** Get the default series for a document type */
  async default(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<PublicApiV1SeriesDefaultResponses[200]> {
    const path = this.buildPath("/companies/{company}/series/default", { "company": company });
    return this._get<PublicApiV1SeriesDefaultResponses[200]>(path, params, config);
  }

  /** List series activity timeline */
  async activities(company: string, series: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/series/{series}/activities", { "company": company, "series": series });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Get series stats */
  async stats(company: string, config?: RequestConfig): Promise<PublicApiV1SeriesStatsResponses[200]> {
    const path = this.buildPath("/companies/{company}/series/stats", { "company": company });
    return this._get<PublicApiV1SeriesStatsResponses[200]>(path, undefined, config);
  }

  /** List active series by document type */
  active(company: string, config?: RequestConfig): Promise<PublicApiV1SeriesActiveResponses[200]>;
  active(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<PublicApiV1SeriesActiveResponses[200]>;
  async active(company: string, paramsOrConfig?: Record<string, unknown> | RequestConfig, config?: RequestConfig): Promise<PublicApiV1SeriesActiveResponses[200]> {
    const path = this.buildPath("/companies/{company}/series/active", { "company": company });
    const args = splitQueryAndConfig(paramsOrConfig, config);
    return this._get<PublicApiV1SeriesActiveResponses[200]>(path, args.params, args.config);
  }

  /** Mark a series as default for its type */
  async setDefault(company: string, series: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/series/{series}/default", { "company": company, "series": series });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Retrieve a series */
  async show(company: string, series: string, config?: RequestConfig): Promise<PublicApiV1SeriesShowResponses[200]> {
    const path = this.buildPath("/companies/{company}/series/{series}", { "company": company, "series": series });
    return this._get<PublicApiV1SeriesShowResponses[200]>(path, undefined, config);
  }

  /** Update a series */
  async update(company: string, series: string, body?: PublicApiV1SeriesUpdateData["body"], config?: RequestConfig): Promise<PublicApiV1SeriesUpdateResponses[200]> {
    const path = this.buildPath("/companies/{company}/series/{series}", { "company": company, "series": series });
    return this._send<PublicApiV1SeriesUpdateResponses[200]>("PATCH", path, body, config);
  }

  /** Unarchive a series */
  async unarchive(company: string, series: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/series/{series}/unarchive", { "company": company, "series": series });
    return this._send<unknown>("POST", path, undefined, config);
  }
}
