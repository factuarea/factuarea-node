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
  async create(task: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/tasks/{task}/comments", { "task": task });
    return this._send<unknown>("POST", path, body, config);
  }

  /** List task comments */
  async list(task: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/tasks/{task}/comments", { "task": task });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Delete a task comment */
  async delete(task: string, comment: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/tasks/{task}/comments/{comment}", { "task": task, "comment": comment });
    return this._send<unknown>("DELETE", path, undefined, config, { idempotent: true });
  }

  /** Update a task comment */
  async update(task: string, comment: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/tasks/{task}/comments/{comment}", { "task": task, "comment": comment });
    return this._send<unknown>("PUT", path, body, config);
  }
}

export class TasksExternalLinksResource extends BaseResource {
  /** Create a task external link */
  async create(task: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/tasks/{task}/external-links", { "task": task });
    return this._send<unknown>("POST", path, body, config);
  }

  /** List task external links */
  async list(task: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/tasks/{task}/external-links", { "task": task });
    return this._get<unknown>(path, undefined, config);
  }

  /** Delete a task external link */
  async delete(task: string, link: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/tasks/{task}/external-links/{link}", { "task": task, "link": link });
    return this._send<unknown>("DELETE", path, undefined, config);
  }
}

export class TasksLabelsResource extends BaseResource {
  /** Assign a label to a task */
  async assign(task: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/tasks/{task}/labels", { "task": task });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Remove a label from a task */
  async unassign(task: string, label: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/tasks/{task}/labels/{label}", { "task": task, "label": label });
    return this._send<unknown>("DELETE", path, undefined, config);
  }
}

export class TasksRelationsResource extends BaseResource {
  /** Create a task relation */
  async create(task: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/tasks/{task}/relations", { "task": task });
    return this._send<unknown>("POST", path, body, config);
  }

  /** List task relations */
  async list(task: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/tasks/{task}/relations", { "task": task });
    return this._get<unknown>(path, undefined, config);
  }

  /** Delete a task relation */
  async delete(task: string, relation: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/tasks/{task}/relations/{relation}", { "task": task, "relation": relation });
    return this._send<unknown>("DELETE", path, undefined, config);
  }
}

export class TasksUploadLinksResource extends BaseResource {
  /** Create a task upload link */
  async create(task: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/tasks/{task}/upload-links", { "task": task });
    return this._send<unknown>("POST", path, body, config);
  }
}

export class TasksAttachmentsResource extends BaseResource {
  /** Delete a task attachment */
  async delete(task: string, attachment: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/tasks/{task}/attachments/{attachment}", { "task": task, "attachment": attachment });
    return this._send<unknown>("DELETE", path, undefined, config, { idempotent: true });
  }

  /** Retrieve a task attachment */
  async show(task: string, attachment: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/tasks/{task}/attachments/{attachment}", { "task": task, "attachment": attachment });
    return this._get<unknown>(path, undefined, config);
  }

  /** Download a task attachment */
  async download(task: string, attachment: string, config?: RequestConfig): Promise<BinaryResponse> {
    const path = this.buildPath("/tasks/{task}/attachments/{attachment}/download", { "task": task, "attachment": attachment });
    return this._binary(path, "GET", undefined, undefined, config);
  }

  /** List task attachments */
  async list(task: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/tasks/{task}/attachments", { "task": task });
    return this._get<unknown>(path, undefined, config);
  }

  /** Upload a task attachment */
  async create(task: string, formData: FormData, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/tasks/{task}/attachments", { "task": task });
    return this._sendForm<unknown>(path, formData, config);
  }
}

export class TasksTimeEntriesResource extends BaseResource {
  /** Delete a task time entry */
  async delete(task: string, timeEntry: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/tasks/{task}/time-entries/{time_entry}", { "task": task, "time_entry": timeEntry });
    return this._send<unknown>("DELETE", path, undefined, config, { idempotent: true });
  }

  /** Retrieve a task time entry */
  async show(task: string, timeEntry: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/tasks/{task}/time-entries/{time_entry}", { "task": task, "time_entry": timeEntry });
    return this._get<unknown>(path, undefined, config);
  }

  /** Update a task time entry */
  async update(task: string, timeEntry: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/tasks/{task}/time-entries/{time_entry}", { "task": task, "time_entry": timeEntry });
    return this._send<unknown>("PUT", path, body, config);
  }

  /** List task time entries */
  async list(task: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/tasks/{task}/time-entries", { "task": task });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Create a task time entry */
  async create(task: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/tasks/{task}/time-entries", { "task": task });
    return this._send<unknown>("POST", path, body, config);
  }
}

export class TasksActivitiesResource extends BaseResource {
  /** List task activity */
  async list(task: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/tasks/{task}/activities", { "task": task });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }
}

export class TasksEntityLinksResource extends BaseResource {
  /** Link a task to an entity */
  async create(task: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/tasks/{task}/entity-links", { "task": task });
    return this._send<unknown>("POST", path, body, config);
  }

  /** List task entity links */
  async list(task: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/tasks/{task}/entity-links", { "task": task });
    return this._get<unknown>(path, undefined, config);
  }

  /** Unlink a task from an entity */
  async delete(task: string, link: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/tasks/{task}/entity-links/{link}", { "task": task, "link": link });
    return this._send<unknown>("DELETE", path, undefined, config);
  }
}

export class TasksCustomFieldsResource extends BaseResource {
  /** Set a task custom field value */
  async set(task: string, field: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/tasks/{task}/custom-fields/{field}", { "task": task, "field": field });
    return this._send<unknown>("PUT", path, body, config);
  }
}

export class TasksTimerResource extends BaseResource {
  /** Start a task timer */
  async start(task: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/tasks/{task}/timer/start", { "task": task });
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
  async assign(task: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/tasks/{task}/assign", { "task": task });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Bulk change task status */
  async bulkStatus(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/tasks/bulk-status";
    return this._send<unknown>("POST", path, body, config);
  }

  /** Bulk delete tasks */
  async bulkDelete(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/tasks/bulk-delete";
    return this._send<unknown>("POST", path, body, config);
  }

  /** Bulk update tasks */
  async bulkUpdate(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/tasks/bulk-update";
    return this._send<unknown>("POST", path, body, config);
  }

  /** Change task status */
  async status(task: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/tasks/{task}/status", { "task": task });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Create a task */
  async create(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/tasks";
    return this._send<unknown>("POST", path, body, config);
  }

  /** Search tasks */
  async search(params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    return this._paginate<unknown>("/tasks", params, "starting_after", config);
  }

  /** Delete a task */
  async delete(task: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/tasks/{task}", { "task": task });
    return this._send<unknown>("DELETE", path, undefined, config, { idempotent: true });
  }

  /** Retrieve a task */
  async show(task: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/tasks/{task}", { "task": task });
    return this._get<unknown>(path, undefined, config);
  }

  /** Update a task */
  async update(task: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/tasks/{task}", { "task": task });
    return this._send<unknown>("PUT", path, body, config);
  }

  /** Duplicate a task */
  async duplicate(task: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/tasks/{task}/duplicate", { "task": task });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Find a task by key */
  async findByKey(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/tasks/find-by-key";
    return this._send<unknown>("POST", path, body, config);
  }

  /** List tasks linked to an entity */
  async linked(params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    return this._paginate<unknown>("/tasks/linked", params, "starting_after", config);
  }

  /** Reposition a task */
  async reposition(task: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/tasks/{task}/reposition", { "task": task });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Move a task to another project */
  async move(task: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/tasks/{task}/move", { "task": task });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Unassign a task */
  async unassign(task: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/tasks/{task}/unassign", { "task": task });
    return this._send<unknown>("POST", path, undefined, config);
  }
}
