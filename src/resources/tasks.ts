// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";
import type { PublicApiV1TasksAssignData, PublicApiV1TasksAssignResponses, PublicApiV1TasksAttachmentsCreateResponses, PublicApiV1TasksAttachmentsDeleteResponses, PublicApiV1TasksAttachmentsListResponses, PublicApiV1TasksAttachmentsShowResponses, PublicApiV1TasksBulkDeleteData, PublicApiV1TasksBulkDeleteResponses, PublicApiV1TasksBulkStatusData, PublicApiV1TasksBulkStatusResponses, PublicApiV1TasksBulkUpdateData, PublicApiV1TasksBulkUpdateResponses, PublicApiV1TasksCommentsCreateData, PublicApiV1TasksCommentsCreateResponses, PublicApiV1TasksCommentsDeleteResponses, PublicApiV1TasksCommentsUpdateData, PublicApiV1TasksCommentsUpdateResponses, PublicApiV1TasksCreateData, PublicApiV1TasksCreateResponses, PublicApiV1TasksCustomFieldsSetData, PublicApiV1TasksCustomFieldsSetResponses, PublicApiV1TasksDeleteResponses, PublicApiV1TasksDuplicateData, PublicApiV1TasksDuplicateResponses, PublicApiV1TasksEntityLinksCreateData, PublicApiV1TasksEntityLinksCreateResponses, PublicApiV1TasksEntityLinksDeleteResponses, PublicApiV1TasksEntityLinksListResponses, PublicApiV1TasksExternalLinksCreateData, PublicApiV1TasksExternalLinksCreateResponses, PublicApiV1TasksExternalLinksDeleteResponses, PublicApiV1TasksExternalLinksListResponses, PublicApiV1TasksFindByKeyData, PublicApiV1TasksFindByKeyResponses, PublicApiV1TasksLabelsAssignData, PublicApiV1TasksLabelsAssignResponses, PublicApiV1TasksLabelsUnassignResponses, PublicApiV1TasksMoveData, PublicApiV1TasksMoveResponses, PublicApiV1TasksRelationsCreateData, PublicApiV1TasksRelationsCreateResponses, PublicApiV1TasksRelationsDeleteResponses, PublicApiV1TasksRelationsListResponses, PublicApiV1TasksRepositionData, PublicApiV1TasksRepositionResponses, PublicApiV1TasksShowResponses, PublicApiV1TasksStatusData, PublicApiV1TasksStatusResponses, PublicApiV1TasksTimeEntriesCreateData, PublicApiV1TasksTimeEntriesCreateResponses, PublicApiV1TasksTimeEntriesDeleteResponses, PublicApiV1TasksTimeEntriesShowResponses, PublicApiV1TasksTimeEntriesUpdateData, PublicApiV1TasksTimeEntriesUpdateResponses, PublicApiV1TasksTimerStartResponses, PublicApiV1TasksUnassignResponses, PublicApiV1TasksUpdateData, PublicApiV1TasksUpdateResponses, PublicApiV1TasksUploadLinksCreateData, PublicApiV1TasksUploadLinksCreateResponses } from "../generated/types.gen.js";


export class TasksCommentsResource extends BaseResource {
  /** Create a task comment */
  async create(company: string, task: string, body?: PublicApiV1TasksCommentsCreateData["body"], config?: RequestConfig): Promise<PublicApiV1TasksCommentsCreateResponses[201]> {
    const path = this.buildPath("/companies/{company}/tasks/{task}/comments", { "company": company, "task": task });
    return this._send<PublicApiV1TasksCommentsCreateResponses[201]>("POST", path, body, config);
  }

  /** List task comments */
  async list(company: string, task: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/tasks/{task}/comments", { "company": company, "task": task });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Delete a task comment */
  async delete(company: string, task: string, comment: string, config?: RequestConfig): Promise<PublicApiV1TasksCommentsDeleteResponses[200]> {
    const path = this.buildPath("/companies/{company}/tasks/{task}/comments/{comment}", { "company": company, "task": task, "comment": comment });
    return this._send<PublicApiV1TasksCommentsDeleteResponses[200]>("DELETE", path, undefined, config, { idempotent: true });
  }

  /** Update a task comment */
  async update(company: string, task: string, comment: string, body?: PublicApiV1TasksCommentsUpdateData["body"], config?: RequestConfig): Promise<PublicApiV1TasksCommentsUpdateResponses[200]> {
    const path = this.buildPath("/companies/{company}/tasks/{task}/comments/{comment}", { "company": company, "task": task, "comment": comment });
    return this._send<PublicApiV1TasksCommentsUpdateResponses[200]>("PUT", path, body, config);
  }
}

export class TasksExternalLinksResource extends BaseResource {
  /** Create a task external link */
  async create(company: string, task: string, body?: PublicApiV1TasksExternalLinksCreateData["body"], config?: RequestConfig): Promise<PublicApiV1TasksExternalLinksCreateResponses[201]> {
    const path = this.buildPath("/companies/{company}/tasks/{task}/external-links", { "company": company, "task": task });
    return this._send<PublicApiV1TasksExternalLinksCreateResponses[201]>("POST", path, body, config);
  }

  /** List task external links */
  async list(company: string, task: string, config?: RequestConfig): Promise<PublicApiV1TasksExternalLinksListResponses[200]> {
    const path = this.buildPath("/companies/{company}/tasks/{task}/external-links", { "company": company, "task": task });
    return this._get<PublicApiV1TasksExternalLinksListResponses[200]>(path, undefined, config);
  }

  /** Delete a task external link */
  async delete(company: string, task: string, link: string, config?: RequestConfig): Promise<PublicApiV1TasksExternalLinksDeleteResponses[200]> {
    const path = this.buildPath("/companies/{company}/tasks/{task}/external-links/{link}", { "company": company, "task": task, "link": link });
    return this._send<PublicApiV1TasksExternalLinksDeleteResponses[200]>("DELETE", path, undefined, config);
  }
}

export class TasksLabelsResource extends BaseResource {
  /** Assign a label to a task */
  async assign(company: string, task: string, body?: PublicApiV1TasksLabelsAssignData["body"], config?: RequestConfig): Promise<PublicApiV1TasksLabelsAssignResponses[200]> {
    const path = this.buildPath("/companies/{company}/tasks/{task}/labels", { "company": company, "task": task });
    return this._send<PublicApiV1TasksLabelsAssignResponses[200]>("POST", path, body, config);
  }

  /** Remove a label from a task */
  async unassign(company: string, task: string, label: string, config?: RequestConfig): Promise<PublicApiV1TasksLabelsUnassignResponses[200]> {
    const path = this.buildPath("/companies/{company}/tasks/{task}/labels/{label}", { "company": company, "task": task, "label": label });
    return this._send<PublicApiV1TasksLabelsUnassignResponses[200]>("DELETE", path, undefined, config);
  }
}

export class TasksRelationsResource extends BaseResource {
  /** Create a task relation */
  async create(company: string, task: string, body?: PublicApiV1TasksRelationsCreateData["body"], config?: RequestConfig): Promise<PublicApiV1TasksRelationsCreateResponses[201]> {
    const path = this.buildPath("/companies/{company}/tasks/{task}/relations", { "company": company, "task": task });
    return this._send<PublicApiV1TasksRelationsCreateResponses[201]>("POST", path, body, config);
  }

  /** List task relations */
  async list(company: string, task: string, config?: RequestConfig): Promise<PublicApiV1TasksRelationsListResponses[200]> {
    const path = this.buildPath("/companies/{company}/tasks/{task}/relations", { "company": company, "task": task });
    return this._get<PublicApiV1TasksRelationsListResponses[200]>(path, undefined, config);
  }

  /** Delete a task relation */
  async delete(company: string, task: string, relation: string, config?: RequestConfig): Promise<PublicApiV1TasksRelationsDeleteResponses[200]> {
    const path = this.buildPath("/companies/{company}/tasks/{task}/relations/{relation}", { "company": company, "task": task, "relation": relation });
    return this._send<PublicApiV1TasksRelationsDeleteResponses[200]>("DELETE", path, undefined, config);
  }
}

export class TasksUploadLinksResource extends BaseResource {
  /** Create a task upload link */
  async create(company: string, task: string, body?: PublicApiV1TasksUploadLinksCreateData["body"], config?: RequestConfig): Promise<PublicApiV1TasksUploadLinksCreateResponses[201]> {
    const path = this.buildPath("/companies/{company}/tasks/{task}/upload-links", { "company": company, "task": task });
    return this._send<PublicApiV1TasksUploadLinksCreateResponses[201]>("POST", path, body, config);
  }
}

export class TasksAttachmentsResource extends BaseResource {
  /** Delete a task attachment */
  async delete(company: string, task: string, attachment: string, config?: RequestConfig): Promise<PublicApiV1TasksAttachmentsDeleteResponses[200]> {
    const path = this.buildPath("/companies/{company}/tasks/{task}/attachments/{attachment}", { "company": company, "task": task, "attachment": attachment });
    return this._send<PublicApiV1TasksAttachmentsDeleteResponses[200]>("DELETE", path, undefined, config, { idempotent: true });
  }

  /** Retrieve a task attachment */
  async show(company: string, task: string, attachment: string, config?: RequestConfig): Promise<PublicApiV1TasksAttachmentsShowResponses[200]> {
    const path = this.buildPath("/companies/{company}/tasks/{task}/attachments/{attachment}", { "company": company, "task": task, "attachment": attachment });
    return this._get<PublicApiV1TasksAttachmentsShowResponses[200]>(path, undefined, config);
  }

  /**
   * Download a task attachment
   * Answers with JSON metadata by default; send `config.headers: { Accept: "image/png" }` (or another image type) to get the stored bytes.
   */
  async download(company: string, task: string, attachment: string, config?: RequestConfig): Promise<BinaryResponse> {
    const path = this.buildPath("/companies/{company}/tasks/{task}/attachments/{attachment}/download", { "company": company, "task": task, "attachment": attachment });
    return this._binary(path, "GET", undefined, undefined, config);
  }

  /** List task attachments */
  async list(company: string, task: string, config?: RequestConfig): Promise<PublicApiV1TasksAttachmentsListResponses[200]> {
    const path = this.buildPath("/companies/{company}/tasks/{task}/attachments", { "company": company, "task": task });
    return this._get<PublicApiV1TasksAttachmentsListResponses[200]>(path, undefined, config);
  }

  /** Upload a task attachment */
  async create(company: string, task: string, formData: FormData, config?: RequestConfig): Promise<PublicApiV1TasksAttachmentsCreateResponses[201]> {
    const path = this.buildPath("/companies/{company}/tasks/{task}/attachments", { "company": company, "task": task });
    return this._sendForm<PublicApiV1TasksAttachmentsCreateResponses[201]>(path, formData, config);
  }
}

export class TasksTimeEntriesResource extends BaseResource {
  /** Delete a task time entry */
  async delete(company: string, task: string, timeEntry: string, config?: RequestConfig): Promise<PublicApiV1TasksTimeEntriesDeleteResponses[200]> {
    const path = this.buildPath("/companies/{company}/tasks/{task}/time-entries/{time_entry}", { "company": company, "task": task, "time_entry": timeEntry });
    return this._send<PublicApiV1TasksTimeEntriesDeleteResponses[200]>("DELETE", path, undefined, config, { idempotent: true });
  }

  /** Retrieve a task time entry */
  async show(company: string, task: string, timeEntry: string, config?: RequestConfig): Promise<PublicApiV1TasksTimeEntriesShowResponses[200]> {
    const path = this.buildPath("/companies/{company}/tasks/{task}/time-entries/{time_entry}", { "company": company, "task": task, "time_entry": timeEntry });
    return this._get<PublicApiV1TasksTimeEntriesShowResponses[200]>(path, undefined, config);
  }

  /** Update a task time entry */
  async update(company: string, task: string, timeEntry: string, body?: PublicApiV1TasksTimeEntriesUpdateData["body"], config?: RequestConfig): Promise<PublicApiV1TasksTimeEntriesUpdateResponses[200]> {
    const path = this.buildPath("/companies/{company}/tasks/{task}/time-entries/{time_entry}", { "company": company, "task": task, "time_entry": timeEntry });
    return this._send<PublicApiV1TasksTimeEntriesUpdateResponses[200]>("PATCH", path, body, config);
  }

  /** List task time entries */
  async list(company: string, task: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/tasks/{task}/time-entries", { "company": company, "task": task });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Create a task time entry */
  async create(company: string, task: string, body?: PublicApiV1TasksTimeEntriesCreateData["body"], config?: RequestConfig): Promise<PublicApiV1TasksTimeEntriesCreateResponses[201]> {
    const path = this.buildPath("/companies/{company}/tasks/{task}/time-entries", { "company": company, "task": task });
    return this._send<PublicApiV1TasksTimeEntriesCreateResponses[201]>("POST", path, body, config);
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
  async create(company: string, task: string, body?: PublicApiV1TasksEntityLinksCreateData["body"], config?: RequestConfig): Promise<PublicApiV1TasksEntityLinksCreateResponses[201]> {
    const path = this.buildPath("/companies/{company}/tasks/{task}/entity-links", { "company": company, "task": task });
    return this._send<PublicApiV1TasksEntityLinksCreateResponses[201]>("POST", path, body, config);
  }

  /** List task entity links */
  async list(company: string, task: string, config?: RequestConfig): Promise<PublicApiV1TasksEntityLinksListResponses[200]> {
    const path = this.buildPath("/companies/{company}/tasks/{task}/entity-links", { "company": company, "task": task });
    return this._get<PublicApiV1TasksEntityLinksListResponses[200]>(path, undefined, config);
  }

  /** Unlink a task from an entity */
  async delete(company: string, task: string, link: string, config?: RequestConfig): Promise<PublicApiV1TasksEntityLinksDeleteResponses[200]> {
    const path = this.buildPath("/companies/{company}/tasks/{task}/entity-links/{link}", { "company": company, "task": task, "link": link });
    return this._send<PublicApiV1TasksEntityLinksDeleteResponses[200]>("DELETE", path, undefined, config);
  }
}

export class TasksCustomFieldsResource extends BaseResource {
  /** Set a task custom field value */
  async set(company: string, task: string, field: string, body?: PublicApiV1TasksCustomFieldsSetData["body"], config?: RequestConfig): Promise<PublicApiV1TasksCustomFieldsSetResponses[200]> {
    const path = this.buildPath("/companies/{company}/tasks/{task}/custom-fields/{field}", { "company": company, "task": task, "field": field });
    return this._send<PublicApiV1TasksCustomFieldsSetResponses[200]>("PUT", path, body, config);
  }
}

export class TasksTimerResource extends BaseResource {
  /** Start a task timer */
  async start(company: string, task: string, config?: RequestConfig): Promise<PublicApiV1TasksTimerStartResponses[201]> {
    const path = this.buildPath("/companies/{company}/tasks/{task}/timer/start", { "company": company, "task": task });
    return this._send<PublicApiV1TasksTimerStartResponses[201]>("POST", path, undefined, config);
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
  async assign(company: string, task: string, body?: PublicApiV1TasksAssignData["body"], config?: RequestConfig): Promise<PublicApiV1TasksAssignResponses[200]> {
    const path = this.buildPath("/companies/{company}/tasks/{task}/assign", { "company": company, "task": task });
    return this._send<PublicApiV1TasksAssignResponses[200]>("POST", path, body, config);
  }

  /** Bulk change task status */
  async bulkStatus(company: string, body?: PublicApiV1TasksBulkStatusData["body"], config?: RequestConfig): Promise<PublicApiV1TasksBulkStatusResponses[200]> {
    const path = this.buildPath("/companies/{company}/tasks/bulk-status", { "company": company });
    return this._send<PublicApiV1TasksBulkStatusResponses[200]>("POST", path, body, config);
  }

  /** Bulk delete tasks */
  async bulkDelete(company: string, body?: PublicApiV1TasksBulkDeleteData["body"], config?: RequestConfig): Promise<PublicApiV1TasksBulkDeleteResponses[200]> {
    const path = this.buildPath("/companies/{company}/tasks/bulk-delete", { "company": company });
    return this._send<PublicApiV1TasksBulkDeleteResponses[200]>("POST", path, body, config);
  }

  /** Bulk update tasks */
  async bulkUpdate(company: string, body?: PublicApiV1TasksBulkUpdateData["body"], config?: RequestConfig): Promise<PublicApiV1TasksBulkUpdateResponses[200]> {
    const path = this.buildPath("/companies/{company}/tasks/bulk-update", { "company": company });
    return this._send<PublicApiV1TasksBulkUpdateResponses[200]>("POST", path, body, config);
  }

  /** Change task status */
  async status(company: string, task: string, body?: PublicApiV1TasksStatusData["body"], config?: RequestConfig): Promise<PublicApiV1TasksStatusResponses[200]> {
    const path = this.buildPath("/companies/{company}/tasks/{task}/status", { "company": company, "task": task });
    return this._send<PublicApiV1TasksStatusResponses[200]>("POST", path, body, config);
  }

  /** Create a task */
  async create(company: string, body?: PublicApiV1TasksCreateData["body"], config?: RequestConfig): Promise<PublicApiV1TasksCreateResponses[201]> {
    const path = this.buildPath("/companies/{company}/tasks", { "company": company });
    return this._send<PublicApiV1TasksCreateResponses[201]>("POST", path, body, config);
  }

  /** Search tasks */
  async search(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/tasks", { "company": company });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Delete a task */
  async delete(company: string, task: string, config?: RequestConfig): Promise<PublicApiV1TasksDeleteResponses[200]> {
    const path = this.buildPath("/companies/{company}/tasks/{task}", { "company": company, "task": task });
    return this._send<PublicApiV1TasksDeleteResponses[200]>("DELETE", path, undefined, config, { idempotent: true });
  }

  /** Retrieve a task */
  async show(company: string, task: string, config?: RequestConfig): Promise<PublicApiV1TasksShowResponses[200]> {
    const path = this.buildPath("/companies/{company}/tasks/{task}", { "company": company, "task": task });
    return this._get<PublicApiV1TasksShowResponses[200]>(path, undefined, config);
  }

  /** Update a task */
  async update(company: string, task: string, body?: PublicApiV1TasksUpdateData["body"], config?: RequestConfig): Promise<PublicApiV1TasksUpdateResponses[200]> {
    const path = this.buildPath("/companies/{company}/tasks/{task}", { "company": company, "task": task });
    return this._send<PublicApiV1TasksUpdateResponses[200]>("PATCH", path, body, config);
  }

  /** Duplicate a task */
  async duplicate(company: string, task: string, body?: PublicApiV1TasksDuplicateData["body"], config?: RequestConfig): Promise<PublicApiV1TasksDuplicateResponses[201]> {
    const path = this.buildPath("/companies/{company}/tasks/{task}/duplicate", { "company": company, "task": task });
    return this._send<PublicApiV1TasksDuplicateResponses[201]>("POST", path, body, config);
  }

  /** Find a task by key */
  async findByKey(company: string, body?: PublicApiV1TasksFindByKeyData["body"], config?: RequestConfig): Promise<PublicApiV1TasksFindByKeyResponses[200]> {
    const path = this.buildPath("/companies/{company}/tasks/find-by-key", { "company": company });
    return this._send<PublicApiV1TasksFindByKeyResponses[200]>("POST", path, body, config);
  }

  /** List tasks linked to an entity */
  async linked(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/tasks/linked", { "company": company });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Reposition a task */
  async reposition(company: string, task: string, body?: PublicApiV1TasksRepositionData["body"], config?: RequestConfig): Promise<PublicApiV1TasksRepositionResponses[200]> {
    const path = this.buildPath("/companies/{company}/tasks/{task}/reposition", { "company": company, "task": task });
    return this._send<PublicApiV1TasksRepositionResponses[200]>("POST", path, body, config);
  }

  /** Move a task to another project */
  async move(company: string, task: string, body?: PublicApiV1TasksMoveData["body"], config?: RequestConfig): Promise<PublicApiV1TasksMoveResponses[200]> {
    const path = this.buildPath("/companies/{company}/tasks/{task}/move", { "company": company, "task": task });
    return this._send<PublicApiV1TasksMoveResponses[200]>("POST", path, body, config);
  }

  /** Unassign a task */
  async unassign(company: string, task: string, config?: RequestConfig): Promise<PublicApiV1TasksUnassignResponses[200]> {
    const path = this.buildPath("/companies/{company}/tasks/{task}/unassign", { "company": company, "task": task });
    return this._send<PublicApiV1TasksUnassignResponses[200]>("POST", path, undefined, config);
  }
}
