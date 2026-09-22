// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.0.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class PresenceResource extends BaseResource {
  /** Retrieve an employee’s live presence */
  async show(company: string, employee: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/presence/{employee}", { "company": company, "employee": employee });
    return this._get<unknown>(path, undefined, config);
  }

  /** Get the live team presence */
  async live(company: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/presence", { "company": company });
    return this._get<unknown>(path, undefined, config);
  }

  /** List office/remote presence declarations */
  async daily(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/presence/daily", { "company": company });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }
}
