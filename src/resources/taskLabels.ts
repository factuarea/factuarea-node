// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class TaskLabelsResource extends BaseResource {
  /** Create a task label */
  async create(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/task-labels";
    return this._send<unknown>("POST", path, body, config);
  }

  /** List task labels */
  async list(params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    return this._paginate<unknown>("/task-labels", params, "starting_after", config);
  }

  /** Delete a task label */
  async delete(label: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/task-labels/{label}", { "label": label });
    return this._send<unknown>("DELETE", path, undefined, config, { idempotent: true });
  }

  /** Retrieve a task label */
  async show(label: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/task-labels/{label}", { "label": label });
    return this._get<unknown>(path, undefined, config);
  }

  /** Update a task label */
  async update(label: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/task-labels/{label}", { "label": label });
    return this._send<unknown>("PUT", path, body, config);
  }
}
