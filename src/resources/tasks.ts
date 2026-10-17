// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class TasksCommentsResource extends BaseResource {
  /** Create a task comment */
  async create(company: string, task: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/tasks/{task}/comments", { "company": company, "task": task });
    return this._send<unknown>("POST", path, body, config);
  }

  /** List task comments */
  async list(company: string, task: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/tasks/{task}/comments", { "company": company, "task": task });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Delete a task comment */
  async delete(company: string, task: string, comment: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/tasks/{task}/comments/{comment}", { "company": company, "task": task, "comment": comment });
    return this._send<unknown>("DELETE", path, undefined, config, { idempotent: true });
  }

  /** Update a task comment */
  async update(company: string, task: string, comment: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/tasks/{task}/comments/{comment}", { "company": company, "task": task, "comment": comment });
    return this._send<unknown>("PUT", path, body, config);
  }
}

export class TasksExternalLinksResource extends BaseResource {
  /** Create a task external link */
  async create(company: string, task: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/tasks/{task}/external-links", { "company": company, "task": task });
    return this._send<unknown>("POST", path, body, config);
  }

  /** List task external links */
  async list(company: string, task: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/tasks/{task}/external-links", { "company": company, "task": task });
    return this._get<unknown>(path, undefined, config);
  }

  /** Delete a task external link */
  async delete(company: string, task: string, link: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/tasks/{task}/external-links/{link}", { "company": company, "task": task, "link": link });
    return this._send<unknown>("DELETE", path, undefined, config);
  }
}

export class TasksLabelsResource extends BaseResource {
  /** Assign a label to a task */
  async assign(company: string, task: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/tasks/{task}/labels", { "company": company, "task": task });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Remove a label from a task */
  async unassign(company: string, task: string, label: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/tasks/{task}/labels/{label}", { "company": company, "task": task, "label": label });
    return this._send<unknown>("DELETE", path, undefined, config);
  }
}

export class TasksRelationsResource extends BaseResource {
  /** Create a task relation */
  async create(company: string, task: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/tasks/{task}/relations", { "company": company, "task": task });
    return this._send<unknown>("POST", path, body, config);
  }

  /** List task relations */
  async list(company: string, task: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/tasks/{task}/relations", { "company": company, "task": task });
    return this._get<unknown>(path, undefined, config);
  }

  /** Delete a task relation */
  async delete(company: string, task: string, relation: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/tasks/{task}/relations/{relation}", { "company": company, "task": task, "relation": relation });
    return this._send<unknown>("DELETE", path, undefined, config);
  }
}

export class TasksUploadLinksResource extends BaseResource {
  /** Create a task upload link */
  async create(company: string, task: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/tasks/{task}/upload-links", { "company": company, "task": task });
    return this._send<unknown>("POST", path, body, config);
  }
}

export class TasksAttachmentsResource extends BaseResource {
  /** Delete a task attachment */
  async delete(company: string, task: string, attachment: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/tasks/{task}/attachments/{attachment}", { "company": company, "task": task, "attachment": attachment });
    return this._send<unknown>("DELETE", path, undefined, config, { idempotent: true });
  }

  /** Retrieve a task attachment */
  async show(company: string, task: string, attachment: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/tasks/{task}/attachments/{attachment}", { "company": company, "task": task, "attachment": attachment });
    return this._get<unknown>(path, undefined, config);
  }

  /** Download a task attachment */
  async download(company: string, task: string, attachment: string, config?: RequestConfig): Promise<BinaryResponse> {
    const path = this.buildPath("/companies/{company}/tasks/{task}/attachments/{attachment}/download", { "company": company, "task": task, "attachment": attachment });
    return this._binary(path, "GET", undefined, undefined, config);
  }

  /** List task attachments */
  async list(company: string, task: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/tasks/{task}/attachments", { "company": company, "task": task });
    return this._get<unknown>(path, undefined, config);
  }

  /** Upload a task attachment */
  async create(company: string, task: string, formData: FormData, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/tasks/{task}/attachments", { "company": company, "task": task });
    return this._sendForm<unknown>(path, formData, config);
  }
}

export class TasksTimeEntriesResource extends BaseResource {
  /** Delete a task time entry */
  async delete(company: string, task: string, timeEntry: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/tasks/{task}/time-entries/{time_entry}", { "company": company, "task": task, "time_entry": timeEntry });
    return this._send<unknown>("DELETE", path, undefined, config, { idempotent: true });
  }

  /** Retrieve a task time entry */
  async show(company: string, task: string, timeEntry: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/tasks/{task}/time-entries/{time_entry}", { "company": company, "task": task, "time_entry": timeEntry });
    return this._get<unknown>(path, undefined, config);
  }

  /** Update a task time entry */
  async update(company: string, task: string, timeEntry: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/tasks/{task}/time-entries/{time_entry}", { "company": company, "task": task, "time_entry": timeEntry });
    return this._send<unknown>("PATCH", path, body, config);
  }

  /** List task time entries */
  async list(company: string, task: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/tasks/{task}/time-entries", { "company": company, "task": task });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Create a task time entry */
  async create(company: string, task: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/tasks/{task}/time-entries", { "company": company, "task": task });
    return this._send<unknown>("POST", path, body, config);
  }
}

export class TasksActivitiesResource extends BaseResource {
  /** List task activity */
  async list(company: string, task: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/tasks/{task}/activities", { "company": company, "task": task });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }
}

export class TasksEntityLinksResource extends BaseResource {
  /** Link a task to an entity */
  async create(company: string, task: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/tasks/{task}/entity-links", { "company": company, "task": task });
    return this._send<unknown>("POST", path, body, config);
  }

  /** List task entity links */
  async list(company: string, task: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/tasks/{task}/entity-links", { "company": company, "task": task });
    return this._get<unknown>(path, undefined, config);
  }

  /** Unlink a task from an entity */
  async delete(company: string, task: string, link: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/tasks/{task}/entity-links/{link}", { "company": company, "task": task, "link": link });
    return this._send<unknown>("DELETE", path, undefined, config);
  }
}

export class TasksCustomFieldsResource extends BaseResource {
  /** Set a task custom field value */
  async set(company: string, task: string, field: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/tasks/{task}/custom-fields/{field}", { "company": company, "task": task, "field": field });
    return this._send<unknown>("PUT", path, body, config);
  }
}

export class TasksTimerResource extends BaseResource {
  /** Start a task timer */
  async start(company: string, task: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/tasks/{task}/timer/start", { "company": company, "task": task });
    return this._send<unknown>("POST", path, undefined, config);
  }
}

export class TasksResource extends BaseResource {
  readonly comments: TasksCommentsResource;
  readonly externalLinks: TasksExternalLinksResource;
  readonly labels: TasksLabelsResource;
  readonly relations: TasksRelationsResource;
  readonly uploadLinks: TasksUploadLinksResource;
  readonly attachments: TasksAttachmentsResource;
  readonly timeEntries: TasksTimeEntriesResource;
  readonly activities: TasksActivitiesResource;
  readonly entityLinks: TasksEntityLinksResource;
  readonly customFields: TasksCustomFieldsResource;
  readonly timer: TasksTimerResource;

  constructor(client: HttpClient) {
    super(client);
    this.comments = new TasksCommentsResource(client);
    this.externalLinks = new TasksExternalLinksResource(client);
    this.labels = new TasksLabelsResource(client);
    this.relations = new TasksRelationsResource(client);
    this.uploadLinks = new TasksUploadLinksResource(client);
    this.attachments = new TasksAttachmentsResource(client);
    this.timeEntries = new TasksTimeEntriesResource(client);
    this.activities = new TasksActivitiesResource(client);
    this.entityLinks = new TasksEntityLinksResource(client);
    this.customFields = new TasksCustomFieldsResource(client);
    this.timer = new TasksTimerResource(client);
  }

  /** Assign a task */
  async assign(company: string, task: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/tasks/{task}/assign", { "company": company, "task": task });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Bulk change task status */
  async bulkStatus(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/tasks/bulk-status", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Bulk delete tasks */
  async bulkDelete(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/tasks/bulk-delete", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Bulk update tasks */
  async bulkUpdate(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/tasks/bulk-update", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Change task status */
  async status(company: string, task: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/tasks/{task}/status", { "company": company, "task": task });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Create a task */
  async create(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/tasks", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Search tasks */
  async search(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/tasks", { "company": company });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Delete a task */
  async delete(company: string, task: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/tasks/{task}", { "company": company, "task": task });
    return this._send<unknown>("DELETE", path, undefined, config, { idempotent: true });
  }

  /** Retrieve a task */
  async show(company: string, task: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/tasks/{task}", { "company": company, "task": task });
    return this._get<unknown>(path, undefined, config);
  }

  /** Update a task */
  async update(company: string, task: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/tasks/{task}", { "company": company, "task": task });
    return this._send<unknown>("PATCH", path, body, config);
  }

  /** Duplicate a task */
  async duplicate(company: string, task: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/tasks/{task}/duplicate", { "company": company, "task": task });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Find a task by key */
  async findByKey(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/tasks/find-by-key", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** List tasks linked to an entity */
  async linked(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/tasks/linked", { "company": company });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Reposition a task */
  async reposition(company: string, task: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/tasks/{task}/reposition", { "company": company, "task": task });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Move a task to another project */
  async move(company: string, task: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/tasks/{task}/move", { "company": company, "task": task });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Unassign a task */
  async unassign(company: string, task: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/tasks/{task}/unassign", { "company": company, "task": task });
    return this._send<unknown>("POST", path, undefined, config);
  }
}
