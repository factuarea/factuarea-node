import { describe, expect, it } from "vitest";
import {
  AuthenticationError, ConflictError, ConnectionError, Factuarea, RateLimitError, ServerError, ValidationError,
  CustomerServiceWriteUnconfirmedError, serviceTicketActorId, serviceTicketId, serviceTicketTimestamp, serviceTicketVersion,
  type AttachServiceTicketDocumentRequest, type CustomerServiceWriteConfig, type CustomerServiceWriteIntent,
  type DetachServiceTicketDocumentRequest, type MoveServiceTicketToStageRequest, type ServiceTicketId, type ServiceTicketListQuery,
} from "../src/index.js";

const BASE = "https://api.factuarea.test/v1";
const ticketId = serviceTicketId("019cf42b-5b00-7000-8000-000000000001");
const pipelineId = serviceTicketId("019cf42b-5b00-7000-8000-000000000002");
const stageId = serviceTicketId("019cf42b-5b00-7000-8000-000000000003");
const documentId = serviceTicketId("019cf42b-5b00-7000-8000-000000000004");
const attachmentId = serviceTicketId("019cf42b-5b00-7000-8000-000000000005");
const messageId = serviceTicketId("019cf42b-5b00-7000-8000-000000000006");
const actorId = serviceTicketActorId("a44d9ed1-6ef6-48c1-9520-18da7801bd64");
const version = serviceTicketVersion(7);
const move: MoveServiceTicketToStageRequest = { expected_version: version, pipeline_id: pipelineId, stage_id: stageId };
const attach: AttachServiceTicketDocumentRequest = { expected_version: version, document_id: documentId, document_version: serviceTicketVersion(3) };
const detach: DetachServiceTicketDocumentRequest = { expected_version: version, attachment_id: attachmentId };
const key = "ticket-original-intent-001";

function sdk(fetch: typeof globalThis.fetch, overrides: Partial<ConstructorParameters<typeof Factuarea>[0]> = {}): Factuarea {
  return new Factuarea({
    apiKey: "fact_test_ticket_fixture", baseUrl: BASE, maxRetries: 9,
    defaultHeaders: { "X-Company-Id": "7" }, ...overrides, fetch
  });
}
function success(data: unknown, status = 200): Response {
  return Response.json({ data }, { status, headers: { "X-Request-Id": "ticket-request-7" } });
}
async function unconfirmed(call: Promise<unknown>): Promise<CustomerServiceWriteUnconfirmedError> {
  try { await call; throw new Error("Expected an unconfirmed result."); }
  catch (error) { expect(error).toBeInstanceOf(CustomerServiceWriteUnconfirmedError); return error as CustomerServiceWriteUnconfirmedError; }
}
function projection(): Record<string, unknown> {
  return {
    id: ticketId, version: 8, title: "Àngela, 山", description: "Primera línea\nSegunda línea", status: "pending",
    priority: "future_native_priority", type: "incident", creator_id: actorId, assignee_id: null,
    pipeline_id: pipelineId, stage_id: stageId, counterparty_id: null, person_id: null, cycle: 2,
    created_at: "2026-10-09T10:00:00.123456Z", updated_at: "2026-10-09T12:00:00+02:00",
    first_response_at: null, resolved_at: null, closed_at: null, archived_at: null,
    comments: [{
      id: messageId, visibility: "public", author_type: "participant", author_id: messageId,
      body: "Respuesta original\nÀngela, 山", body_format: "plain_text", delivery_state: "recorded",
      conversation_message_id: null, created_at: "2026-10-09T11:00:00Z", edited_at: null
    }],
    attachments: [{
      id: attachmentId, document_id: documentId, document_version: 3, mime: "application/pdf",
      size_bytes: 0, created_by: actorId, created_at: "2026-10-09T10:00:00Z"
    }],
    writable_fields: ["pipeline_id", "stage_id", "waiting_reason"], authorization_version: "native-current-authority-007",
  };
}

describe("handwritten native CustomerService v1 client", () => {
  it("uses all six native routes with auth, exact JSON and original response metadata", async () => {
    const requests: { method: string | undefined; path: string; query: URLSearchParams; body: unknown; headers: Headers; }[] = [];
    const client = sdk(async (input, init) => {
      const url = new URL(String(input)); requests.push({
        method: init?.method, path: url.pathname, query: url.searchParams,
        body: init?.body === undefined ? undefined : JSON.parse(String(init.body)), headers: new Headers(init?.headers)
      });
      if (init?.method === "POST") return success({ id: ticketId, version: 8 });
      if (url.pathname.endsWith("timeline")) return success({
        id: ticketId, items: [{
          version: 7, action: "stage_moved", actor_id: actorId,
          occurred_at: "2026-10-09T10:00:00Z", snapshot: { id: ticketId, version: 7 }
        }], total: 1, page: 2, per_page: 10
      });
      if (url.pathname === "/v1/crm/service-tickets") return success({ items: [{ id: ticketId, version: 7 }], total: 1, page: 2, per_page: 10 });
      return success(projection());
    });
    const get = await client.customerService.get(ticketId);
    await client.customerService.list({ page: 2, per_page: 10, status: "pending", sort: "id", direction: "desc" });
    const timeline = await client.customerService.timeline(ticketId, { page: 2, per_page: 10 });
    await client.customerService.moveToStage(ticketId, move, { idempotencyKey: key });
    await client.customerService.attachDocument(ticketId, attach, { idempotencyKey: key });
    await client.customerService.detachDocument(ticketId, detach, { idempotencyKey: key });
    expect(requests.map(r => [r.method, r.path])).toEqual([
      ["GET", `/v1/crm/service-tickets/${ticketId}`], ["GET", "/v1/crm/service-tickets"],
      ["GET", `/v1/crm/service-tickets/${ticketId}/timeline`], ["POST", `/v1/crm/service-tickets/${ticketId}/move-to-stage`],
      ["POST", `/v1/crm/service-tickets/${ticketId}/attachments`], ["POST", `/v1/crm/service-tickets/${ticketId}/attachments/remove`],
    ]);
    expect(requests.slice(0, 3).every(r => r.body === undefined)).toBe(true);
    expect(requests.slice(3).map(r => r.body)).toEqual([move, attach, detach]);
    expect(requests.every(r => r.headers.get("X-Company-Id") === "7")).toBe(true);
    expect(requests.slice(3).every(r => r.headers.get("Idempotency-Key") === key)).toBe(true);
    expect(requests[1]?.query.get("status")).toBe("pending"); expect(requests[1]?.query.get("sort")).toBe("id");
    expect(get).toMatchObject({ status: 200, requestId: "ticket-request-7", data: projection() });
    expect(get.data.attachments?.[0]).toMatchObject({ id: attachmentId, size_bytes: 0, created_by: actorId });
    expect(timeline.data.items[0]?.snapshot).toEqual({ id: ticketId, version: 7 });
  });

  it.each([7, 8])("accepts the owner's original stage no-op or changed receipt CAS %s", async next => {
    const client = sdk(async () => success({ id: ticketId, version: next }));
    expect((await client.customerService.moveToStage(ticketId, move, { idempotencyKey: key })).data).toEqual({ id: ticketId, version: next });
  });

  it.each([
    {}, { waiting_reason: undefined }, { waiting_reason: "waiting_customer" }, { waiting_reason: null },
    { waiting_reason: null, customer_message_id: messageId }, { customer_message_id: null },
  ])("preserves waiting omission/null and original message release %#", async waiting => {
    let body = "";
    const client = sdk(async (_input, init) => { body = String(init?.body); return success({ id: ticketId, version: 8 }); });
    await client.customerService.moveToStage(ticketId, { ...move, ...waiting } as MoveServiceTicketToStageRequest, { idempotencyKey: key });
    expect(JSON.parse(body)).toEqual(JSON.parse(JSON.stringify({ ...move, ...waiting })));
  });

  it.each([
    { customer_message_id: messageId }, { waiting_reason: "waiting_customer", customer_message_id: messageId },
    { waiting_reason: "waiting_agent" }, { waiting_reason: false }, { waiting_reason: null, customer_message_id: actorId },
  ])("rejects invented waiting causes or non-release customer messages before I/O %#", async waiting => {
    let attempts = 0; const client = sdk(async () => { attempts++; return success({ id: ticketId, version: 8 }); });
    await expect(client.customerService.moveToStage(ticketId, { ...move, ...waiting } as unknown as MoveServiceTicketToStageRequest, { idempotencyKey: key })).rejects.toBeInstanceOf(TypeError);
    expect(attempts).toBe(0);
  });

  it.each([{}, { waiting_reason: null }, { waiting_reason: "future_native_cause" }])("tolerates an omitted or optional future waiting projection without requiring a new public field %#", async waiting => {
    const client = sdk(async () => success({ id: ticketId, version: 8, ...waiting }));
    const result = (await client.customerService.get(ticketId)).data;
    expect(result).toEqual({ id: ticketId, version: 8, ...waiting }); expect(result).not.toHaveProperty("attachments");
    expect(result).not.toHaveProperty("comments"); expect(result).not.toHaveProperty("writable_fields");
  });

  it("detaches only the server-owned attachment id from an authorized read using the current ticket CAS", async () => {
    const bodies: unknown[] = [];
    const client = sdk(async (_input, init) => {
      if (init?.method === "GET") return success({ id: ticketId, version: 9, attachments: [{ id: attachmentId, document_id: documentId, document_version: 3 }] });
      bodies.push(JSON.parse(String(init?.body))); return success({ id: ticketId, version: 10 });
    });
    const current = (await client.customerService.get(ticketId)).data;
    const attachment = current.attachments?.[0]; expect(attachment).toBeDefined();
    await client.customerService.detachDocument(ticketId, { expected_version: current.version, attachment_id: attachment!.id }, { idempotencyKey: key });
    expect(bodies).toEqual([{ expected_version: 9, attachment_id: attachmentId }]);
  });

  it("iterates native offset pages with copied filters and preserves current page masks", async () => {
    const queries: URLSearchParams[] = [];
    const client = sdk(async input => {
      const q = new URL(String(input)).searchParams; queries.push(q);
      return success({ items: [{ id: q.get("page") === "1" ? ticketId : documentId, version: 1 }], total: 2, page: Number(q.get("page")), per_page: 1 });
    });
    const filters: ServiceTicketListQuery = { per_page: 1, status: "pending", sort: "updated_at", direction: "asc" };
    const ids = []; for await (const ticket of client.customerService.iterate(filters)) { ids.push(ticket.id); filters.status = "closed"; }
    expect(ids).toEqual([ticketId, documentId]);
    expect(queries.map(q => [q.get("page"), q.get("status"), q.get("sort")])).toEqual([["1", "pending", "updated_at"], ["2", "pending", "updated_at"]]);
  });

  it.each(["no-progress", "max-pages"])("does not silently truncate native pagination: %s", async reason => {
    const client = sdk(async () => success({ items: reason === "no-progress" ? [] : [{ id: ticketId, version: 1 }], total: 5, page: 1, per_page: 1 }));
    const consume = async (): Promise<void> => { for await (const _ticket of client.customerService.iterate({ per_page: 1 }, undefined, 1)) { /* consume */ } };
    await expect(consume()).rejects.toBeInstanceOf(TypeError);
  });

  it.each([
    { id: documentId, items: [{ version: 7 }], total: 1, page: 1, per_page: 50 },
    { id: ticketId, items: [{ version: 7, snapshot: { id: documentId, version: 7 } }], total: 1, page: 1, per_page: 50 },
    { id: ticketId, items: [{ version: 7, snapshot: { id: ticketId, version: 8 } }], total: 1, page: 1, per_page: 50 },
    { id: ticketId, items: [{ version: 7 }], total: 1, page: 2, per_page: 50 },
  ])("rejects foreign timeline parents, substituted historical versions or query pages %#", async data => {
    const client = sdk(async () => success(data));
    await expect(client.customerService.timeline(ticketId)).rejects.toBeInstanceOf(TypeError);
  });

  it.each(["moveToStage", "attachDocument", "detachDocument"] as const)("retains original bytes/key/CAS and recovers %s once without a head read", async operation => {
    const requests: { path: string; method: string | undefined; body: string; key: string | null; trace: string | null; }[] = [];
    const headers = { "X-Client-Trace": "original" };
    const client = sdk(async (input, init) => {
      requests.push({ path: String(input), method: init?.method, body: String(init?.body), key: new Headers(init?.headers).get("Idempotency-Key"), trace: new Headers(init?.headers).get("X-Client-Trace") });
      if (requests.length === 1) throw new TypeError("lost response after commit");
      return success({ id: ticketId, version: 8 });
    });
    const body = operation === "moveToStage" ? { ...move, waiting_reason: null, customer_message_id: messageId } : operation === "attachDocument" ? { ...attach } : { ...detach };
    const original = JSON.stringify(body), config = { idempotencyKey: key, headers, maxRetries: 50 } as unknown as CustomerServiceWriteConfig;
    const call = operation === "moveToStage" ? client.customerService.moveToStage(ticketId, body as MoveServiceTicketToStageRequest, config)
      : operation === "attachDocument" ? client.customerService.attachDocument(ticketId, body as AttachServiceTicketDocumentRequest, config)
        : client.customerService.detachDocument(ticketId, body as DetachServiceTicketDocumentRequest, config);
    const error = await unconfirmed(call); expect(requests).toHaveLength(1); expect(Object.isFrozen(error.intent)).toBe(true);
    body.expected_version = serviceTicketVersion(100); headers["X-Client-Trace"] = "changed";
    expect((await client.customerService.recover(error.intent)).data.version).toBe(8);
    expect(requests[1]).toEqual(requests[0]); expect(error.intent.bodyJson).toBe(original);
    expect(error.intent).toMatchObject({ ticketId, expectedVersion: 7, idempotencyKey: key, method: "POST" });
    if (operation === "moveToStage") expect(error.intent).toMatchObject({ waitingReasonProvided: true, waitingReason: null, customerMessageId: messageId });
    expect(JSON.stringify(error.intent)).not.toContain("fact_test_ticket_fixture");
  });

  it.each(["company", "credential", "profile", "version"])("checks effective original %s auth context before recovery I/O", async changed => {
    let attempts = 0, credential = "Bearer original-token";
    const defaults = { "X-Company-Id": "7", "X-Active-Profile": stageId, "Factuarea-Version": "2026-06-04" };
    const client = sdk(async () => { attempts++; throw new TypeError("lost response"); }, { defaultHeaders: defaults, authStrategy: { headers: async () => ({ Authorization: credential }) } });
    const error = await unconfirmed(client.customerService.moveToStage(ticketId, move, { idempotencyKey: key }));
    if (changed === "company") defaults["X-Company-Id"] = "8";
    if (changed === "profile") defaults["X-Active-Profile"] = messageId;
    if (changed === "version") defaults["Factuarea-Version"] = "2026-10-09";
    if (changed === "credential") credential = "Bearer changed-token";
    await expect(client.customerService.recover(error.intent)).rejects.toThrow("original request context");
    expect(attempts).toBe(1); expect(JSON.stringify(error.intent)).not.toContain("original-token");
  });

  it("rejects cross-client, forged and payload-replacement recovery before I/O", async () => {
    let attempts = 0; const fetcher: typeof fetch = async () => { attempts++; throw new TypeError("lost response"); };
    const first = sdk(fetcher), other = sdk(fetcher);
    const error = await unconfirmed(first.customerService.attachDocument(ticketId, attach, { idempotencyKey: key }));
    await expect(other.customerService.recover(error.intent)).rejects.toThrow("original sent ticket intent and client");
    await expect(first.customerService.recover({ ...error.intent } as CustomerServiceWriteIntent)).rejects.toThrow("original sent ticket intent");
    await expect(first.customerService.recover(error.intent, { body: detach } as never)).rejects.toBeInstanceOf(TypeError);
    expect(attempts).toBe(1);
  });

  it("cancels an in-flight waiting release without replay and permits explicit recovery with a fresh signal", async () => {
    let attempts = 0; const controller = new AbortController();
    const client = sdk(async (_input, init) => {
      attempts++;
      if (attempts > 1) return success({ id: ticketId, version: 8 });
      return new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => reject(new DOMException("cancelled", "AbortError")), { once: true });
        queueMicrotask(() => controller.abort());
      });
    });
    const error = await unconfirmed(client.customerService.moveToStage(ticketId, { ...move, waiting_reason: null, customer_message_id: messageId }, { idempotencyKey: key, signal: controller.signal }));
    expect(attempts).toBe(1); expect(error.originalError).toBeInstanceOf(ConnectionError);
    const fresh = new AbortController(); await client.customerService.recover(error.intent, { signal: fresh.signal }); expect(attempts).toBe(2);
  });

  it("retains a timed-out original detach intent and attempts explicit recovery only once", async () => {
    let attempts = 0;
    const client = sdk(async () => { attempts++; throw new DOMException("timeout", "AbortError"); });
    const error = await unconfirmed(client.customerService.detachDocument(ticketId, detach, { idempotencyKey: key, timeout: 1 }));
    expect(error.originalError).toBeInstanceOf(ConnectionError); expect(attempts).toBe(1);
    const recovered = await unconfirmed(client.customerService.recover(error.intent, { timeout: 2 }));
    expect(recovered.intent).toBe(error.intent); expect(recovered.intent.bodyJson).toBe(JSON.stringify(detach)); expect(attempts).toBe(2);
  });

  it("does not treat a queued read or wrong native list page as a ticket projection", async () => {
    const queued = sdk(async () => success({ id: ticketId, version: 8 }, 202));
    await expect(queued.customerService.get(ticketId)).rejects.toBeInstanceOf(TypeError);
    const page = sdk(async () => success({ items: [], total: 0, page: 2, per_page: 50 }));
    await expect(page.customerService.list()).rejects.toBeInstanceOf(TypeError);
  });

  it("cancels a pre-aborted read before I/O and retains the original intent for a pre-aborted mutation", async () => {
    let attempts = 0; const controller = new AbortController(); controller.abort();
    const client = sdk(async () => { attempts++; return success({ id: ticketId, version: 8 }); });
    await expect(client.customerService.get(ticketId, { signal: controller.signal })).rejects.toBeInstanceOf(ConnectionError);
    const error = await unconfirmed(client.customerService.detachDocument(ticketId, detach, { idempotencyKey: key, signal: controller.signal }));
    expect(error.intent.bodyJson).toBe(JSON.stringify(detach)); expect(attempts).toBe(0);
    await client.customerService.recover(error.intent, { signal: new AbortController().signal }); expect(attempts).toBe(1);
  });

  it("keeps AbortSignal attached while consuming a JSON receipt after response headers", async () => {
    const controller = new AbortController();
    const client = sdk(async (_input, init) => new Response(new ReadableStream<Uint8Array>({
      start(stream) {
        init?.signal?.addEventListener("abort", () => stream.error(new DOMException("cancelled", "AbortError")), { once: true });
        setTimeout(() => controller.abort(), 0);
      }
    }), { headers: { "Content-Type": "application/json", "X-Request-Id": "ticket-body-abort" } }));
    const error = await unconfirmed(client.customerService.attachDocument(ticketId, attach, { idempotencyKey: key, signal: controller.signal }));
    expect(error.intent.expectedVersion).toBe(7); expect(error.originalError).toMatchObject({ name: "AbortError" });
  });

  it.each([
    { status: 409, subcode: "service_ticket_version_conflict", type: ConflictError },
    { status: 422, subcode: "invalid_ticket", type: ValidationError },
    { status: 429, subcode: "technical_rate_limit", type: RateLimitError },
  ])("keeps determinate native HTTP $status errors/fields/request id without retries", async ({ status, subcode, type }) => {
    let attempts = 0;
    const client = sdk(async () => { attempts++; return Response.json({ error: { code: "native_error", subcode, message: "Native rejected intent", request_id: "ticket-original", fields: { waiting_reason: ["invalid"] } } }, { status, headers: { "Retry-After": "17" } }); });
    try { await client.customerService.moveToStage(ticketId, move, { idempotencyKey: key }); throw new Error("Expected native error"); }
    catch (error) {
      expect(error).toBeInstanceOf(type); expect(error).not.toBeInstanceOf(CustomerServiceWriteUnconfirmedError);
      expect(error).toMatchObject({ subcode, requestId: "ticket-original" });
      if (error instanceof ValidationError) expect(error.fields.waiting_reason).toEqual(["invalid"]);
      if (error instanceof RateLimitError) expect(error.retryAfter).toBe(17);
    }
    expect(attempts).toBe(1);
  });

  it.each([
    { status: 403, subcode: "authority_revoked", type: AuthenticationError },
    { status: 500, subcode: "producer_unavailable", type: ServerError },
    { status: 409, subcode: "service_ticket_result_unconfirmed", type: ConflictError },
  ])("retains the original intent and typed cause for ambiguous/revoked HTTP $status", async ({ status, subcode, type }) => {
    let attempts = 0;
    const client = sdk(async () => { attempts++; return Response.json({ error: { code: "native_result", subcode, message: "Not confirmed", request_id: "ticket-original" } }, { status }); });
    const error = await unconfirmed(client.customerService.detachDocument(ticketId, detach, { idempotencyKey: key }));
    expect(error.originalError).toBeInstanceOf(type); expect(error).toMatchObject({ status, subcode, requestId: "ticket-original" });
    expect(error.intent.operation).toBe("detachDocument"); expect(attempts).toBe(1);
  });

  it.each([
    { status: 201, data: { id: ticketId, version: 8 } }, { status: 202, data: { status: "queued" } },
    { status: 200, data: { id: documentId, version: 8 } }, { status: 200, data: { id: ticketId, version: 9 } },
    { status: 200, data: { id: ticketId, version: "8" } }, { status: 200, data: { id: ticketId, version: 8, attachment_id: attachmentId } },
    { status: 200, data: { id: ticketId, version: 8, delivery_state: "confirmed" } },
  ])("never fabricates confirmation from foreign, malformed, private or wrong-status receipts %#", async ({ status, data }) => {
    const client = sdk(async () => success(data, status));
    const error = await unconfirmed(client.customerService.moveToStage(ticketId, move, { idempotencyKey: key }));
    expect(error.requestId).toBe("ticket-request-7"); expect(error.intent.expectedVersion).toBe(7);
  });

  it.each(["attach", "detach"])("requires the original CAS successor for %s, not the stage no-op exception", async operation => {
    const client = sdk(async () => success({ id: ticketId, version: 7 }));
    const call = operation === "attach" ? client.customerService.attachDocument(ticketId, attach, { idempotencyKey: key }) : client.customerService.detachDocument(ticketId, detach, { idempotencyKey: key });
    expect((await unconfirmed(call)).intent.expectedVersion).toBe(7);
  });

  it.each([
    { id: documentId, version: 8 }, { id: ticketId, version: 8, waiting_facts: [] },
    { id: ticketId, version: 8, attachments: [{ id: attachmentId, document_id: documentId, document_version: 3, url: "https://private.test/file" }] },
    { id: ticketId, version: 8, writable_fields: [] },
    { id: ticketId, version: 8, writable_fields: ["waiting_reason", "waiting_reason"], authorization_version: "native" },
    { id: ticketId, version: 8, created_at: "2026-02-30T10:00:00Z" },
    { id: ticketId, version: 8, comments: [{ id: messageId, visibility: "public", body: "<script>alert(1)</script>" }] },
  ])("rejects foreign reads, private projections and invalid native child/mask fields %#", async data => {
    const client = sdk(async () => success(data));
    await expect(client.customerService.get(ticketId)).rejects.toBeInstanceOf(TypeError);
  });

  it.each([
    { ...attach, attachment_id: attachmentId }, { ...attach, file: new Blob(["bytes"]) }, { ...attach, url: "https://file.test" },
    { ...attach, company_id: 99 }, { ...attach, document_version: 3.5 }, { ...attach, document_id: actorId },
    { ...attach, expected_version: Number.MAX_SAFE_INTEGER },
  ])("rejects SPA bytes/URLs, invented identity/authority and invalid reference/CAS before I/O %#", async body => {
    let attempts = 0; const client = sdk(async () => { attempts++; return success({ id: ticketId, version: 8 }); });
    await expect(client.customerService.attachDocument(ticketId, body as AttachServiceTicketDocumentRequest, { idempotencyKey: key })).rejects.toBeInstanceOf(TypeError);
    expect(attempts).toBe(0);
  });

  it("rejects unsupported native filters and managed headers before I/O", async () => {
    let attempts = 0; const client = sdk(async () => { attempts++; return success({ id: ticketId, version: 8 }); });
    for (const query of [{ status: "resolved" }, { per_page: 101 }, { page: 1000001 }, { page: "1" }, { page: null }, { per_page: null }, { company_id: 99 }, { status: null }, { direction: "sideways" }]) {
      await expect(client.customerService.list(query as ServiceTicketListQuery)).rejects.toBeInstanceOf(TypeError);
    }
    await expect(client.customerService.timeline(ticketId, { page: null } as never)).rejects.toBeInstanceOf(TypeError);
    const consume = async (): Promise<void> => { for await (const _ticket of client.customerService.iterate({ per_page: null } as never)) { /* consume */ } };
    await expect(consume()).rejects.toBeInstanceOf(TypeError);
    await expect(client.customerService.attachDocument(ticketId, attach, { idempotencyKey: "" })).rejects.toBeInstanceOf(TypeError);
    await expect(client.customerService.attachDocument(ticketId, attach, { idempotencyKey: key, headers: { "idempotency-key": "replacement" } })).rejects.toBeInstanceOf(TypeError);
    expect(() => serviceTicketId(actorId)).toThrow(); expect(() => serviceTicketVersion(1.5)).toThrow();
    expect(() => serviceTicketVersion(Number.MAX_SAFE_INTEGER + 1)).toThrow();
    expect(() => serviceTicketTimestamp("2026-02-30T10:00:00Z")).toThrow(); expect(() => serviceTicketTimestamp("2026-10-09T10:00:00")).toThrow();
    expect(attempts).toBe(0);
  });
});

function publicTypeContract(): void {
  // @ts-expect-error Native entity UUIDs must pass the UUIDv7 boundary.
  const invalidId: ServiceTicketId = "42";
  // @ts-expect-error Only explicit waiting release can cite a customer message.
  const invalidRelease: MoveServiceTicketToStageRequest = { ...move, customer_message_id: messageId };
  // @ts-expect-error A waiting opening cannot cite the customer reply as its release.
  const invalidOpening: MoveServiceTicketToStageRequest = { ...move, waiting_reason: "waiting_customer", customer_message_id: messageId };
  // @ts-expect-error A document reference is not a caller-owned attachment identity.
  const invalidAttach: AttachServiceTicketDocumentRequest = { ...attach, attachment_id: attachmentId };
  // @ts-expect-error The adapter has no automatic mutation retries.
  const invalidConfig: CustomerServiceWriteConfig = { idempotencyKey: key, maxRetries: 9 };
  void [invalidId, invalidRelease, invalidOpening, invalidAttach, invalidConfig];
}
void publicTypeContract;
