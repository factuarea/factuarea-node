// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.0.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class TaxReportsResource extends BaseResource {
  /** Download tax report file */
  async download(company: string, taxReport: string, config?: RequestConfig): Promise<BinaryResponse> {
    const path = this.buildPath("/companies/{company}/tax-reports/{tax_report}/download", { "company": company, "tax_report": taxReport });
    return this._binary(path, "GET", undefined, undefined, config);
  }

  /** Find a tax report by period */
  async findByPeriod(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/tax-reports/find-by-period", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Generate Modelo 130 */
  async generate130(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/tax-reports/130", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Generate Modelo 303 */
  async generate303(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/tax-reports/303", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Generate Modelo 347 */
  async generate347(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/tax-reports/347", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** List tax report activities */
  async activities(company: string, taxReport: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/tax-reports/{tax_report}/activities", { "company": company, "tax_report": taxReport });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Retrieve tax report stats */
  async stats(company: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/tax-reports/stats", { "company": company });
    return this._get<unknown>(path, undefined, config);
  }

  /** List tax report history */
  async history(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/tax-reports/history", { "company": company });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Preview a tax report */
  async preview(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/tax-reports/preview", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }
}
