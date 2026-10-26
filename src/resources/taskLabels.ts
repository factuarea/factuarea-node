// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";
import type { PublicApiV1TaskLabelsCreateData, PublicApiV1TaskLabelsCreateResponses, PublicApiV1TaskLabelsDeleteResponses, PublicApiV1TaskLabelsShowResponses, PublicApiV1TaskLabelsUpdateData, PublicApiV1TaskLabelsUpdateResponses } from "../generated/types.gen.js";


export class TaskLabelsResource extends BaseResource {
  /** Create a task label */
  async create(company: string, body?: PublicApiV1TaskLabelsCreateData["body"], config?: RequestConfig): Promise<PublicApiV1TaskLabelsCreateResponses[201]> {
    const path = this.buildPath("/companies/{company}/task-labels", { "company": company });
    return this._send<PublicApiV1TaskLabelsCreateResponses[201]>("POST", path, body, config);
  }

  /** List task labels */
  async list(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/task-labels", { "company": company });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Delete a task label */
  async delete(company: string, label: string, config?: RequestConfig): Promise<PublicApiV1TaskLabelsDeleteResponses[200]> {
    const path = this.buildPath("/companies/{company}/task-labels/{label}", { "company": company, "label": label });
    return this._send<PublicApiV1TaskLabelsDeleteResponses[200]>("DELETE", path, undefined, config, { idempotent: true });
  }

  /** Retrieve a task label */
  async show(company: string, label: string, config?: RequestConfig): Promise<PublicApiV1TaskLabelsShowResponses[200]> {
    const path = this.buildPath("/companies/{company}/task-labels/{label}", { "company": company, "label": label });
    return this._get<PublicApiV1TaskLabelsShowResponses[200]>(path, undefined, config);
  }

  /** Update a task label */
  async update(company: string, label: string, body?: PublicApiV1TaskLabelsUpdateData["body"], config?: RequestConfig): Promise<PublicApiV1TaskLabelsUpdateResponses[200]> {
    const path = this.buildPath("/companies/{company}/task-labels/{label}", { "company": company, "label": label });
    return this._send<PublicApiV1TaskLabelsUpdateResponses[200]>("PATCH", path, body, config);
  }
}
