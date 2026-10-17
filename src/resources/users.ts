// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class UsersResource extends BaseResource {
  /** Retrieve the current user */
  async me(company: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/users/me", { "company": company });
    return this._get<unknown>(path, undefined, config);
  }

  /** List users */
  async list(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/users", { "company": company });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }
}
