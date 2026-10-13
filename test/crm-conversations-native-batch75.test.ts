import { describe, expect, it } from "vitest";
import { ConnectionError, Factuarea, FactuareaError, decodeCrmConversationInbox, decodeCrmConversationThread, encodeCrmConversationFilters } from "../src/index.js";
import type { CrmConversationEnvelope, CrmConversationHead, CrmConversationInboxData, CrmConversationListParameters, CrmConversationMessage, CrmConversationThreadData, CrmConversationV1Paths, CrmConversationsReadConfig } from "../src/index.js";

const id = (value: number) => `019a0000-0000-7000-8000-${String(value).padStart(12, "0")}`;
const user = "550e8400-e29b-41d4-a716-446655440000";
const paths: CrmConversationV1Paths = { listConversations: "/crm/conversation", getConversation: "/crm/conversation/{conversation}" };
const fields = ["uuid", "mailbox_uuid", "status", "subject", "owner_uuid", "team_uuid", "last_message_at", "links", "messages", "sender", "recipients", "body", "delivery_status", "attachments"];
const meta = (version = "current-C7") => ({ authorization_version: version, readable_fields: [...fields], filterable_fields: ["mailbox_uuid", "status", "subject", "links"], sortable_fields: ["uuid", "subject", "last_message_at"] });
const head = (value: number): CrmConversationHead => ({ id: id(value), version: 2, mailbox_id: id(90), subject: "Original thread", status: "active", owner_id: user,
  team_id: id(91), last_message_at: "2026-10-10T10:00:00Z", links: [{ type: "lead", id: id(92), state: "automatic_suggestion" }] });
const message = (value: number): CrmConversationMessage => ({ id: id(value), conversation_id: id(1), version: 3, direction: "outbound",
  sender: { email: "sender@example.test", name: null }, recipients: [{ email: "recipient@example.test", name: "Recipient", kind: "to" }],
  subject: "Original subject", body: "Original body", body_format: "plain_text", composition_state: "send_intent", delivery_status: "unconfirmed", submitted_at: "2026-10-10T10:00:00Z" });
const inbox = (items = [head(1)], next: string | null = null, limit = 20): CrmConversationEnvelope<CrmConversationInboxData> => ({
  data: { items, next_cursor: next, total: next === null ? items.length : 3, active_count: next === null ? items.length : 3, archived_count: 0, limit }, meta: meta() });
const thread = (messages = [message(10)], next: string | null = null, limit = 20): CrmConversationEnvelope<CrmConversationThreadData> => ({
  data: { conversation: head(1), messages, attachments: messages.length === 0 ? [] : [{ id: id(40), conversation_id: id(1), message_id: messages[0]!.id,
    version: 1, filename: "quarantined.pdf", mime: "application/pdf", size: 100, status: "quarantine" }], next_cursor: next, limit }, meta: meta() });
const response = (data: unknown, requestId = "native-read") => Response.json(data, { headers: { "X-Request-Id": requestId, "Cache-Control": "no-store, private" } });
function sdk(fetch: typeof globalThis.fetch): Factuarea {
  return new Factuarea({ apiKey: "fact_test_synthetic_conversation75", baseUrl: "https://sdk-boundary.invalid/v1", maxRetries: 0, timeout: 1000, fetch });
}

describe("Conversation75 native READ boundary", () => {
  it("composes the two real GET routes through configured auth with native public identities", async () => {
    const calls: string[] = []; const literal = '{ "mailbox_uuid": "' + id(90) + '", "state": "active", "sort": "subject:asc" }';
    const resource = sdk(async (input, init) => {
      const url = new URL(String(input)); calls.push(url.pathname);
      expect(init?.method).toBe("GET"); expect(init?.body).toBeUndefined();
      const headers = new Headers(init?.headers);
      expect(headers.get("Authorization")).toBe("Bearer fact_test_synthetic_conversation75");
      expect(headers.has("Idempotency-Key")).toBe(false); expect(headers.has("Content-Type")).toBe(false);
      expect(headers.get("X-Active-Profile")).toBe(user);
      if (url.pathname.endsWith(id(1))) { expect(url.searchParams.has("filters")).toBe(false); return response(thread()); }
      expect(url.searchParams.get("filters")).toBe(literal); expect(url.searchParams.get("limit")).toBe("20"); return response(inbox());
    }).crmConversations(paths);
    const config = { headers: { "X-Active-Profile": user, "Idempotency-Key": "discard", "Content-Type": "discard" } };
    const list = await resource.listConversations({ filters: literal, limit: 20 }, config);
    const detail = await resource.getConversation(id(1), {}, config);
    expect(list.data[0]).toMatchObject({ id: id(1), mailbox_id: id(90), owner_id: user, team_id: id(91), links: [{ id: id(92) }] });
    expect(detail.data[0]).toMatchObject({ id: id(10), conversation_id: id(1), delivery_status: "unconfirmed", submitted_at: "2026-10-10T10:00:00Z" });
    expect(detail.payload.attachments[0]).toMatchObject({ message_id: id(10), status: "quarantine" });
    expect(calls).toEqual(["/v1/crm/conversation", `/v1/crm/conversation/${id(1)}`]);
    expect("sendConversationMessage" in resource).toBe(false); expect("downloadAttachment" in resource).toBe(false);
  });

  it("encodes typed owner filters without translating to public identity aliases", () => {
    const filters = { mailbox_uuid: id(90), target_type: "invoice" as const, target_uuid: id(91), search: "Fuera de la página inicial 📧", sort: "last_message_at:desc" as const };
    expect(JSON.parse(encodeCrmConversationFilters(filters))).toEqual(filters);
    expect(() => encodeCrmConversationFilters({ target_type: "invoice" })).toThrow(TypeError);
    expect(() => encodeCrmConversationFilters({ search: "📧".repeat(255) })).not.toThrow();
    expect(() => encodeCrmConversationFilters({ search: "📧".repeat(256) })).toThrow(TypeError);
  });

  it.each([
    { filters: {} }, { filters: "[]" }, { filters: "null" }, { filters: '{"mailbox_id":"' + id(90) + '"}' },
    { filters: '{"target_type":"invoice"}' }, { filters: '{"search":"   "}' }, { filters: '{"state":"pending"}' },
    { filters: '{"sort":"subject:sideways"}' }, { cursor: "" }, { cursor: "x".repeat(8193) }, { limit: 0 }, { limit: 101 },
    { limit: "01" }, { company_id: 5 }, { authorization_version: "old-C7" },
  ])("rejects malformed selection before any native request (%j)", async (parameters) => {
    let calls = 0; const resource = sdk(async () => { calls++; return response(inbox()); }).crmConversations(paths);
    await expect(resource.listConversations(parameters as CrmConversationListParameters)).rejects.toBeInstanceOf(TypeError); expect(calls).toBe(0);
  });

  it("rejects filters above the native UTF-8 byte boundary while accepting the exact boundary", async () => {
    let calls = 0; const resource = sdk(async () => { calls++; return response(inbox()); }).crmConversations(paths);
    await resource.listConversations({ filters: "{}" + " ".repeat(1048574) });
    await expect(resource.listConversations({ filters: "{}" + " ".repeat(1048575) })).rejects.toBeInstanceOf(TypeError);
    expect(calls).toBe(1);
  });

  it("keeps detail selection closed and rejects non-UUIDv7 original identities", async () => {
    let calls = 0; const resource = sdk(async () => { calls++; return response(thread()); }).crmConversations(paths);
    await expect(resource.getConversation(user)).rejects.toBeInstanceOf(TypeError);
    await expect(resource.getConversation(id(1), { filters: "{}" } as never)).rejects.toBeInstanceOf(TypeError);
    expect(calls).toBe(0);
  });

  it("requires the native relative route bindings and snapshots them at composition", async () => {
    const client = sdk(async (input) => { expect(new URL(String(input)).pathname).toBe("/v1/crm/conversation"); return response(inbox()); });
    expect(() => client.crmConversations({ ...paths, listConversations: "/api/crm/conversation" })).toThrow(TypeError);
    const mutable = { ...paths }; const resource = client.crmConversations(mutable); mutable.listConversations = "/foreign";
    await resource.listConversations();
  });

  it("preserves null/empty current masks and native metadata for each projection", () => {
    const list = inbox(); list.meta = { authorization_version: "fresh-C7", readable_fields: ["mailbox_uuid", "status"], filterable_fields: ["status"], sortable_fields: [] };
    Object.assign(list.data.items[0]!, { subject: null, owner_id: null, team_id: null, last_message_at: null, links: [] });
    expect(decodeCrmConversationInbox(list)).toEqual(list);
    const detail = thread([], null); detail.meta = list.meta; detail.data.conversation = list.data.items[0]!;
    expect(decodeCrmConversationThread(detail)).toEqual(detail);
  });

  it.each(["subject", "owner_id", "team_id", "last_message_at", "links"])("rejects a leaked masked head field %s", (field) => {
    const list = inbox(); const qualification: Record<string, string> = { owner_id: "owner_uuid", team_id: "team_uuid" };
    list.meta.readable_fields = fields.filter((name) => name !== (qualification[field] ?? field)); list.meta.filterable_fields = []; list.meta.sortable_fields = [];
    expect(() => decodeCrmConversationInbox(list)).toThrow(TypeError);
  });

  it.each(["sender", "recipients", "subject", "body", "delivery_status"])("rejects a leaked masked message field %s", (field) => {
    const detail = thread(); detail.meta.readable_fields = fields.filter((name) => name !== field); detail.meta.filterable_fields = []; detail.meta.sortable_fields = [];
    if (field === "subject") detail.data.conversation.subject = null;
    expect(() => decodeCrmConversationThread(detail)).toThrow(TypeError);
  });

  it("keeps send intention distinct from original pending/confirmed/unconfirmed/failed receipts", () => {
    for (const status of ["pending", "confirmed", "unconfirmed", "failed"] as const) {
      const detail = thread(); detail.data.messages[0]!.delivery_status = status;
      detail.data.messages[0]!.submitted_at = status === "confirmed" || status === "unconfirmed" ? "2026-10-10T10:00:00Z" : null;
      expect(decodeCrmConversationThread(detail).data.messages[0]!.delivery_status).toBe(status);
    }
    const impossible = thread(); impossible.data.messages[0]!.delivery_status = "confirmed"; impossible.data.messages[0]!.submitted_at = null;
    expect(() => decodeCrmConversationThread(impossible)).toThrow(TypeError);
  });

  it("rejects private transport additions and foreign message/attachment correspondence", () => {
    const privateData = thread(); Object.assign(privateData.data.attachments[0]!, { storage_key: "private" });
    expect(() => decodeCrmConversationThread(privateData)).toThrow(TypeError);
    const foreignMessage = thread(); foreignMessage.data.messages[0]!.conversation_id = id(2);
    expect(() => decodeCrmConversationThread(foreignMessage)).toThrow(TypeError);
    const foreignAttachment = thread(); foreignAttachment.data.attachments[0]!.message_id = id(99);
    expect(() => decodeCrmConversationThread(foreignAttachment)).toThrow(TypeError);
    const hidden = thread(); hidden.meta.readable_fields = fields.filter((name) => name !== "messages");
    expect(() => decodeCrmConversationThread(hidden)).toThrow(TypeError);
  });

  it("rejects invalid counts and alias identities instead of returning an empty list", () => {
    const badCounts = inbox(); badCounts.data.archived_count = 1; expect(() => decodeCrmConversationInbox(badCounts)).toThrow(TypeError);
    const duplicate = inbox([head(1), head(1)]); expect(() => decodeCrmConversationInbox(duplicate)).toThrow(TypeError);
    const alias = inbox(); const row = alias.data.items[0]! as unknown as Record<string, unknown>; row.uuid = row.id; delete row.id;
    expect(() => decodeCrmConversationInbox(alias)).toThrow(TypeError);
  });

  it("reports incompatible success with native request ID and raw projection", async () => {
    const incompatible = { data: [], meta: meta() };
    const resource = sdk(async () => response(incompatible, "projection-failure")).crmConversations(paths);
    await expect(resource.listConversations()).rejects.toMatchObject({ code: "crm_conversation_projection_unreadable", requestId: "projection-failure", rawResponse: incompatible });
  });
});

describe("Conversation75 factual native traversal", () => {
  it("retains literal filters, limit, original cursor bytes and configuration when public objects are edited", async () => {
    const cursor = "opaque/+original=="; const literal = '{ "search": "Original", "sort": "subject:asc" }';
    let calls = 0; const abort = new AbortController();
    const config: CrmConversationsReadConfig = { signal: abort.signal, headers: { "X-Active-Profile": user } };
    const resource = sdk(async (input, init) => {
      calls++; const query = new URL(String(input)).searchParams;
      expect(query.get("filters")).toBe(literal); expect(query.get("limit")).toBe("1"); expect(query.get("cursor")).toBe(calls === 1 ? null : cursor);
      expect(new Headers(init?.headers).get("X-Active-Profile")).toBe(user);
      const page = calls === 1 ? inbox([head(1)], cursor, 1) : inbox([head(2)], null, 1); page.meta.authorization_version = `fresh-C7-${calls}`;
      return response(page, `request-${calls}`);
    }).crmConversations(paths);
    const parameters = { filters: literal, limit: 1 }; const first = await resource.listConversations(parameters, config);
    parameters.filters = "{}"; parameters.limit = 100; config.headers!["X-Active-Profile"] = id(50);
    config.signal = new AbortController().signal;
    first.payload.next_cursor = "fabricated"; first.payload.limit = 100; first.payload.items[0]!.id = id(50); first.data[0]!.subject = "edited";
    first.meta.authorization_version = "client-proof";
    const next = await first.getNextPage(); expect(next?.meta.authorization_version).toBe("fresh-C7-2"); expect(next?.data[0]!.id).toBe(id(2));
    expect((await first.toArray()).map((item) => [item.id, item.subject])).toEqual([[id(1), "Original thread"], [id(2), "Original thread"]]);
    expect(calls).toBe(3);
  });

  it("iterates original messages only and keeps attachments scoped to their native page", async () => {
    let calls = 0;
    const resource = sdk(async (input) => {
      calls++; const query = new URL(String(input)).searchParams;
      expect(query.get("limit")).toBe("1"); expect(query.get("cursor")).toBe(calls === 1 ? null : "message-page-2");
      return response(calls === 1 ? thread([message(10)], "message-page-2", 1) : thread([message(11)], null, 1));
    }).crmConversations(paths);
    const first = await resource.getConversation(id(1), { limit: 1 });
    expect(first.payload.attachments[0]!.message_id).toBe(id(10));
    const second = await first.getNextPage(); expect(second?.payload.attachments[0]!.message_id).toBe(id(11));
    expect(await second?.getNextPage()).toBeNull();
    expect((await first.toArray()).map((item) => [item.id, item.delivery_status])).toEqual([[id(10), "unconfirmed"], [id(11), "unconfirmed"]]);
  });

  it("stops a repeated cursor before yielding a repeated native continuation", async () => {
    let calls = 0;
    const resource = sdk(async () => response(inbox([head(++calls)], "same-cursor", 1), `cursor-${calls}`)).crmConversations(paths);
    const first = await resource.listConversations({ limit: 1 });
    await expect(first.getNextPage()).rejects.toMatchObject({ code: "crm_conversation_projection_unreadable", requestId: "cursor-2" }); expect(calls).toBe(2);
  });

  it("retains previously visited identities across manual continuation calls", async () => {
    let calls = 0;
    const resource = sdk(async () => {
      calls++; return response(inbox([head(calls === 3 ? 1 : calls)], calls === 3 ? null : `cursor-${calls}`, 1), `identity-${calls}`);
    }).crmConversations(paths);
    const first = await resource.listConversations({ limit: 1 }); const second = await first.getNextPage();
    await expect(second!.getNextPage()).rejects.toMatchObject({ code: "crm_conversation_projection_unreadable", requestId: "identity-3" }); expect(calls).toBe(3);
  });

  it("refuses a foreign successful thread and a changed native page limit", async () => {
    const foreign = thread(); foreign.data.conversation.id = id(2); foreign.data.messages = []; foreign.data.attachments = [];
    const resource = sdk(async () => response(foreign)).crmConversations(paths);
    await expect(resource.getConversation(id(1))).rejects.toBeInstanceOf(ConnectionError);
    const other = sdk(async () => response(inbox([], null, 10))).crmConversations(paths);
    await expect(other.listConversations({ limit: 20 })).rejects.toBeInstanceOf(ConnectionError);
  });

  it.each([401, 403, 404, 409, 422, 429, 503])("preserves native %s authority/recovery errors during continuation", async (status) => {
    let calls = 0; const native = { error: { code: "native_conversation_read", subcode: "current_denial", param: "cursor", message: "Native refusal" } };
    const resource = sdk(async () => ++calls === 1 ? response(inbox([head(1)], "original-cursor", 1))
      : Response.json(native, { status, headers: { "X-Request-Id": "current-denial", "Retry-After": "30" } })).crmConversations(paths);
    const first = await resource.listConversations({ limit: 1 }); const error = await first.toArray().catch((cause: unknown) => cause);
    expect(error).toBeInstanceOf(FactuareaError); expect(error).toMatchObject({ status, code: "native_conversation_read", subcode: "current_denial", param: "cursor", requestId: "current-denial", rawResponse: native });
    expect(calls).toBe(2);
  });

  it("keeps cancellation effective on the original signal for later native reads", async () => {
    let calls = 0; const abort = new AbortController();
    const resource = sdk(async () => { calls++; return response(inbox([head(1)], "original-cursor", 1)); }).crmConversations(paths);
    const first = await resource.listConversations({ limit: 1 }, { signal: abort.signal }); abort.abort("stop native reads");
    await expect(first.getNextPage()).rejects.toBeInstanceOf(ConnectionError); expect(calls).toBe(1);
  });
});
