// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";
import type { PublicApiV1ProjectsArchiveResponses, PublicApiV1ProjectsColumnsCreateData, PublicApiV1ProjectsColumnsCreateResponses, PublicApiV1ProjectsColumnsDeleteResponses, PublicApiV1ProjectsColumnsListResponses, PublicApiV1ProjectsColumnsReorderData, PublicApiV1ProjectsColumnsReorderResponses, PublicApiV1ProjectsColumnsUpdateData, PublicApiV1ProjectsColumnsUpdateResponses, PublicApiV1ProjectsCreateData, PublicApiV1ProjectsCreateResponses, PublicApiV1ProjectsCustomFieldsCreateData, PublicApiV1ProjectsCustomFieldsCreateResponses, PublicApiV1ProjectsCustomFieldsDeleteResponses, PublicApiV1ProjectsCustomFieldsListResponses, PublicApiV1ProjectsCustomFieldsUpdateData, PublicApiV1ProjectsCustomFieldsUpdateResponses, PublicApiV1ProjectsDeleteResponses, PublicApiV1ProjectsFindByKeyData, PublicApiV1ProjectsFindByKeyResponses, PublicApiV1ProjectsShowResponses, PublicApiV1ProjectsTasksExportResponses, PublicApiV1ProjectsTasksImportData, PublicApiV1ProjectsTasksImportResponses, PublicApiV1ProjectsTimeInvoicesCreateData, PublicApiV1ProjectsTimeInvoicesCreateResponses, PublicApiV1ProjectsTimeInvoicesPreviewData, PublicApiV1ProjectsTimeInvoicesPreviewResponses, PublicApiV1ProjectsTimeSummaryShowResponses, PublicApiV1ProjectsUnarchiveResponses, PublicApiV1ProjectsUpdateData, PublicApiV1ProjectsUpdateResponses } from "../generated/types.gen.js";


export class ProjectsColumnsResource extends BaseResource {
  /** Create a project column */
  async create(company: string, project: string, body?: PublicApiV1ProjectsColumnsCreateData["body"], config?: RequestConfig): Promise<PublicApiV1ProjectsColumnsCreateResponses[201]> {
    const path = this.buildPath("/companies/{company}/projects/{project}/columns", { "company": company, "project": project });
    return this._send<PublicApiV1ProjectsColumnsCreateResponses[201]>("POST", path, body, config);
  }

  /** List project columns */
  async list(company: string, project: string, config?: RequestConfig): Promise<PublicApiV1ProjectsColumnsListResponses[200]> {
    const path = this.buildPath("/companies/{company}/projects/{project}/columns", { "company": company, "project": project });
    return this._get<PublicApiV1ProjectsColumnsListResponses[200]>(path, undefined, config);
  }

  /** Delete a project column */
  async delete(company: string, project: string, column: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<PublicApiV1ProjectsColumnsDeleteResponses[200]> {
    const path = this.buildPath("/companies/{company}/projects/{project}/columns/{column}", { "company": company, "project": project, "column": column });
    return this._delete<PublicApiV1ProjectsColumnsDeleteResponses[200]>(path, params, config, { idempotent: true });
  }

  /** Update a project column */
  async update(company: string, project: string, column: string, body?: PublicApiV1ProjectsColumnsUpdateData["body"], config?: RequestConfig): Promise<PublicApiV1ProjectsColumnsUpdateResponses[200]> {
    const path = this.buildPath("/companies/{company}/projects/{project}/columns/{column}", { "company": company, "project": project, "column": column });
    return this._send<PublicApiV1ProjectsColumnsUpdateResponses[200]>("PATCH", path, body, config);
  }

  /** Reorder project columns */
  async reorder(company: string, project: string, body?: PublicApiV1ProjectsColumnsReorderData["body"], config?: RequestConfig): Promise<PublicApiV1ProjectsColumnsReorderResponses[200]> {
    const path = this.buildPath("/companies/{company}/projects/{project}/columns/reorder", { "company": company, "project": project });
    return this._send<PublicApiV1ProjectsColumnsReorderResponses[200]>("PUT", path, body, config);
  }
}

export class ProjectsCustomFieldsResource extends BaseResource {
  /** Create a project custom field */
  async create(company: string, project: string, body?: PublicApiV1ProjectsCustomFieldsCreateData["body"], config?: RequestConfig): Promise<PublicApiV1ProjectsCustomFieldsCreateResponses[201]> {
    const path = this.buildPath("/companies/{company}/projects/{project}/custom-fields", { "company": company, "project": project });
    return this._send<PublicApiV1ProjectsCustomFieldsCreateResponses[201]>("POST", path, body, config);
  }

  /** List project custom fields */
  async list(company: string, project: string, config?: RequestConfig): Promise<PublicApiV1ProjectsCustomFieldsListResponses[200]> {
    const path = this.buildPath("/companies/{company}/projects/{project}/custom-fields", { "company": company, "project": project });
    return this._get<PublicApiV1ProjectsCustomFieldsListResponses[200]>(path, undefined, config);
  }

  /** Delete a project custom field */
  async delete(company: string, project: string, field: string, config?: RequestConfig): Promise<PublicApiV1ProjectsCustomFieldsDeleteResponses[200]> {
    const path = this.buildPath("/companies/{company}/projects/{project}/custom-fields/{field}", { "company": company, "project": project, "field": field });
    return this._send<PublicApiV1ProjectsCustomFieldsDeleteResponses[200]>("DELETE", path, undefined, config, { idempotent: true });
  }

  /** Update a project custom field */
  async update(company: string, project: string, field: string, body?: PublicApiV1ProjectsCustomFieldsUpdateData["body"], config?: RequestConfig): Promise<PublicApiV1ProjectsCustomFieldsUpdateResponses[200]> {
    const path = this.buildPath("/companies/{company}/projects/{project}/custom-fields/{field}", { "company": company, "project": project, "field": field });
    return this._send<PublicApiV1ProjectsCustomFieldsUpdateResponses[200]>("PATCH", path, body, config);
  }
}

export class ProjectsTasksResource extends BaseResource {
  /** Export project tasks */
  async export(company: string, project: string, config?: RequestConfig): Promise<PublicApiV1ProjectsTasksExportResponses[200]> {
    const path = this.buildPath("/companies/{company}/projects/{project}/tasks/export", { "company": company, "project": project });
    return this._get<PublicApiV1ProjectsTasksExportResponses[200]>(path, undefined, config);
  }

  /** Import tasks into a project */
  async import(company: string, project: string, body?: PublicApiV1ProjectsTasksImportData["body"], config?: RequestConfig): Promise<PublicApiV1ProjectsTasksImportResponses[200]> {
    const path = this.buildPath("/companies/{company}/projects/{project}/tasks/import", { "company": company, "project": project });
    return this._send<PublicApiV1ProjectsTasksImportResponses[200]>("POST", path, body, config);
  }
}

export class ProjectsTimeSummaryResource extends BaseResource {
  /** Retrieve a project time summary */
  async show(company: string, project: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<PublicApiV1ProjectsTimeSummaryShowResponses[200]> {
    const path = this.buildPath("/companies/{company}/projects/{project}/time-summary", { "company": company, "project": project });
    return this._get<PublicApiV1ProjectsTimeSummaryShowResponses[200]>(path, params, config);
  }
}

export class ProjectsTimeInvoicesResource extends BaseResource {
  /** Invoice project time */
  async create(company: string, project: string, body?: PublicApiV1ProjectsTimeInvoicesCreateData["body"], config?: RequestConfig): Promise<PublicApiV1ProjectsTimeInvoicesCreateResponses[201]> {
    const path = this.buildPath("/companies/{company}/projects/{project}/time-invoices", { "company": company, "project": project });
    return this._send<PublicApiV1ProjectsTimeInvoicesCreateResponses[201]>("POST", path, body, config);
  }

  /** Preview a project time invoice */
  async preview(company: string, project: string, body?: PublicApiV1ProjectsTimeInvoicesPreviewData["body"], config?: RequestConfig): Promise<PublicApiV1ProjectsTimeInvoicesPreviewResponses[200]> {
    const path = this.buildPath("/companies/{company}/projects/{project}/time-invoices/preview", { "company": company, "project": project });
    return this._send<PublicApiV1ProjectsTimeInvoicesPreviewResponses[200]>("POST", path, body, config);
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
  async archive(company: string, project: string, config?: RequestConfig): Promise<PublicApiV1ProjectsArchiveResponses[200]> {
    const path = this.buildPath("/companies/{company}/projects/{project}/archive", { "company": company, "project": project });
    return this._send<PublicApiV1ProjectsArchiveResponses[200]>("POST", path, undefined, config);
  }

  /** Create a project */
  async create(company: string, body?: PublicApiV1ProjectsCreateData["body"], config?: RequestConfig): Promise<PublicApiV1ProjectsCreateResponses[201]> {
    const path = this.buildPath("/companies/{company}/projects", { "company": company });
    return this._send<PublicApiV1ProjectsCreateResponses[201]>("POST", path, body, config);
  }

  /** List projects */
  async list(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/projects", { "company": company });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Delete a project */
  async delete(company: string, project: string, config?: RequestConfig): Promise<PublicApiV1ProjectsDeleteResponses[200]> {
    const path = this.buildPath("/companies/{company}/projects/{project}", { "company": company, "project": project });
    return this._send<PublicApiV1ProjectsDeleteResponses[200]>("DELETE", path, undefined, config, { idempotent: true });
  }

  /** Retrieve a project */
  async show(company: string, project: string, config?: RequestConfig): Promise<PublicApiV1ProjectsShowResponses[200]> {
    const path = this.buildPath("/companies/{company}/projects/{project}", { "company": company, "project": project });
    return this._get<PublicApiV1ProjectsShowResponses[200]>(path, undefined, config);
  }

  /** Update a project */
  async update(company: string, project: string, body?: PublicApiV1ProjectsUpdateData["body"], config?: RequestConfig): Promise<PublicApiV1ProjectsUpdateResponses[200]> {
    const path = this.buildPath("/companies/{company}/projects/{project}", { "company": company, "project": project });
    return this._send<PublicApiV1ProjectsUpdateResponses[200]>("PATCH", path, body, config);
  }

  /** Find a project by key */
  async findByKey(company: string, body?: PublicApiV1ProjectsFindByKeyData["body"], config?: RequestConfig): Promise<PublicApiV1ProjectsFindByKeyResponses[200]> {
    const path = this.buildPath("/companies/{company}/projects/find-by-key", { "company": company });
    return this._send<PublicApiV1ProjectsFindByKeyResponses[200]>("POST", path, body, config);
  }

  /** Unarchive a project */
  async unarchive(company: string, project: string, config?: RequestConfig): Promise<PublicApiV1ProjectsUnarchiveResponses[200]> {
    const path = this.buildPath("/companies/{company}/projects/{project}/unarchive", { "company": company, "project": project });
    return this._send<PublicApiV1ProjectsUnarchiveResponses[200]>("POST", path, undefined, config);
  }
}
