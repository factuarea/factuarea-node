// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.0.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class MonthlyTimeRecordClosesResource extends BaseResource {
  /** Close a monthly time record */
  async create(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/monthly-time-record-closes";
    return this._send<unknown>("POST", path, body, config);
  }

  /** List all monthly time record closes */
  async list(params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    return this._paginate<unknown>("/monthly-time-record-closes", params, "cursor");
  }

  /** Download the closed register (RD-ley 8/2019) */
  async export(monthlyTimeRecordClose: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/monthly-time-record-closes/{monthly_time_record_close}/export", { "monthly_time_record_close": monthlyTimeRecordClose });
    return this._get<unknown>(path, params, config);
  }

  /** Download the payroll export of a closed month */
  async payrollExport(monthlyTimeRecordClose: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/monthly-time-record-closes/{monthly_time_record_close}/payroll-export", { "monthly_time_record_close": monthlyTimeRecordClose });
    return this._get<unknown>(path, params, config);
  }

  /** Retrieve the report of a closed period */
  async report(monthlyTimeRecordClose: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/monthly-time-record-closes/{monthly_time_record_close}/report", { "monthly_time_record_close": monthlyTimeRecordClose });
    return this._get<unknown>(path, undefined, config);
  }

  /** Reopen a monthly time record close */
  async reopen(monthlyTimeRecordClose: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/monthly-time-record-closes/{monthly_time_record_close}/reopen", { "monthly_time_record_close": monthlyTimeRecordClose });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Seal a monthly time record register */
  async seal(monthlyTimeRecordClose: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/monthly-time-record-closes/{monthly_time_record_close}/seal", { "monthly_time_record_close": monthlyTimeRecordClose });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Retrieve the seal of a monthly register */
  async sealShow(monthlyTimeRecordClose: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/monthly-time-record-closes/{monthly_time_record_close}/seal", { "monthly_time_record_close": monthlyTimeRecordClose });
    return this._get<unknown>(path, undefined, config);
  }

  /** Retrieve a monthly time record close */
  async show(monthlyTimeRecordClose: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/monthly-time-record-closes/{monthly_time_record_close}", { "monthly_time_record_close": monthlyTimeRecordClose });
    return this._get<unknown>(path, undefined, config);
  }
}
