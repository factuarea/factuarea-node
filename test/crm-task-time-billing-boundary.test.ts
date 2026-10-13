import { describe, expect, it } from "vitest";
import { AuthenticationError, ConnectionError, ConflictError, CrmTaskTimeBillingResource, CrmTaskTimeUnconfirmedWriteError, Factuarea, NotFoundError, ServerError, ValidationError,
  createCrmTaskTimeBillingResource, decodeCrmTaskTimeIntent, decodeCrmTaskTimePage, decodeCrmTaskTimePreview, decodeCrmTaskTimeReceipt, decodeCrmTaskTimeTasks } from "../src/index.js";
import type { CrmTaskTimeBillingV1Paths, CrmTaskTimePreviewBody } from "../src/index.js";

const ticketId = "018f1111-2222-7333-8444-555555555555";
const taskId = "018f1111-2222-7333-8444-666666666666";
const bindingId = "018f1111-2222-7333-8444-777777777777";
const effectId = "018f1111-2222-7333-8444-888888888888";
const entryId = "018f1111-2222-7333-8444-999999999999";
const historicalId = "550e8400-e29b-41d4-a716-446655440000";
const key = "opaque original task time key";
const revision = "a".repeat(64);
const base = { ticket_id: ticketId, ticket_version: 4, authorization_version: "current-native-c7" };
const receipt = { ...base, status: "confirmed", effect_id: effectId, operation: "customer_service.task_time_link", confirmed_at: "2026-10-10T10:00:00Z",
  result: { binding: { id: bindingId, task_id: taskId, version: 1 }, task_version: 2 } };
const linkBody = { task_id: taskId, expected_ticket_version: 3, expected_task_version: 1, confirmed: true };
const linkWire = ` { "task_id":"${taskId}", "expected_ticket_version":3, "expected_task_version":1, "confirmed":true }\n`;
const unlinkWire = JSON.stringify({ ...linkBody, binding_id: bindingId, expected_binding_version: 1 });
const recoveredLink = { task_id: taskId, expected_ticket_version: 3, expected_task_version: 1, binding_id: bindingId, action: "link" as const, effect_id: effectId };
const recoveredUnlink = { ...recoveredLink, action: "unlink" as const, expected_binding_version: 1 };
const previewBody: CrmTaskTimePreviewBody = { task_id: taskId, expected_ticket_version: 4, expected_task_version: 2, entries: [{ id: entryId, revision }], grouping: "per_task" };
const preview = { contact: { id: historicalId, name: "Visible native contact" }, lines: [{ description: "Closed time", quantity: "1.000000", unit: "hours", unit_price: "999999999999999999999999.01", amount: "999999999999999999999999.01" }],
  total_seconds: 3600, total_hours: "1.000000", time_entry_ids: [entryId], warnings: ["Current Invoice owner check"],
  totals: { subtotal: "999999999999999999999999.01", vat: "0.00", surcharge: "0.00", retention: "0.00", total: "999999999999999999999999.01", vat_rate: 0, surcharge_rate: null, retention_rate: null } };
const paths: CrmTaskTimeBillingV1Paths = {
  linkServiceTicketTask: (id) => `/crm/service-tickets/${id}/tasks/link`, unlinkServiceTicketTask: (id) => `/crm/service-tickets/${id}/tasks/unlink`,
  listServiceTicketTasks: (id) => `/crm/service-tickets/${id}/tasks`, getServiceBillableTime: (id) => `/crm/service-tickets/${id}/billable-time`,
  getServiceTimesheet: (id) => `/crm/service-tickets/${id}/timesheet`, previewServiceTimeInvoice: (id) => `/crm/service-tickets/${id}/time-invoice-preview`,
  getOriginalServiceTicketTaskLinkReceipt: (id) => `/crm/service-tickets/${id}/task-time/link/original-receipt`,
  getOriginalServiceTicketTaskUnlinkReceipt: (id) => `/crm/service-tickets/${id}/task-time/unlink/original-receipt`,
};
function sdk(fetch: typeof globalThis.fetch, extra: Partial<ConstructorParameters<typeof Factuarea>[0]> = {}): Factuarea {
  return new Factuarea({ apiKey: "fact_test_synthetic_task_time", baseUrl: "https://sdk-boundary.invalid/v1", timeout: 1000, maxRetries: 8, fetch, ...extra });
}

describe("native V1 TaskTime codecs", () => {
  it("preserves exact original link/unlink bytes and key, omission/null binding semantics and immutable original action", () => {
    const intent = decodeCrmTaskTimeIntent("link", ticketId, key, linkWire);
    expect(intent.originalWire).toBe(linkWire); expect(intent.originalKey).toBe(key); expect(Object.isFrozen(intent)).toBe(true);
    expect(JSON.parse(intent.originalWire)).not.toHaveProperty("binding_id"); expect(JSON.parse(intent.originalWire)).not.toHaveProperty("effect_id");
    const explicit = decodeCrmTaskTimeIntent("link", ticketId, key, JSON.stringify({ ...linkBody, binding_id: null, expected_binding_version: null }));
    expect(JSON.parse(explicit.originalWire).binding_id).toBeNull();
    expect(decodeCrmTaskTimeIntent("unlink", ticketId, key, unlinkWire).action).toBe("unlink");
  });
  it("rejects duplicate escaped names, SPA aliases/caller effect/context, partial binding CAS, unsafe versions and unrepresentable original keys", () => {
    const invalid = [
      `{"task_id":"${taskId}","task_\\u0069d":"${taskId}","expected_ticket_version":3,"expected_task_version":1,"confirmed":true}`,
      JSON.stringify({ ...linkBody, effect_id: effectId }), JSON.stringify({ ...linkBody, actor_id: historicalId }),
      JSON.stringify({ ...linkBody, task_uuid: taskId }), JSON.stringify({ ...linkBody, confirmed: false }),
      JSON.stringify({ ...linkBody, binding_id: bindingId }), JSON.stringify({ ...linkBody, expected_binding_version: 1 }),
      JSON.stringify({ ...linkBody, expected_ticket_version: 0 }), JSON.stringify({ ...linkBody, expected_task_version: Number.MAX_SAFE_INTEGER + 1 }),
    ];
    for (const wire of invalid) expect(() => decodeCrmTaskTimeIntent("link", ticketId, key, wire)).toThrow(TypeError);
    expect(() => decodeCrmTaskTimeIntent("unlink", ticketId, key, linkWire)).toThrow(TypeError);
    for (const originalKey of ["", "   ", " key", "key ", "a".repeat(256), "bad\nkey", "bad漢"]) expect(() => decodeCrmTaskTimeIntent("link", ticketId, originalKey, linkWire)).toThrow(TypeError);
    expect(() => decodeCrmTaskTimeIntent("link", ticketId, key, " ".repeat(262145))).toThrow(TypeError);
  });
  it("preserves masked fields/aggregate absence, historical identities, decimal strings and non-null original receipt contracts", () => {
    const tasks = { data: { ...base, revision, tasks: [{ id: bindingId, task_id: taskId }] } }; expect(decodeCrmTaskTimeTasks(tasks)).toBe(tasks);
    const timesheet = { data: { ...base, revision, entries: [{ id: entryId, task_id: taskId, user_id: historicalId, invoice_id: null, ended_at: null, duration_seconds: null }], next_cursor: null } };
    expect(decodeCrmTaskTimePage(timesheet, "timesheet").data).not.toHaveProperty("total_closed_seconds");
    expect(decodeCrmTaskTimePage({ data: { ...timesheet.data, total_closed_seconds: 0 } }, "timesheet").data.total_closed_seconds).toBe(0);
    expect(decodeCrmTaskTimePreview({ data: { ...base, preview } }).data.preview.lines[0]!.amount).toBe("999999999999999999999999.01");
    expect(decodeCrmTaskTimeReceipt({ data: receipt }, "link").data.result.binding.id).toBe(bindingId);
    expect(() => decodeCrmTaskTimeReceipt({ data: null }, "link")).toThrow(TypeError);
    expect(() => decodeCrmTaskTimeReceipt({ data: receipt }, "unlink")).toThrow(TypeError);
    expect(() => decodeCrmTaskTimeTasks({ data: { ...tasks.data, tasks: [{ id: bindingId, task_id: taskId, private_note: "hidden" }] } })).toThrow(TypeError);
    expect(() => decodeCrmTaskTimePage({ data: { ...timesheet.data, total_billable_closed_seconds: 0 } }, "timesheet")).toThrow(TypeError);
    expect(() => decodeCrmTaskTimePage({ data: { ...timesheet.data, entries: [{ id: entryId, task_uuid: taskId }] } }, "timesheet")).toThrow(TypeError);
    expect(() => decodeCrmTaskTimePreview({ data: { ...base, preview: { ...preview, lines: [{ ...preview.lines[0], amount: 1.23 }] } } })).toThrow(TypeError);
    expect(() => decodeCrmTaskTimePreview({ data: { ...base, preview: { ...preview, totals: { ...preview.totals, currency: "invented" } } } })).toThrow(TypeError);
  });
});

describe("configured native TaskTime SDK, entirely offline", () => {
  it("exposes the actual required-path public factory on the configured client without adding invoice/control endpoints", () => {
    const client = sdk(async () => { throw new Error("No dispatch"); });
    expect(client.crmTaskTimeBilling(paths)).toBeInstanceOf(CrmTaskTimeBillingResource);
    expect(createCrmTaskTimeBillingResource(client.http, paths)).toBeInstanceOf(CrmTaskTimeBillingResource);
    expect(() => client.crmTaskTimeBilling(undefined as never)).toThrow(TypeError);
    expect(() => client.crmTaskTimeBilling({ ...paths, invoice: () => "/invoice" } as never)).toThrow(TypeError);
    expect(typeof client.crmBookings).toBe("function"); expect(typeof client.crmSequences).toBe("function");
  });
  it("sends raw original link/unlink POST wires with explicit key, same auth/profile/version and fresh native response hook", async () => {
    const calls: Array<{ path: string; method: string; body: unknown; key: string | null }> = []; const observed: string[] = [];
    const resource = sdk(async (input, init) => {
      const h = new Headers(init?.headers); const path = new URL(String(input)).pathname;
      expect(h.get("Authorization")).toBe("Bearer fact_test_synthetic_task_time"); expect(h.get("X-Active-Profile")).toBe(historicalId);
      expect(h.get("Factuarea-Version")).toBe("2026-06-01"); expect(h.get("Content-Type")).toBe("application/json");
      calls.push({ path, method: init!.method!, body: init?.body, key: h.get("Idempotency-Key") });
      return Response.json({ data: path.endsWith("/unlink") ? { ...receipt, operation: "customer_service.task_time_unlink", result: { binding: { ...receipt.result.binding, version: 2, archived_at: null } } } : receipt }, { headers: { "X-Request-Id": "native-original", "Cache-Control": "private, no-store" } });
    }, { defaultHeaders: { "idempotency-key": "discard-default", "content-type": "text/plain" } }).crmTaskTimeBilling(paths);
    const config = { headers: { "Idempotency-Key": "discard-request", "X-Active-Profile": historicalId }, onResponse: (response: { requestId: string | null }) => observed.push(response.requestId!) };
    await resource.linkServiceTicketTask(decodeCrmTaskTimeIntent("link", ticketId, key, linkWire), config);
    await resource.unlinkServiceTicketTask(decodeCrmTaskTimeIntent("unlink", ticketId, key + " unlink", unlinkWire), config);
    expect(calls).toEqual([{ path: `/v1/crm/service-tickets/${ticketId}/tasks/link`, method: "POST", body: linkWire, key },
      { path: `/v1/crm/service-tickets/${ticketId}/tasks/unlink`, method: "POST", body: unlinkWire, key: key + " unlink" }]); expect(observed).toEqual(["native-original", "native-original"]);
  });
  it("keeps the real 262144-byte owner bound without changing the core's smaller original helper or reencoding wire", async () => {
    const wire = linkWire + "\n".repeat(200000); let calls = 0; expect(Buffer.byteLength(wire)).toBeGreaterThan(65536);
    const resource = sdk(async (_input, init) => { calls++; expect(init?.body).toBe(wire); return Response.json({ data: receipt }); }).crmTaskTimeBilling(paths);
    expect((await resource.linkServiceTicketTask(decodeCrmTaskTimeIntent("link", ticketId, key, wire))).data.effect_id).toBe(effectId); expect(calls).toBe(1);
  });
  it("retains a lost-ACK original key/wire without guessing server effect/binding or automatically dispatching/recovering", async () => {
    let calls = 0;
    const resource = sdk(async () => { calls++; throw new TypeError("Synthetic lost acknowledgement"); }).crmTaskTimeBilling(paths);
    const intent = decodeCrmTaskTimeIntent("link", ticketId, key, linkWire);
    const error = await resource.linkServiceTicketTask(intent).catch((cause: unknown) => cause);
    expect(error).toBeInstanceOf(CrmTaskTimeUnconfirmedWriteError); expect(error).toMatchObject({ originalIntent: intent, idempotencyKey: key, state: "unconfirmed" });
    expect((error as CrmTaskTimeUnconfirmedWriteError).originalIntent).not.toHaveProperty("effect_id");
    expect((error as CrmTaskTimeUnconfirmedWriteError).originalIntent).not.toHaveProperty("binding_id"); expect(calls).toBe(1);
  });
  it.each(["link", "unlink"] as const)("recovers the known original %s tuple through a query-only POST without resending original mutation bytes or allocating identities", async (action) => {
    let calls = 0; const body = action === "link" ? recoveredLink : recoveredUnlink;
    const resource = sdk(async (input, init) => {
      calls++; expect(new URL(String(input)).pathname).toBe(`/v1/crm/service-tickets/${ticketId}/task-time/${action}/original-receipt`);
      expect(init?.method).toBe("POST"); expect(JSON.parse(String(init?.body))).toEqual(body);
      expect(JSON.parse(String(init?.body))).not.toHaveProperty("original_wire_body"); expect(new Headers(init?.headers).get("Idempotency-Key")).toBeNull();
      return Response.json({ data: { ...receipt, operation: "customer_service.task_time_" + action } });
    }, { defaultHeaders: { "idempotency-key": "discard-unqualified-default" } }).crmTaskTimeBilling(paths);
    const result = action === "link" ? await resource.getOriginalServiceTicketTaskLinkReceipt(ticketId, recoveredLink) : await resource.getOriginalServiceTicketTaskUnlinkReceipt(ticketId, recoveredUnlink);
    expect(result.data.effect_id).toBe(effectId); expect(calls).toBe(1);
  });
  it("passes only an explicitly supplied readonly-POST HTTP key, preserving native policy errors and no automatic key", async () => {
    const keys: Array<string | null> = []; let calls = 0;
    const resource = sdk(async (_input, init) => {
      calls++; const value = new Headers(init?.headers).get("Idempotency-Key"); keys.push(value);
      if (value === null) return Response.json({ error: { code: "idempotency_key_required", param: "Idempotency-Key", message: "Current HTTP policy" } }, { status: 422 });
      return Response.json({ data: receipt });
    }).crmTaskTimeBilling(paths);
    await expect(resource.getOriginalServiceTicketTaskLinkReceipt(ticketId, recoveredLink)).rejects.toMatchObject({ code: "idempotency_key_required" });
    await resource.getOriginalServiceTicketTaskLinkReceipt(ticketId, recoveredLink, { idempotencyKey: "explicit readonly HTTP key" });
    expect(keys).toEqual([null, "explicit readonly HTTP key"]); expect(calls).toBe(2);
  });
  it("never turns an absent/null or different effect/binding/action recovery into a successful original", async () => {
    const replies: unknown[] = [null, { ...receipt, effect_id: entryId }, { ...receipt, result: { binding: { ...receipt.result.binding, id: entryId } } }, { ...receipt, operation: "customer_service.task_time_unlink" }];
    let calls = 0; const resource = sdk(async () => Response.json({ data: replies[calls++] })).crmTaskTimeBilling(paths);
    for (let i = 0; i < replies.length; i++) await expect(resource.getOriginalServiceTicketTaskLinkReceipt(ticketId, recoveredLink)).rejects.toMatchObject({ code: "crm_task_time_projection_unreadable" });
    expect(calls).toBe(4);
  });
  it("keeps preview selection/revisions and Money as a readonly POST with no invoice/emit/charge action", async () => {
    const urls: string[] = [];
    const resource = sdk(async (input, init) => {
      urls.push(new URL(String(input)).pathname); expect(init?.method).toBe("POST"); expect(JSON.parse(String(init?.body))).toEqual(previewBody);
      expect(new Headers(init?.headers).get("Idempotency-Key")).toBeNull(); return Response.json({ data: { ...base, preview } });
    }).crmTaskTimeBilling(paths);
    const result = await resource.previewServiceTimeInvoice(ticketId, previewBody);
    expect(result.data.preview.lines[0]!.unit_price).toBe(preview.lines[0]!.unit_price); expect(result.data.preview.totals?.total).toBe(preview.totals.total);
    expect(urls).toEqual([`/v1/crm/service-tickets/${ticketId}/time-invoice-preview`]);
    await expect(resource.previewServiceTimeInvoice(ticketId, { ...previewBody, entries: [previewBody.entries[0]!, previewBody.entries[0]!] })).rejects.toThrow(TypeError);
    await expect(resource.previewServiceTimeInvoice(ticketId, { ...previewBody, entries: [{ id: entryId, revision: "changed" }] })).rejects.toThrow(TypeError);
    expect(urls).toHaveLength(1);
  });
  it("rejects a preview that inserts an entry outside the admitted request selection", async () => {
    const resource = sdk(async () => Response.json({ data: { ...base, preview: { ...preview, time_entry_ids: [bindingId] } } })).crmTaskTimeBilling(paths);
    await expect(resource.previewServiceTimeInvoice(ticketId, previewBody)).rejects.toMatchObject({ code: "crm_task_time_projection_unreadable" });
  });
  it("snapshots known original tuple and preview selection before an awaiting caller can mutate its object", async () => {
    const body = { ...recoveredLink }; const selection = { ...previewBody, entries: [...previewBody.entries] }; let calls = 0;
    const resource = sdk(async (_input, init) => {
      calls++; const sent = JSON.parse(String(init?.body)); await Promise.resolve();
      if (sent.action === "link") { body.effect_id = entryId; body.binding_id = entryId; return Response.json({ data: receipt }); }
      selection.entries = [{ id: bindingId, revision }]; return Response.json({ data: { ...base, preview } });
    }).crmTaskTimeBilling(paths);
    expect((await resource.getOriginalServiceTicketTaskLinkReceipt(ticketId, body)).data.effect_id).toBe(effectId);
    expect((await resource.previewServiceTimeInvoice(ticketId, selection)).data.preview.time_entry_ids).toEqual([entryId]); expect(calls).toBe(2);
  });
  it("uses current native auth strategy and response metadata on the SAME configured client", async () => {
    let resolutions = 0; const observed: string[] = [];
    const resource = sdk(async (_input, init) => { expect(new Headers(init?.headers).get("Authorization")).toBe("Bearer current-native-auth"); return Response.json({ data: receipt }, { headers: { "X-Request-Id": "same-native-http" } }); },
      { authStrategy: { headers: async () => { resolutions++; return { Authorization: "Bearer current-native-auth" }; } } }).crmTaskTimeBilling(paths);
    await resource.linkServiceTicketTask(decodeCrmTaskTimeIntent("link", ticketId, key, linkWire), { onResponse: (response) => observed.push(response.requestId!) });
    expect(resolutions).toBe(1); expect(observed).toEqual(["same-native-http"]);
  });
  it.each([[401, AuthenticationError], [403, AuthenticationError], [404, NotFoundError], [409, ConflictError], [422, ValidationError]] as const)("preserves native current HTTP%s code/subcode/param/details without retrying or fabricating field aliases", async (status, ErrorType) => {
    let calls = 0; const native = { error: { code: "crm_version_conflict", subcode: "service_ticket_version_conflict", param: "expected_version", message: "Current owner state changed", details: { current_fields: { version: 5 } } } };
    const resource = sdk(async () => { calls++; return Response.json(native, { status }); }).crmTaskTimeBilling(paths);
    const error = await resource.linkServiceTicketTask(decodeCrmTaskTimeIntent("link", ticketId, key, linkWire)).catch((cause: unknown) => cause);
    expect(error).toBeInstanceOf(ErrorType); expect(error).not.toBeInstanceOf(CrmTaskTimeUnconfirmedWriteError); expect(error).toMatchObject({ status, rawResponse: native, param: "expected_version" }); expect(calls).toBe(1);
  });
  it("preserves missing-producer HTTP500 as native uncertainty cause without inventing a 503 or redispatching", async () => {
    let calls = 0; const native = { error: { code: "crm_operation_unavailable", subcode: "not_implemented", message: "Required owner producer unavailable" } };
    const resource = sdk(async () => { calls++; return Response.json(native, { status: 500 }); }).crmTaskTimeBilling(paths);
    const error = await resource.unlinkServiceTicketTask(decodeCrmTaskTimeIntent("unlink", ticketId, key, unlinkWire)).catch((cause: unknown) => cause);
    expect(error).toBeInstanceOf(CrmTaskTimeUnconfirmedWriteError); expect((error as Error).cause).toBeInstanceOf(ServerError);
    expect((error as Error).cause).toMatchObject({ status: 500, code: "crm_operation_unavailable", subcode: "not_implemented", rawResponse: native }); expect(calls).toBe(1);
  });
  it("keeps malformed, void204 or wrong-task write completion unconfirmed with original bytes and no synthetic controls", async () => {
    const replies = [new Response("malformed JSON", { status: 200 }), new Response(null, { status: 204 }), Response.json({ data: { ...receipt, result: { binding: { ...receipt.result.binding, task_id: entryId } } } })];
    let calls = 0; const resource = sdk(async () => replies[calls++]!).crmTaskTimeBilling(paths);
    for (let i = 0; i < replies.length; i++) await expect(resource.linkServiceTicketTask(decodeCrmTaskTimeIntent("link", ticketId, key, linkWire))).rejects.toMatchObject({ state: "unconfirmed", originalIntent: { originalWire: linkWire } }); expect(calls).toBe(3);
  });
  it("walks revision-bound timesheet cursors while keeping hidden totals absent and preserved nullable/omitted entry fields", async () => {
    const cursor = revision + ":" + entryId; const urls: URL[] = [];
    const resource = sdk(async (input, init) => {
      const url = new URL(String(input)); urls.push(url); expect(init?.method).toBe("GET"); expect(init?.body).toBeUndefined(); expect(url.searchParams.has("limit")).toBe(false);
      expect(new Headers(init?.headers).get("Idempotency-Key")).toBeNull();
      return Response.json({ data: { ...base, revision, entries: [{ id: urls.length === 1 ? entryId : effectId, task_id: taskId, ended_at: null, invoice_id: historicalId }], next_cursor: urls.length === 1 ? cursor : null } });
    }, { defaultHeaders: { "idempotency-key": "discard-read-default" } }).crmTaskTimeBilling(paths);
    const page = await resource.getServiceTimesheet(ticketId); expect(page.payload).not.toHaveProperty("total_closed_seconds"); expect(page.data[0]).not.toHaveProperty("description");
    expect((await page.toArray()).map((row) => row.id)).toEqual([entryId, effectId]); expect(urls[1]!.searchParams.get("cursor")).toBe(cursor);
  });
  it("keeps billable aggregation native and rejects invented filter fields, invalid revision cursors and limit beyond100 before HTTP", async () => {
    let calls = 0; const resource = sdk(async (input) => {
      calls++; const url = new URL(String(input)); expect(url.pathname).toBe(`/v1/crm/service-tickets/${ticketId}/billable-time`); expect(url.searchParams.get("limit")).toBe("1");
      return Response.json({ data: { ...base, revision, entries: [{ id: entryId, task_id: taskId, duration_seconds: 3600, billable: true }], next_cursor: null } });
    }).crmTaskTimeBilling(paths);
    const page = await resource.getServiceBillableTime(ticketId, { limit: 1 }); expect(page.payload).not.toHaveProperty("total_billable_closed_seconds");
    await expect(resource.getServiceBillableTime(ticketId, { filter: "all" } as never)).rejects.toThrow(TypeError);
    await expect(resource.getServiceTimesheet(ticketId, { cursor: "foreign" })).rejects.toThrow(TypeError);
    await expect(resource.getServiceTimesheet(ticketId, { limit: 101 })).rejects.toThrow(TypeError); expect(calls).toBe(1);
  });
  it("lists only visible linked Tasks with no body/query or fabricated economic access and rejects an unrelated ticket", async () => {
    let calls = 0; const resource = sdk(async (input, init) => {
      calls++; const url = new URL(String(input)); expect(url.pathname).toBe(`/v1/crm/service-tickets/${ticketId}/tasks`); expect(url.search).toBe(""); expect(init?.body).toBeUndefined();
      return Response.json({ data: { ...base, ticket_id: calls === 1 ? ticketId : taskId, revision, tasks: [{ id: bindingId, task_id: taskId, archived_at: null }] } });
    }).crmTaskTimeBilling(paths);
    expect((await resource.listServiceTicketTasks(ticketId)).data.tasks[0]).not.toHaveProperty("task_title");
    await expect(resource.listServiceTicketTasks(ticketId)).rejects.toMatchObject({ code: "crm_task_time_projection_unreadable" }); expect(calls).toBe(2);
  });
  it("fails closed before HTTP on false confirmation, wrong action, closed recovery extras or foreign required paths", async () => {
    let calls = 0; const resource = sdk(async () => { calls++; throw new Error("No dispatch expected"); }).crmTaskTimeBilling(paths);
    await expect(resource.linkServiceTicketTask({ action: "link", ticketId, originalKey: key, originalWire: JSON.stringify({ ...linkBody, confirmed: false }) })).rejects.toThrow(TypeError);
    await expect(resource.linkServiceTicketTask(decodeCrmTaskTimeIntent("unlink", ticketId, key, unlinkWire) as never)).rejects.toThrow(TypeError);
    await expect(resource.getOriginalServiceTicketTaskLinkReceipt(ticketId, { ...recoveredLink, original_wire_body: linkWire } as never)).rejects.toThrow(TypeError);
    await expect(resource.getOriginalServiceTicketTaskUnlinkReceipt(ticketId, { ...recoveredUnlink, action: "link" } as never)).rejects.toThrow(TypeError);
    const foreign = sdk(async () => { calls++; throw new Error("No dispatch expected"); }).crmTaskTimeBilling({ ...paths, listServiceTicketTasks: () => "https://foreign.invalid/tasks" });
    await expect(foreign.listServiceTicketTasks(ticketId)).rejects.toThrow(TypeError); expect(calls).toBe(0);
  });
  it("cancels before dispatch and bounds in-flight timeout to one attempt, preserving original intent without a fake receipt", async () => {
    let calls = 0; const resource = sdk(async (_input, init) => {
      calls++; return await new Promise<Response>((_resolve, reject) => init!.signal!.addEventListener("abort", () => reject(new DOMException("Synthetic timeout", "AbortError")), { once: true }));
    }, { timeout: 10 }).crmTaskTimeBilling(paths);
    const abort = new AbortController(); abort.abort();
    await expect(resource.linkServiceTicketTask(decodeCrmTaskTimeIntent("link", ticketId, key, linkWire), { signal: abort.signal })).rejects.toMatchObject({ code: "request_aborted" }); expect(calls).toBe(0);
    await expect(resource.unlinkServiceTicketTask(decodeCrmTaskTimeIntent("unlink", ticketId, key, unlinkWire))).rejects.toMatchObject({ state: "unconfirmed", originalIntent: { originalKey: key, originalWire: unlinkWire } }); expect(calls).toBe(1);
  });
  it("keeps query-only recovery transport failure as a readonly failure with no domain uncertainty or mutation resend", async () => {
    let calls = 0; const resource = sdk(async () => { calls++; throw new TypeError("Synthetic readonly failure"); }).crmTaskTimeBilling(paths);
    const error = await resource.getOriginalServiceTicketTaskLinkReceipt(ticketId, recoveredLink).catch((cause: unknown) => cause);
    expect(error).toBeInstanceOf(ConnectionError); expect(error).not.toBeInstanceOf(CrmTaskTimeUnconfirmedWriteError); expect(calls).toBe(1);
  });
});
