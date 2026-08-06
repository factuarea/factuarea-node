// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.0.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class EmployeesResource extends BaseResource {
  /** Create an employee */
  async create(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/employees";
    return this._send<unknown>("POST", path, body, config);
  }

  /** List all employees */
  async list(params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    return this._paginate<unknown>("/employees", params, "starting_after");
  }

  /** Deactivate an employee */
  async deactivate(employee: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/employees/{employee}/deactivate", { "employee": employee });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Find an employee by external ID */
  async findByExternalId(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/employees/find-by-external-id";
    return this._send<unknown>("POST", path, body, config);
  }

  /** Get employee stats */
  async stats(config?: RequestConfig): Promise<unknown> {
    const path = "/employees/stats";
    return this._get<unknown>(path, undefined, config);
  }

  /** Reactivate an employee */
  async reactivate(employee: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/employees/{employee}/reactivate", { "employee": employee });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Retrieve an employee */
  async show(employee: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/employees/{employee}", { "employee": employee });
    return this._get<unknown>(path, undefined, config);
  }

  /** Update an employee */
  async update(employee: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/employees/{employee}", { "employee": employee });
    return this._send<unknown>("PUT", path, body, config);
  }
}
