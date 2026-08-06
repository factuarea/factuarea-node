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
  async archive(schedule: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/work-schedules/{schedule}/archive", { "schedule": schedule });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Assign a schedule to an employee */
  async assign(schedule: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/work-schedules/{schedule}/assign", { "schedule": schedule });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Create a work schedule */
  async create(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/work-schedules";
    return this._send<unknown>("POST", path, body, config);
  }

  /** List all work schedules */
  async list(params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    return this._paginate<unknown>("/work-schedules", params, "starting_after");
  }

  /** Get an employee’s current schedule */
  async employeeSchedule(employee: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/work-schedules/employee/{employee}", { "employee": employee });
    return this._get<unknown>(path, undefined, config);
  }

  /** Get work schedule stats */
  async stats(config?: RequestConfig): Promise<unknown> {
    const path = "/work-schedules/stats";
    return this._get<unknown>(path, undefined, config);
  }

  /** List a schedule’s assignments */
  async assignments(schedule: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/work-schedules/{schedule}/assignments", { "schedule": schedule });
    return this._get<unknown>(path, undefined, config);
  }

  /** Retrieve a work schedule */
  async show(schedule: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/work-schedules/{schedule}", { "schedule": schedule });
    return this._get<unknown>(path, undefined, config);
  }

  /** Update a work schedule */
  async update(schedule: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/work-schedules/{schedule}", { "schedule": schedule });
    return this._send<unknown>("PUT", path, body, config);
  }

  /** Unarchive a work schedule */
  async unarchive(schedule: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/work-schedules/{schedule}/unarchive", { "schedule": schedule });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Unassign a schedule from an employee */
  async unassign(schedule: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/work-schedules/{schedule}/unassign", { "schedule": schedule });
    return this._send<unknown>("POST", path, body, config);
  }
}
