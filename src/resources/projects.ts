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
  async create(company: string, project: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/projects/{project}/columns", { "company": company, "project": project });
    return this._send<unknown>("POST", path, body, config);
  }

  /** List project columns */
  async list(company: string, project: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/projects/{project}/columns", { "company": company, "project": project });
    return this._get<unknown>(path, undefined, config);
  }

  /** Delete a project column */
  async delete(company: string, project: string, column: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/projects/{project}/columns/{column}", { "company": company, "project": project, "column": column });
    return this._delete<unknown>(path, params, config, { idempotent: true });
  }

  /** Update a project column */
  async update(company: string, project: string, column: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/projects/{project}/columns/{column}", { "company": company, "project": project, "column": column });
    return this._send<unknown>("PATCH", path, body, config);
  }

  /** Reorder project columns */
  async reorder(company: string, project: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/projects/{project}/columns/reorder", { "company": company, "project": project });
    return this._send<unknown>("PUT", path, body, config);
  }
}

export class ProjectsCustomFieldsResource extends BaseResource {
  /** Create a project custom field */
  async create(company: string, project: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/projects/{project}/custom-fields", { "company": company, "project": project });
    return this._send<unknown>("POST", path, body, config);
  }

  /** List project custom fields */
  async list(company: string, project: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/projects/{project}/custom-fields", { "company": company, "project": project });
    return this._get<unknown>(path, undefined, config);
  }

  /** Delete a project custom field */
  async delete(company: string, project: string, field: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/projects/{project}/custom-fields/{field}", { "company": company, "project": project, "field": field });
    return this._send<unknown>("DELETE", path, undefined, config, { idempotent: true });
  }

  /** Update a project custom field */
  async update(company: string, project: string, field: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/projects/{project}/custom-fields/{field}", { "company": company, "project": project, "field": field });
    return this._send<unknown>("PATCH", path, body, config);
  }
}

export class ProjectsTasksResource extends BaseResource {
  /** Export project tasks */
  async export(company: string, project: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/projects/{project}/tasks/export", { "company": company, "project": project });
    return this._get<unknown>(path, undefined, config);
  }

  /** Import tasks into a project */
  async import(company: string, project: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/projects/{project}/tasks/import", { "company": company, "project": project });
    return this._send<unknown>("POST", path, body, config);
  }
}

export class ProjectsTimeSummaryResource extends BaseResource {
  /** Retrieve a project time summary */
  async show(company: string, project: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/projects/{project}/time-summary", { "company": company, "project": project });
    return this._get<unknown>(path, params, config);
  }
}

export class ProjectsTimeInvoicesResource extends BaseResource {
  /** Invoice project time */
  async create(company: string, project: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/projects/{project}/time-invoices", { "company": company, "project": project });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Preview a project time invoice */
  async preview(company: string, project: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/projects/{project}/time-invoices/preview", { "company": company, "project": project });
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
  async archive(company: string, project: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/projects/{project}/archive", { "company": company, "project": project });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Create a project */
  async create(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/projects", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** List projects */
  async list(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/projects", { "company": company });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Delete a project */
  async delete(company: string, project: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/projects/{project}", { "company": company, "project": project });
    return this._send<unknown>("DELETE", path, undefined, config, { idempotent: true });
  }

  /** Retrieve a project */
  async show(company: string, project: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/projects/{project}", { "company": company, "project": project });
    return this._get<unknown>(path, undefined, config);
  }

  /** Update a project */
  async update(company: string, project: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/projects/{project}", { "company": company, "project": project });
    return this._send<unknown>("PATCH", path, body, config);
  }

  /** Find a project by key */
  async findByKey(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/projects/find-by-key", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Unarchive a project */
  async unarchive(company: string, project: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/projects/{project}/unarchive", { "company": company, "project": project });
    return this._send<unknown>("POST", path, undefined, config);
  }
}
