// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.0.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class TimeCorrectionsResource extends BaseResource {
  /** Approve a time entry correction */
  async approve(timeCorrection: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/time-corrections/{time_correction}/approve", { "time_correction": timeCorrection });
    return this._send<unknown>("POST", path, body, config);
  }

  /** List all time entry corrections */
  async list(params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    return this._paginate<unknown>("/time-corrections", params, "starting_after");
  }

  /** Request a time entry correction */
  async create(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/time-corrections";
    return this._send<unknown>("POST", path, body, config);
  }

  /** Reject a time entry correction */
  async reject(timeCorrection: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/time-corrections/{time_correction}/reject", { "time_correction": timeCorrection });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Retrieve a time entry correction */
  async show(timeCorrection: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/time-corrections/{time_correction}", { "time_correction": timeCorrection });
    return this._get<unknown>(path, undefined, config);
  }
}
