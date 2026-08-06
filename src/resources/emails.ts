// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.0.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class EmailsResource extends BaseResource {
  /** Summarize email delivery per document */
  async indicators(params?: Record<string, unknown>, config?: RequestConfig): Promise<unknown> {
    const path = "/emails/indicators";
    return this._get<unknown>(path, params, config);
  }

  /** List sent emails */
  async list(params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    return this._paginate<unknown>("/emails", params, "starting_after");
  }

  /** Retrieve a sent email */
  async show(email: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/emails/{email}", { "email": email });
    return this._get<unknown>(path, undefined, config);
  }
}
