import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { ConflictError, NotFoundError } from "../src/index.js";
import type { CreateTaskV1Request, LogTaskTimeV1Request, TaskTimeEntry } from "../src/index.js";
import { BASE_URL, server, testClient, useMockServer } from "./helpers.js";

useMockServer();
const projectId = "0193a4f2-7c20-7a11-8b52-4d6e8f0a2c01";
const columnId = "0193a4f2-7d31-7b22-8c63-5e7f9a1b3d03";
const targetColumnId = "0193a4f2-7d31-7b22-8c63-5e7f9a1b3d04";
const taskId = "0193a4f2-8f53-7d44-8e85-7a9b1c3d5f12";
const secondTaskId = "0193a4f2-8f53-7d44-8e85-7a9b1c3d5f13";
const invoiceId = "0193a4f2-d40e-7cff-8d90-8f0a2b4c6e10";

describe("tasks", () => {
  it("follows next_cursor as starting_after and keeps the filters on every page", async () => {
    const urls: URL[] = [];
    server.use(http.get(`${BASE_URL}/tasks`, ({ request }) => {
      const url = new URL(request.url);
      urls.push(url);
      const second = url.searchParams.has("starting_after");
      return HttpResponse.json({
        data: [{ id: second ? secondTaskId : taskId, object: "task" }],
        has_more: !second,
        next_cursor: second ? null : taskId,
      });
    }));
    const page = await testClient().tasks.search({
      project_id: projectId,
      assignee_id: "me",
      status: "active",
      completed: false,
      sort: "-due_on",
      limit: 1,
    });
    expect(page.hasMore).toBe(true);
    expect(page.nextCursor).toBe(taskId);
    expect((await page.toArray()).map((task) => (task as { id: string }).id)).toEqual([taskId, secondTaskId]);
    expect(urls).toHaveLength(2);
    for (const url of urls) {
      expect(url.searchParams.get("project_id")).toBe(projectId);
      expect(url.searchParams.get("assignee_id")).toBe("me");
      expect(url.searchParams.get("status")).toBe("active");
      expect(url.searchParams.get("completed")).toBe("0");
      expect(url.searchParams.get("sort")).toBe("-due_on");
    }
    expect(urls[0]?.searchParams.has("starting_after")).toBe(false);
    expect(urls[1]?.searchParams.get("starting_after")).toBe(taskId);
  });

  it("sends an Idempotency-Key on tasks.delete and lets the caller pin it", async () => {
    const keys: Array<string | null> = [];
    server.use(http.delete(`${BASE_URL}/tasks/${taskId}`, ({ request }) => {
      keys.push(request.headers.get("Idempotency-Key"));
      return HttpResponse.json({ data: { id: taskId, object: "task", deleted: true } });
    }));
    const client = testClient();
    expect(await client.tasks.delete(taskId)).toEqual({ data: { id: taskId, object: "task", deleted: true } });
    await client.tasks.delete(taskId, { idempotencyKey: "task-delete-key-001" });
    expect(keys[0]).toBeTruthy();
    expect(keys[1]).toBe("task-delete-key-001");
  });

  it("sends task_ids and a stable Idempotency-Key on tasks.bulkDelete, even across a retry", async () => {
    const keys: Array<string | null> = [];
    const bodies: unknown[] = [];
    server.use(http.post(`${BASE_URL}/tasks/bulk-delete`, async ({ request }) => {
      keys.push(request.headers.get("Idempotency-Key"));
      bodies.push(await request.json());
      if (keys.length === 1) {
        return HttpResponse.json({ error: { type: "rate_limit_error", code: "rate_limit_exceeded", message: "slow down" } }, { status: 429, headers: { "Retry-After": "0" } });
      }
      return HttpResponse.json({ data: { object: "task_bulk_result", operation: "delete", changed: 2 } });
    }));
    const result = await testClient({ maxRetries: 1 }).tasks.bulkDelete({ task_ids: [taskId, secondTaskId] });
    expect(result).toEqual({ data: { object: "task_bulk_result", operation: "delete", changed: 2 } });
    expect(bodies).toEqual([{ task_ids: [taskId, secondTaskId] }, { task_ids: [taskId, secondTaskId] }]);
    expect(keys[0]).toBeTruthy();
    expect(keys[1]).toBe(keys[0]);
  });

  it("carries array values in the query and in the body", async () => {
    let query: URL | undefined;
    let body: unknown;
    server.use(
      // `sources` is a comma-separated list of agenda layers, not a repeated parameter.
      http.get(`${BASE_URL}/agenda`, ({ request }) => {
        query = new URL(request.url);
        return HttpResponse.json({ data: [], has_more: false, next_cursor: null, sources: ["tasks", "invoice_due"] });
      }),
      http.post(`${BASE_URL}/tasks`, async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ data: { id: taskId, object: "task" } }, { status: 201 });
      }),
    );
    const client = testClient();
    await client.agenda.list({ from: "2026-10-01", to: "2026-10-31", sources: ["tasks", "invoice_due"].join(","), assignee_id: "me" });
    expect(query?.searchParams.get("from")).toBe("2026-10-01");
    expect(query?.searchParams.get("to")).toBe("2026-10-31");
    expect(query?.searchParams.get("sources")).toBe("tasks,invoice_due");
    expect(query?.searchParams.get("assignee_id")).toBe("me");

    // Array-valued custom fields (multiselect) and label_ids travel as JSON arrays; the map is keyed by field id.
    const request: CreateTaskV1Request = {
      project_id: projectId,
      title: "Review the Q3 VAT return",
      label_ids: ["0193a4f2-a1db-7fcc-8a6d-5c7d9e1f3b10", "0193a4f2-a1db-7fcc-8a6d-5c7d9e1f3b11"],
      custom_fields: {
        "0193a4f2-b100-7000-8000-000000000001": ["north", "south"],
        "0193a4f2-b100-7000-8000-000000000002": 12.5,
        "0193a4f2-b100-7000-8000-000000000003": true,
        "0193a4f2-b100-7000-8000-000000000004": "Ready",
        "0193a4f2-b100-7000-8000-000000000005": null,
      },
    };
    await client.tasks.create(request);
    expect(body).toEqual(request);
  });

  it("links the task to an entity in the same creation call and surfaces a missing entity", async () => {
    const bodies: unknown[] = [];
    server.use(http.post(`${BASE_URL}/tasks`, async ({ request }) => {
      const body = (await request.json()) as CreateTaskV1Request;
      bodies.push(body);
      expect(request.headers.get("Idempotency-Key")).toBeTruthy();
      if (body.entity_link?.id === "0193a4f2-0000-7000-8000-000000000404") {
        return HttpResponse.json({ error: { type: "not_found_error", code: "linked_entity_not_found", message: "La entidad vinculada no existe o no está disponible.", param: "entity_id" } }, { status: 404 });
      }
      return HttpResponse.json({ data: { id: taskId, object: "task", title: body.title } }, { status: 201 });
    }));
    const client = testClient();
    const linked: CreateTaskV1Request = { project_id: projectId, title: "Chase the payment", entity_link: { type: "invoice", id: invoiceId } };
    expect(await client.tasks.create(linked)).toEqual({ data: { id: taskId, object: "task", title: "Chase the payment" } });
    expect(bodies[0]).toEqual({ project_id: projectId, title: "Chase the payment", entity_link: { type: "invoice", id: invoiceId } });

    const missing = await client.tasks
      .create({ project_id: projectId, title: "Orphan", entity_link: { type: "invoice", id: "0193a4f2-0000-7000-8000-000000000404" } })
      .catch((error: unknown) => error);
    expect(missing).toBeInstanceOf(NotFoundError);
    expect(missing).toMatchObject({ status: 404, code: "linked_entity_not_found", param: "entity_id" });
  });

  it("lists the tasks linked to an entity across cursor pages", async () => {
    const urls: URL[] = [];
    server.use(http.get(`${BASE_URL}/tasks/linked`, ({ request }) => {
      const url = new URL(request.url);
      urls.push(url);
      const second = url.searchParams.has("starting_after");
      return HttpResponse.json({ data: [{ id: second ? secondTaskId : taskId }], has_more: !second, next_cursor: second ? null : taskId });
    }));
    const page = await testClient().tasks.linked({ entity_type: "invoice", entity_id: invoiceId });
    expect(await page.toArray()).toHaveLength(2);
    expect(urls[1]?.searchParams.get("entity_type")).toBe("invoice");
    expect(urls[1]?.searchParams.get("entity_id")).toBe(invoiceId);
    expect(urls[1]?.searchParams.get("starting_after")).toBe(taskId);
  });

  it("paginates a nested sub-resource with the task in the path and logs time on it", async () => {
    const urls: URL[] = [];
    let created: unknown;
    server.use(
      http.get(`${BASE_URL}/tasks/${taskId}/time-entries`, ({ request }) => {
        const url = new URL(request.url);
        urls.push(url);
        const second = url.searchParams.has("starting_after");
        return HttpResponse.json({
          data: [{ id: second ? "entry-2" : "entry-1", object: "task_time_entry", task_id: taskId }],
          has_more: !second,
          next_cursor: second ? null : "entry-1",
        });
      }),
      http.post(`${BASE_URL}/tasks/${taskId}/time-entries`, async ({ request }) => {
        created = await request.json();
        expect(request.headers.get("Idempotency-Key")).toBeTruthy();
        return HttpResponse.json({ data: { id: "entry-3", object: "task_time_entry", task_id: taskId } }, { status: 201 });
      }),
    );
    const client = testClient();
    const page = await client.tasks.timeEntries.list(taskId, { limit: 1 });
    expect((await page.toArray()).map((entry) => (entry as TaskTimeEntry).id)).toEqual(["entry-1", "entry-2"]);
    expect(urls[0]?.searchParams.get("limit")).toBe("1");
    expect(urls[1]?.searchParams.get("starting_after")).toBe("entry-1");

    const log: LogTaskTimeV1Request = { started_at: "2026-09-24T09:00:00+02:00", ended_at: "2026-09-24T12:30:00+02:00", description: "Payment widget", billable: true };
    await client.tasks.timeEntries.create(taskId, log);
    expect(created).toEqual(log);
  });

  it("encodes the identifiers of nested sub-resources in the path", async () => {
    let path = "";
    server.use(http.delete(`${BASE_URL}/tasks/${taskId}/labels/:label`, ({ request }) => {
      path = new URL(request.url).pathname;
      return HttpResponse.json({ data: { id: "0193a4f2-9a64-7e55-8f96-8b0c2d4e6a01", object: "task_label_assignment", task_id: taskId, deleted: true } });
    }));
    await testClient().tasks.labels.unassign(taskId, "a b/c");
    expect(path).toBe(`/v1/tasks/${taskId}/labels/a%20b%2Fc`);
  });

  it("uploads an attachment as multipart and downloads it as binary", async () => {
    const attachmentId = "0193a4f2-efb9-7daa-8e4b-3a5b7c9d1f02";
    server.use(
      http.post(`${BASE_URL}/tasks/${taskId}/attachments`, async ({ request }) => {
        const form = await request.formData();
        expect(form.get("target")).toBe("comment");
        expect(await (form.get("file") as File).text()).toBe("%PDF-fixture");
        return HttpResponse.json({ data: { id: attachmentId, object: "task_attachment", task_id: taskId } }, { status: 201 });
      }),
      http.get(`${BASE_URL}/tasks/${taskId}/attachments/${attachmentId}/download`, () => new HttpResponse("%PDF-fixture", { headers: { "Content-Type": "application/pdf" } })),
    );
    const client = testClient();
    const form = new FormData();
    form.append("file", new Blob(["%PDF-fixture"], { type: "application/pdf" }), "spec.pdf");
    form.append("target", "comment");
    expect(await client.tasks.attachments.create(taskId, form)).toEqual({ data: { id: attachmentId, object: "task_attachment", task_id: taskId } });
    const file = await client.tasks.attachments.download(taskId, attachmentId);
    expect(file.contentType).toBe("application/pdf");
    expect(file.toBuffer().toString()).toBe("%PDF-fixture");
  });
});

describe("task timers", () => {
  it("returns a null data envelope when no timer is running", async () => {
    server.use(http.get(`${BASE_URL}/task-timers/current`, () => HttpResponse.json({ data: null })));
    const current = (await testClient().taskTimers.current()) as { data: TaskTimeEntry | null };
    expect(current).toEqual({ data: null });
    expect(current.data).toBeNull();
  });

  it("returns the running entry, then stops it", async () => {
    const running = { id: "entry-9", object: "task_time_entry", task_id: taskId, is_running: true, ended_at: null };
    server.use(
      http.get(`${BASE_URL}/task-timers/current`, () => HttpResponse.json({ data: running })),
      http.post(`${BASE_URL}/tasks/${taskId}/timer/start`, ({ request }) => {
        expect(request.headers.get("Idempotency-Key")).toBeTruthy();
        return HttpResponse.json({ data: running }, { status: 201 });
      }),
      http.post(`${BASE_URL}/task-timers/stop`, () => HttpResponse.json({ data: { ...running, is_running: false, ended_at: "2026-09-28T10:47:30+02:00", duration_seconds: 6150 } })),
    );
    const client = testClient();
    expect(await client.tasks.timer.start(taskId)).toEqual({ data: running });
    expect(await client.taskTimers.current()).toEqual({ data: running });
    expect(await client.taskTimers.stop()).toMatchObject({ data: { is_running: false, duration_seconds: 6150 } });
  });
});

describe("projects", () => {
  it("sends move_to_column_id in the query when deleting a column with tasks", async () => {
    let url: URL | undefined;
    let key: string | null = null;
    server.use(http.delete(`${BASE_URL}/projects/${projectId}/columns/${columnId}`, ({ request }) => {
      url = new URL(request.url);
      key = request.headers.get("Idempotency-Key");
      return HttpResponse.json({ data: { id: columnId, object: "project_column", deleted: true } });
    }));
    const result = await testClient().projects.columns.delete(projectId, columnId, { move_to_column_id: targetColumnId });
    expect(result).toEqual({ data: { id: columnId, object: "project_column", deleted: true } });
    expect(url?.searchParams.get("move_to_column_id")).toBe(targetColumnId);
    expect(key).toBeTruthy();
  });

  it("surfaces column_has_tasks as a conflict when no destination is sent", async () => {
    let url: URL | undefined;
    server.use(http.delete(`${BASE_URL}/projects/${projectId}/columns/${columnId}`, ({ request }) => {
      url = new URL(request.url);
      return HttpResponse.json({ error: { type: "conflict_error", code: "column_has_tasks", message: "La columna tiene 5 tareas." } }, { status: 409 });
    }));
    const error = await testClient().projects.columns.delete(projectId, columnId).catch((error: unknown) => error);
    expect(error).toBeInstanceOf(ConflictError);
    expect(error).toMatchObject({ status: 409, code: "column_has_tasks" });
    expect(url?.searchParams.has("move_to_column_id")).toBe(false);
  });

  it("creates a project, looks it up by key and lists archived ones on request", async () => {
    let created: unknown;
    let found: unknown;
    let listUrl: URL | undefined;
    server.use(
      http.post(`${BASE_URL}/projects`, async ({ request }) => {
        created = await request.json();
        expect(request.headers.get("Idempotency-Key")).toBeTruthy();
        return HttpResponse.json({ data: { id: projectId, object: "project", key: "WEB" } }, { status: 201 });
      }),
      http.post(`${BASE_URL}/projects/find-by-key`, async ({ request }) => {
        found = await request.json();
        return HttpResponse.json({ data: { id: projectId, object: "project", key: "WEB" } });
      }),
      http.get(`${BASE_URL}/projects`, ({ request }) => {
        listUrl = new URL(request.url);
        return HttpResponse.json({ data: [{ id: projectId }], has_more: false, next_cursor: null });
      }),
    );
    const client = testClient();
    await client.projects.create({ name: "Website", key: "WEB", icon: "rocket" });
    await client.projects.findByKey({ key: "web" });
    const page = await client.projects.list({ include_archived: true });
    expect(created).toEqual({ name: "Website", key: "WEB", icon: "rocket" });
    expect(found).toEqual({ key: "web" });
    expect(listUrl?.searchParams.get("include_archived")).toBe("1");
    expect(await page.toArray()).toEqual([{ id: projectId }]);
  });
});

describe("supporting resources", () => {
  it("paginates users, notifications and task labels with the shared cursor contract", async () => {
    const urls: Record<string, URL[]> = { users: [], notifications: [], labels: [] };
    const route = (path: string, bucket: string) =>
      http.get(`${BASE_URL}${path}`, ({ request }) => {
        const url = new URL(request.url);
        urls[bucket]?.push(url);
        const second = url.searchParams.has("starting_after");
        return HttpResponse.json({ data: [{ id: second ? "second" : "first" }], has_more: !second, next_cursor: second ? null : "first" });
      });
    server.use(route("/users", "users"), route("/notifications", "notifications"), route("/task-labels", "labels"));
    const client = testClient();
    expect(await (await client.users.list({ q: "ana" })).toArray()).toHaveLength(2);
    expect(await (await client.notifications.list({ status: "unread" })).toArray()).toHaveLength(2);
    expect(await (await client.taskLabels.list()).toArray()).toHaveLength(2);
    expect(urls.users?.[1]?.searchParams.get("q")).toBe("ana");
    expect(urls.notifications?.[1]?.searchParams.get("status")).toBe("unread");
    for (const bucket of Object.values(urls)) expect(bucket[1]?.searchParams.get("starting_after")).toBe("first");
  });

  it("reads the current user and marks every notification as read", async () => {
    server.use(
      http.get(`${BASE_URL}/users/me`, () => HttpResponse.json({ data: { id: "user-1", object: "user" } })),
      http.post(`${BASE_URL}/notifications/mark-all-read`, ({ request }) => {
        expect(request.headers.get("Idempotency-Key")).toBeTruthy();
        return HttpResponse.json({ data: { object: "notification_counts", total: 38, unread: 0 } });
      }),
    );
    const client = testClient();
    expect(await client.users.me()).toEqual({ data: { id: "user-1", object: "user" } });
    expect(await client.notifications.markAllRead()).toEqual({ data: { object: "notification_counts", total: 38, unread: 0 } });
  });
});
