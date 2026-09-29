// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class ProjectsColumnsResource extends BaseResource {
  /** Create a project column */
  async create(project: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/projects/{project}/columns", { "project": project });
    return this._send<unknown>("POST", path, body, config);
  }

  /** List project columns */
  async list(project: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/projects/{project}/columns", { "project": project });
    return this._get<unknown>(path, undefined, config);
  }

  /** Delete a project column */
  async delete(project: string, column: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/projects/{project}/columns/{column}", { "project": project, "column": column });
    return this._delete<unknown>(path, params, config, { idempotent: true });
  }

  /** Update a project column */
  async update(project: string, column: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/projects/{project}/columns/{column}", { "project": project, "column": column });
    return this._send<unknown>("PUT", path, body, config);
  }

  /** Reorder project columns */
  async reorder(project: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/projects/{project}/columns/reorder", { "project": project });
    return this._send<unknown>("PUT", path, body, config);
  }
}

export class ProjectsCustomFieldsResource extends BaseResource {
  /** Create a project custom field */
  async create(project: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/projects/{project}/custom-fields", { "project": project });
    return this._send<unknown>("POST", path, body, config);
  }

  /** List project custom fields */
  async list(project: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/projects/{project}/custom-fields", { "project": project });
    return this._get<unknown>(path, undefined, config);
  }

  /** Delete a project custom field */
  async delete(project: string, field: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/projects/{project}/custom-fields/{field}", { "project": project, "field": field });
    return this._send<unknown>("DELETE", path, undefined, config, { idempotent: true });
  }

  /** Update a project custom field */
  async update(project: string, field: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/projects/{project}/custom-fields/{field}", { "project": project, "field": field });
    return this._send<unknown>("PUT", path, body, config);
  }
}

export class ProjectsTasksResource extends BaseResource {
  /** Export project tasks */
  async export(project: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/projects/{project}/tasks/export", { "project": project });
    return this._get<unknown>(path, undefined, config);
  }

  /** Import tasks into a project */
  async import(project: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/projects/{project}/tasks/import", { "project": project });
    return this._send<unknown>("POST", path, body, config);
  }
}

export class ProjectsTimeSummaryResource extends BaseResource {
  /** Retrieve a project time summary */
  async show(project: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/projects/{project}/time-summary", { "project": project });
    return this._get<unknown>(path, params, config);
  }
}

export class ProjectsTimeInvoicesResource extends BaseResource {
  /** Invoice project time */
  async create(project: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/projects/{project}/time-invoices", { "project": project });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Preview a project time invoice */
  async preview(project: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/projects/{project}/time-invoices/preview", { "project": project });
    return this._send<unknown>("POST", path, body, config);
  }
}

export class ProjectsResource extends BaseResource {
  readonly columns: ProjectsColumnsResource;
  readonly customFields: ProjectsCustomFieldsResource;
  readonly tasks: ProjectsTasksResource;
  readonly timeSummary: ProjectsTimeSummaryResource;
  readonly timeInvoices: ProjectsTimeInvoicesResource;

  constructor(client: HttpClient) {
    super(client);
    this.columns = new ProjectsColumnsResource(client);
    this.customFields = new ProjectsCustomFieldsResource(client);
    this.tasks = new ProjectsTasksResource(client);
    this.timeSummary = new ProjectsTimeSummaryResource(client);
    this.timeInvoices = new ProjectsTimeInvoicesResource(client);
  }

  /** Archive a project */
  async archive(project: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/projects/{project}/archive", { "project": project });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Create a project */
  async create(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/projects";
    return this._send<unknown>("POST", path, body, config);
  }

  /** List projects */
  async list(params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    return this._paginate<unknown>("/projects", params, "starting_after", config);
  }

  /** Delete a project */
  async delete(project: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/projects/{project}", { "project": project });
    return this._send<unknown>("DELETE", path, undefined, config, { idempotent: true });
  }

  /** Retrieve a project */
  async show(project: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/projects/{project}", { "project": project });
    return this._get<unknown>(path, undefined, config);
  }

  /** Update a project */
  async update(project: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/projects/{project}", { "project": project });
    return this._send<unknown>("PUT", path, body, config);
  }

  /** Find a project by key */
  async findByKey(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/projects/find-by-key";
    return this._send<unknown>("POST", path, body, config);
  }

  /** Unarchive a project */
  async unarchive(project: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/projects/{project}/unarchive", { "project": project });
    return this._send<unknown>("POST", path, undefined, config);
  }
}
