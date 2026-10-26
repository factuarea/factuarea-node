// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";
import type { PublicApiV1MonthlyTimeRecordClosesCreateData, PublicApiV1MonthlyTimeRecordClosesCreateResponses, PublicApiV1MonthlyTimeRecordClosesExportResponses, PublicApiV1MonthlyTimeRecordClosesPayrollExportResponses, PublicApiV1MonthlyTimeRecordClosesReopenResponses, PublicApiV1MonthlyTimeRecordClosesReportResponses, PublicApiV1MonthlyTimeRecordClosesSealResponses, PublicApiV1MonthlyTimeRecordClosesSealShowResponses, PublicApiV1MonthlyTimeRecordClosesShowResponses } from "../generated/types.gen.js";


export class MonthlyTimeRecordClosesResource extends BaseResource {
  /** Close a monthly time record */
  async create(company: string, body?: PublicApiV1MonthlyTimeRecordClosesCreateData["body"], config?: RequestConfig): Promise<PublicApiV1MonthlyTimeRecordClosesCreateResponses[201]> {
    const path = this.buildPath("/companies/{company}/monthly-time-record-closes", { "company": company });
    return this._send<PublicApiV1MonthlyTimeRecordClosesCreateResponses[201]>("POST", path, body, config);
  }

  /** List all monthly time record closes */
  async list(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/monthly-time-record-closes", { "company": company });
    return this._paginate<unknown>(path, params, "cursor", config);
  }

  /** Download the closed register (RD-ley 8/2019) */
  async export(company: string, monthlyTimeRecordClose: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<PublicApiV1MonthlyTimeRecordClosesExportResponses[200]> {
    const path = this.buildPath("/companies/{company}/monthly-time-record-closes/{monthly_time_record_close}/export", { "company": company, "monthly_time_record_close": monthlyTimeRecordClose });
    return this._get<PublicApiV1MonthlyTimeRecordClosesExportResponses[200]>(path, params, config);
  }

  /** Download the payroll export of a closed month */
  async payrollExport(company: string, monthlyTimeRecordClose: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<PublicApiV1MonthlyTimeRecordClosesPayrollExportResponses[200]> {
    const path = this.buildPath("/companies/{company}/monthly-time-record-closes/{monthly_time_record_close}/payroll-export", { "company": company, "monthly_time_record_close": monthlyTimeRecordClose });
    return this._get<PublicApiV1MonthlyTimeRecordClosesPayrollExportResponses[200]>(path, params, config);
  }

  /** Retrieve the report of a closed period */
  async report(company: string, monthlyTimeRecordClose: string, config?: RequestConfig): Promise<PublicApiV1MonthlyTimeRecordClosesReportResponses[200]> {
    const path = this.buildPath("/companies/{company}/monthly-time-record-closes/{monthly_time_record_close}/report", { "company": company, "monthly_time_record_close": monthlyTimeRecordClose });
    return this._get<PublicApiV1MonthlyTimeRecordClosesReportResponses[200]>(path, undefined, config);
  }

  /** Reopen a monthly time record close */
  async reopen(company: string, monthlyTimeRecordClose: string, config?: RequestConfig): Promise<PublicApiV1MonthlyTimeRecordClosesReopenResponses[200]> {
    const path = this.buildPath("/companies/{company}/monthly-time-record-closes/{monthly_time_record_close}/reopen", { "company": company, "monthly_time_record_close": monthlyTimeRecordClose });
    return this._send<PublicApiV1MonthlyTimeRecordClosesReopenResponses[200]>("POST", path, undefined, config);
  }

  /** Seal a monthly time record register */
  async seal(company: string, monthlyTimeRecordClose: string, config?: RequestConfig): Promise<PublicApiV1MonthlyTimeRecordClosesSealResponses[201]> {
    const path = this.buildPath("/companies/{company}/monthly-time-record-closes/{monthly_time_record_close}/seal", { "company": company, "monthly_time_record_close": monthlyTimeRecordClose });
    return this._send<PublicApiV1MonthlyTimeRecordClosesSealResponses[201]>("POST", path, undefined, config);
  }

  /** Retrieve the seal of a monthly register */
  async sealShow(company: string, monthlyTimeRecordClose: string, config?: RequestConfig): Promise<PublicApiV1MonthlyTimeRecordClosesSealShowResponses[200]> {
    const path = this.buildPath("/companies/{company}/monthly-time-record-closes/{monthly_time_record_close}/seal", { "company": company, "monthly_time_record_close": monthlyTimeRecordClose });
    return this._get<PublicApiV1MonthlyTimeRecordClosesSealShowResponses[200]>(path, undefined, config);
  }

  /** Retrieve a monthly time record close */
  async show(company: string, monthlyTimeRecordClose: string, config?: RequestConfig): Promise<PublicApiV1MonthlyTimeRecordClosesShowResponses[200]> {
    const path = this.buildPath("/companies/{company}/monthly-time-record-closes/{monthly_time_record_close}", { "company": company, "monthly_time_record_close": monthlyTimeRecordClose });
    return this._get<PublicApiV1MonthlyTimeRecordClosesShowResponses[200]>(path, undefined, config);
  }
}
