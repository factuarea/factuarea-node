// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";
import type { PublicApiV1EmployeesCreateData, PublicApiV1EmployeesCreateResponses, PublicApiV1EmployeesDeactivateData, PublicApiV1EmployeesDeactivateResponses, PublicApiV1EmployeesFindByExternalIdData, PublicApiV1EmployeesFindByExternalIdResponses, PublicApiV1EmployeesReactivateResponses, PublicApiV1EmployeesShowResponses, PublicApiV1EmployeesStatsResponses, PublicApiV1EmployeesUpdateData, PublicApiV1EmployeesUpdateResponses } from "../generated/types.gen.js";


export class EmployeesResource extends BaseResource {
  /** Create an employee */
  async create(company: string, body?: PublicApiV1EmployeesCreateData["body"], config?: RequestConfig): Promise<PublicApiV1EmployeesCreateResponses[201]> {
    const path = this.buildPath("/companies/{company}/employees", { "company": company });
    return this._send<PublicApiV1EmployeesCreateResponses[201]>("POST", path, body, config);
  }

  /** List all employees */
  async list(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/employees", { "company": company });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Deactivate an employee */
  async deactivate(company: string, employee: string, body?: PublicApiV1EmployeesDeactivateData["body"], config?: RequestConfig): Promise<PublicApiV1EmployeesDeactivateResponses[200]> {
    const path = this.buildPath("/companies/{company}/employees/{employee}/deactivate", { "company": company, "employee": employee });
    return this._send<PublicApiV1EmployeesDeactivateResponses[200]>("POST", path, body, config);
  }

  /** Find an employee by external ID */
  async findByExternalId(company: string, body?: PublicApiV1EmployeesFindByExternalIdData["body"], config?: RequestConfig): Promise<PublicApiV1EmployeesFindByExternalIdResponses[200]> {
    const path = this.buildPath("/companies/{company}/employees/find-by-external-id", { "company": company });
    return this._send<PublicApiV1EmployeesFindByExternalIdResponses[200]>("POST", path, body, config);
  }

  /** Get employee stats */
  async stats(company: string, config?: RequestConfig): Promise<PublicApiV1EmployeesStatsResponses[200]> {
    const path = this.buildPath("/companies/{company}/employees/stats", { "company": company });
    return this._get<PublicApiV1EmployeesStatsResponses[200]>(path, undefined, config);
  }

  /** Reactivate an employee */
  async reactivate(company: string, employee: string, config?: RequestConfig): Promise<PublicApiV1EmployeesReactivateResponses[200]> {
    const path = this.buildPath("/companies/{company}/employees/{employee}/reactivate", { "company": company, "employee": employee });
    return this._send<PublicApiV1EmployeesReactivateResponses[200]>("POST", path, undefined, config);
  }

  /** Retrieve an employee */
  async show(company: string, employee: string, config?: RequestConfig): Promise<PublicApiV1EmployeesShowResponses[200]> {
    const path = this.buildPath("/companies/{company}/employees/{employee}", { "company": company, "employee": employee });
    return this._get<PublicApiV1EmployeesShowResponses[200]>(path, undefined, config);
  }

  /** Update an employee */
  async update(company: string, employee: string, body?: PublicApiV1EmployeesUpdateData["body"], config?: RequestConfig): Promise<PublicApiV1EmployeesUpdateResponses[200]> {
    const path = this.buildPath("/companies/{company}/employees/{employee}", { "company": company, "employee": employee });
    return this._send<PublicApiV1EmployeesUpdateResponses[200]>("PATCH", path, body, config);
  }
}
