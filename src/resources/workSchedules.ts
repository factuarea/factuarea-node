// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";
import type { PublicApiV1WorkSchedulesArchiveResponses, PublicApiV1WorkSchedulesAssignData, PublicApiV1WorkSchedulesAssignResponses, PublicApiV1WorkSchedulesAssignmentsResponses, PublicApiV1WorkSchedulesCreateData, PublicApiV1WorkSchedulesCreateResponses, PublicApiV1WorkSchedulesEmployeeScheduleResponses, PublicApiV1WorkSchedulesShowResponses, PublicApiV1WorkSchedulesStatsResponses, PublicApiV1WorkSchedulesUnarchiveResponses, PublicApiV1WorkSchedulesUnassignData, PublicApiV1WorkSchedulesUpdateData, PublicApiV1WorkSchedulesUpdateResponses } from "../generated/types.gen.js";


export class WorkSchedulesResource extends BaseResource {
  /** Archive a work schedule */
  async archive(company: string, schedule: string, config?: RequestConfig): Promise<PublicApiV1WorkSchedulesArchiveResponses[200]> {
    const path = this.buildPath("/companies/{company}/work-schedules/{schedule}/archive", { "company": company, "schedule": schedule });
    return this._send<PublicApiV1WorkSchedulesArchiveResponses[200]>("POST", path, undefined, config);
  }

  /** Assign a schedule to an employee */
  async assign(company: string, schedule: string, body?: PublicApiV1WorkSchedulesAssignData["body"], config?: RequestConfig): Promise<PublicApiV1WorkSchedulesAssignResponses[201]> {
    const path = this.buildPath("/companies/{company}/work-schedules/{schedule}/assign", { "company": company, "schedule": schedule });
    return this._send<PublicApiV1WorkSchedulesAssignResponses[201]>("POST", path, body, config);
  }

  /** Create a work schedule */
  async create(company: string, body?: PublicApiV1WorkSchedulesCreateData["body"], config?: RequestConfig): Promise<PublicApiV1WorkSchedulesCreateResponses[201]> {
    const path = this.buildPath("/companies/{company}/work-schedules", { "company": company });
    return this._send<PublicApiV1WorkSchedulesCreateResponses[201]>("POST", path, body, config);
  }

  /** List all work schedules */
  async list(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/work-schedules", { "company": company });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Get an employee’s schedule on a date */
  async employeeSchedule(company: string, employee: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<PublicApiV1WorkSchedulesEmployeeScheduleResponses[200]> {
    const path = this.buildPath("/companies/{company}/work-schedules/employee/{employee}", { "company": company, "employee": employee });
    return this._get<PublicApiV1WorkSchedulesEmployeeScheduleResponses[200]>(path, params, config);
  }

  /** Get work schedule stats */
  async stats(company: string, config?: RequestConfig): Promise<PublicApiV1WorkSchedulesStatsResponses[200]> {
    const path = this.buildPath("/companies/{company}/work-schedules/stats", { "company": company });
    return this._get<PublicApiV1WorkSchedulesStatsResponses[200]>(path, undefined, config);
  }

  /** List a schedule’s assignments */
  async assignments(company: string, schedule: string, config?: RequestConfig): Promise<PublicApiV1WorkSchedulesAssignmentsResponses[200]> {
    const path = this.buildPath("/companies/{company}/work-schedules/{schedule}/assignments", { "company": company, "schedule": schedule });
    return this._get<PublicApiV1WorkSchedulesAssignmentsResponses[200]>(path, undefined, config);
  }

  /** Retrieve a work schedule */
  async show(company: string, schedule: string, config?: RequestConfig): Promise<PublicApiV1WorkSchedulesShowResponses[200]> {
    const path = this.buildPath("/companies/{company}/work-schedules/{schedule}", { "company": company, "schedule": schedule });
    return this._get<PublicApiV1WorkSchedulesShowResponses[200]>(path, undefined, config);
  }

  /** Update a work schedule */
  async update(company: string, schedule: string, body?: PublicApiV1WorkSchedulesUpdateData["body"], config?: RequestConfig): Promise<PublicApiV1WorkSchedulesUpdateResponses[200]> {
    const path = this.buildPath("/companies/{company}/work-schedules/{schedule}", { "company": company, "schedule": schedule });
    return this._send<PublicApiV1WorkSchedulesUpdateResponses[200]>("PATCH", path, body, config);
  }

  /** Unarchive a work schedule */
  async unarchive(company: string, schedule: string, config?: RequestConfig): Promise<PublicApiV1WorkSchedulesUnarchiveResponses[200]> {
    const path = this.buildPath("/companies/{company}/work-schedules/{schedule}/unarchive", { "company": company, "schedule": schedule });
    return this._send<PublicApiV1WorkSchedulesUnarchiveResponses[200]>("POST", path, undefined, config);
  }

  /** Unassign a schedule from an employee */
  async unassign(company: string, schedule: string, body?: PublicApiV1WorkSchedulesUnassignData["body"], config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/work-schedules/{schedule}/unassign", { "company": company, "schedule": schedule });
    return this._send<unknown>("POST", path, body, config);
  }
}
