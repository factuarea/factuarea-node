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
  async download(taxReport: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/tax_reports/{tax_report}/download", { "tax_report": taxReport });
    return this._get<unknown>(path, undefined, config);
  }

  /** Find a tax report by period */
  async findByPeriod(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/tax_reports/find-by-period";
    return this._send<unknown>("POST", path, body, config);
  }

  /** Generate Modelo 303 */
  async generate303(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/tax_reports/303";
    return this._send<unknown>("POST", path, body, config);
  }

  /** Generate Modelo 347 */
  async generate347(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/tax_reports/347";
    return this._send<unknown>("POST", path, body, config);
  }

  /** List tax report activities */
  async activities(taxReport: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/tax_reports/{tax_report}/activities", { "tax_report": taxReport });
    return this._get<unknown>(path, undefined, config);
  }

  /** Retrieve tax report stats */
  async stats(config?: RequestConfig): Promise<unknown> {
    const path = "/tax_reports/stats";
    return this._get<unknown>(path, undefined, config);
  }

  /** List tax report history */
  async history(config?: RequestConfig): Promise<unknown> {
    const path = "/tax_reports/history";
    return this._get<unknown>(path, undefined, config);
  }

  /** Preview a tax report */
  async preview(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/tax_reports/preview";
    return this._send<unknown>("POST", path, body, config);
  }
}
