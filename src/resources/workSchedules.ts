// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.0.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class WorkSchedulesResource extends BaseResource {
  /** Archive a work schedule */
  async archive(company: string, schedule: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/work-schedules/{schedule}/archive", { "company": company, "schedule": schedule });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Assign a schedule to an employee */
  async assign(company: string, schedule: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/work-schedules/{schedule}/assign", { "company": company, "schedule": schedule });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Create a work schedule */
  async create(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/work-schedules", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** List all work schedules */
  async list(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/work-schedules", { "company": company });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Get an employee’s current schedule */
  async employeeSchedule(company: string, employee: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/work-schedules/employee/{employee}", { "company": company, "employee": employee });
    return this._get<unknown>(path, undefined, config);
  }

  /** Get work schedule stats */
  async stats(company: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/work-schedules/stats", { "company": company });
    return this._get<unknown>(path, undefined, config);
  }

  /** List a schedule’s assignments */
  async assignments(company: string, schedule: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/work-schedules/{schedule}/assignments", { "company": company, "schedule": schedule });
    return this._get<unknown>(path, undefined, config);
  }

  /** Retrieve a work schedule */
  async show(company: string, schedule: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/work-schedules/{schedule}", { "company": company, "schedule": schedule });
    return this._get<unknown>(path, undefined, config);
  }

  /** Update a work schedule */
  async update(company: string, schedule: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/work-schedules/{schedule}", { "company": company, "schedule": schedule });
    return this._send<unknown>("PATCH", path, body, config);
  }

  /** Unarchive a work schedule */
  async unarchive(company: string, schedule: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/work-schedules/{schedule}/unarchive", { "company": company, "schedule": schedule });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Unassign a schedule from an employee */
  async unassign(company: string, schedule: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/work-schedules/{schedule}/unassign", { "company": company, "schedule": schedule });
    return this._send<unknown>("POST", path, body, config);
  }
}
