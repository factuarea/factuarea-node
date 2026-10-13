import { describe, expect, it } from "vitest";
import { ConnectionError, CrmMailboxUnconfirmedWriteError, CrmMailboxWritersResource, Factuarea, FactuareaError, ServerError,
  createCrmMailboxWritersResource, decodeCrmMailboxWriteIntent, decodeCrmMailboxWriteReceipt } from "../src/index.js";
import type { CrmMailboxWriterV1Paths, CrmMailboxWriteIntent } from "../src/index.js";

const mailboxId = "018f1111-2222-7333-8444-555555555555";
const effectId = "018f1111-2222-7333-8444-666666666666";
const connectionId = "018f1111-2222-7333-8444-777777777777";
const teamId = "018f1111-2222-7333-8444-888888888888";
const userId = "550e8400-e29b-41d4-a716-446655440000";
const historicalUserId = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
const key = "opaque-mailbox-original-key-123";
const createBody = { expected_version: 0, provider: "gmail", connection_id: null, kind: "personal", team_id: null, allowed_user_ids: [userId, historicalUserId] };
const updateBody = { expected_version: 7, provider: "microsoft_graph", connection_id: connectionId, kind: "shared", team_id: teamId, allowed_user_ids: [] };
const createWire = ` \n{ "expected_version" : 0, "provider" : "gmail", "connection_id" : null, "kind":"personal", "team_id":null, "allowed_user_ids":${JSON.stringify(createBody.allowed_user_ids)} }\n`;
const updateWire = JSON.stringify(updateBody);
const created = { id: mailboxId, effect_id: effectId, connection_id: connectionId, version: 1, availability: "disconnected", confirmed_at: "2026-10-10T12:30:00Z", provider: "gmail" };
const updated = { ...created, version: 8, availability: "active", provider: "microsoft_graph" };
// Test-only explicit bindings: no route default or production endpoint is introduced by this SDK.
const paths: CrmMailboxWriterV1Paths = { createMailboxConfiguration: "/crm/conversation/mailboxes",
  updateMailboxConfiguration: (id) => `/crm/conversation/mailboxes/${id}`,
  getMailboxWriteOriginal: (id) => `/crm/conversation/mailboxes${id === null ? "" : "/" + id}/write-original` };
function sdk(fetch: typeof globalThis.fetch, extra: Partial<ConstructorParameters<typeof Factuarea>[0]> = {}): Factuarea {
  return new Factuarea({ apiKey: "fact_test_synthetic_mailbox_writer", baseUrl: "https://sdk-boundary.invalid/v1", maxRetries: 8, timeout: 1000, fetch, ...extra });
}
function nativeReceipt(data: unknown = created, status = 201): Response { return Response.json({ data }, { status, headers: { "X-Request-Id": "native-mailbox-original", "Cache-Control": "no-store, private" } }); }

describe("closed native Mailbox writer codecs", () => {
  it("retains exact original wire/key and mandatory nulls with canonical historical User UUIDs", () => {
    const intent = decodeCrmMailboxWriteIntent(null, key, createWire);
    expect(intent).toEqual({ targetId: null, originalKey: key, originalWire: createWire }); expect(Object.isFrozen(intent)).toBe(true);
    expect(JSON.parse(intent.originalWire)).toEqual(createBody);
    expect(JSON.parse(intent.originalWire)).not.toHaveProperty("id"); expect(JSON.parse(intent.originalWire)).not.toHaveProperty("effect_id");
    const update = decodeCrmMailboxWriteIntent(mailboxId, key, updateWire);
    expect(update.originalWire).toBe(updateWire); expect(update.targetId).toBe(mailboxId);
  });
  it("rejects omissions, client identities/authority, SPA aliases and wrong null semantics before dispatch", () => {
    const invalid = [Object.fromEntries(Object.entries(createBody).filter(([name]) => name !== "team_id")),
      Object.fromEntries(Object.entries(createBody).filter(([name]) => name !== "connection_id")), { ...createBody, id: mailboxId },
      { ...createBody, effect_id: effectId }, { ...createBody, company_id: mailboxId }, { ...createBody, confirmed: true },
      { ...createBody, connection_uuid: connectionId }, { ...createBody, provider: null }, { ...createBody, kind: "oauth" },
      { ...createBody, team_id: teamId }, { ...createBody, connection_id: userId }, { ...createBody, allowed_user_ids: null }];
    for (const body of invalid) expect(() => decodeCrmMailboxWriteIntent(null, key, JSON.stringify(body))).toThrow(TypeError);
    expect(() => decodeCrmMailboxWriteIntent(mailboxId, key, JSON.stringify({ ...updateBody, connection_id: null }))).toThrow(TypeError);
  });
  it("rejects duplicate escaped JSON members and float/exponent/unsafe CAS tokens without reencoding", () => {
    const duplicate = createWire.replace('"provider" : "gmail"', '"provider":"gmail","prov\\u0069der":"gmail"');
    expect(() => decodeCrmMailboxWriteIntent(null, key, duplicate)).toThrow(TypeError);
    for (const token of ["0.0", "0e0", "1", "-1", "null", '"0"', "9007199254740992"]) {
      expect(() => decodeCrmMailboxWriteIntent(null, key, createWire.replace('"expected_version" : 0', '"expected_version" : ' + token))).toThrow(TypeError);
    }
    expect(() => decodeCrmMailboxWriteIntent(mailboxId, key, JSON.stringify({ ...updateBody, expected_version: Number.MAX_SAFE_INTEGER }))).toThrow(TypeError);
    expect(() => decodeCrmMailboxWriteIntent(null, key, '[]')).toThrow(TypeError);
  });
  it("enforces closed unique user lists and server business UUID v7 without changing case/wire", () => {
    expect(() => decodeCrmMailboxWriteIntent(null, key, JSON.stringify({ ...createBody, allowed_user_ids: [userId, userId.toUpperCase()] }))).toThrow(TypeError);
    expect(() => decodeCrmMailboxWriteIntent(null, key, JSON.stringify({ ...createBody, allowed_user_ids: Array(1001).fill(userId) }))).toThrow(TypeError);
    expect(() => decodeCrmMailboxWriteIntent(userId, key, updateWire)).toThrow(TypeError);
    const wire = JSON.stringify({ ...updateBody, connection_id: connectionId.toUpperCase(), team_id: null });
    expect(decodeCrmMailboxWriteIntent(mailboxId.toUpperCase(), key, wire).originalWire).toBe(wire);
  });
  it("uses native UTF8 byte/key bounds and refuses transport-normalized/unrepresentable original headers", () => {
    expect(decodeCrmMailboxWriteIntent(null, "k".repeat(512), createWire).originalKey).toHaveLength(512);
    for (const bad of ["", "k".repeat(513), "contains space", "leading\tkey", "key\n", "key\x7f", "😀", "\uD800"]) {
      expect(() => decodeCrmMailboxWriteIntent(null, bad, createWire)).toThrow(TypeError);
    }
    const exact = createWire + " ".repeat(65536 - Buffer.byteLength(createWire));
    expect(decodeCrmMailboxWriteIntent(null, key, exact).originalWire).toBe(exact);
    expect(() => decodeCrmMailboxWriteIntent(null, key, exact + " ")).toThrow(TypeError);
    expect(() => decodeCrmMailboxWriteIntent(null, key, createWire + "\uD800")).toThrow(TypeError);
  });
  it("decodes only the closed seven-field native original receipt without provider/OAuth inference", () => {
    expect(decodeCrmMailboxWriteReceipt({ data: created }).data).toEqual(created);
    expect(decodeCrmMailboxWriteReceipt({ data: updated }).data.availability).toBe("active");
    const invalid: unknown[] = [null, { ...created, availability: "connected" }, { ...created, provider: "gmail_oauth" }, { ...created, version: 0 },
      { ...created, oauth_granted: true }, { ...created, effect_uuid: effectId }, { ...created, connection_id: null },
      { ...created, confirmed_at: "2026-10-10T12:30:00+00:00" }, { ...created, version: Number.MAX_SAFE_INTEGER + 1 },
      Object.fromEntries(Object.entries(created).filter(([name]) => name !== "effect_id"))];
    for (const data of invalid) expect(() => decodeCrmMailboxWriteReceipt({ data })).toThrow(TypeError);
    expect(() => decodeCrmMailboxWriteReceipt({ data: created, authorized: true })).toThrow(TypeError);
  });
});

describe("configured native Mailbox writer SDK, offline boundary only", () => {
  it("exports the real required-path factory while preserving existing factories and rejecting incomplete bindings", () => {
    const client = sdk(async () => { throw new Error("No dispatch"); });
    expect(client.crmMailboxWriters(paths)).toBeInstanceOf(CrmMailboxWritersResource);
    expect(createCrmMailboxWritersResource(client.http, paths)).toBeInstanceOf(CrmMailboxWritersResource);
    expect(() => client.crmMailboxWriters(undefined as never)).toThrow(TypeError);
    expect(() => client.crmMailboxWriters({ ...paths, publicOriginalReader: () => "/read" } as never)).toThrow(TypeError);
    expect(() => client.crmMailboxWriters({ ...paths, createMailboxConfiguration: "https://foreign.invalid/mailboxes" })).toThrow(TypeError);
    expect(typeof client.crmSequences).toBe("function"); expect(typeof client.crmBookings).toBe("function"); expect(typeof client.crmTaskTimeBilling).toBe("function");
    expect(client.crmMailboxWriters(paths)).not.toHaveProperty("getMailboxOriginal"); expect(client.crmMailboxWriters(paths)).not.toHaveProperty("activateProvider");
  });
  it("sends native POST201 and PUT200 raw bytes/key through configured auth/options/hook without allocating IDs", async () => {
    const calls: unknown[] = []; const responses: string[] = [];
    const resource = sdk(async (input, init) => {
      const h = new Headers(init?.headers); const url = new URL(String(input));
      expect(h.get("Authorization")).toBe("Bearer fact_test_synthetic_mailbox_writer"); expect(h.get("Factuarea-Version")).toBe("2026-06-01");
      expect(h.get("X-Active-Profile")).toBe(userId); expect(h.get("Content-Type")).toBe("application/json"); expect(url.search).toBe("");
      calls.push({ path: url.pathname, method: init?.method, body: init?.body, key: h.get("Idempotency-Key") });
      return nativeReceipt(init?.method === "POST" ? created : updated, init?.method === "POST" ? 201 : 200);
    }, { defaultHeaders: { "idempotency-key": "discard-default", "content-type": "text/plain" } }).crmMailboxWriters(paths);
    const config = { headers: { "Idempotency-Key": "discard-request", "X-Active-Profile": userId }, onResponse: (r: { requestId: string | null }) => responses.push(r.requestId!) };
    await resource.createMailboxConfiguration(decodeCrmMailboxWriteIntent(null, key, createWire), config);
    await resource.updateMailboxConfiguration(decodeCrmMailboxWriteIntent(mailboxId, key + "-update", updateWire), config);
    expect(calls).toEqual([{ path: "/v1/crm/conversation/mailboxes", method: "POST", body: createWire, key },
      { path: `/v1/crm/conversation/mailboxes/${mailboxId}`, method: "PUT", body: updateWire, key: key + "-update" }]);
    expect(responses).toEqual(["native-mailbox-original", "native-mailbox-original"]);
  });
  it.each([null, mailboxId])("recovers target %s using ONLY original_wire GET query and exact key, never mutation/current-head/public-reader", async (target) => {
    const wire = target === null ? createWire : updateWire; let calls = 0;
    const resource = sdk(async (input, init) => {
      calls++; const url = new URL(String(input));
      expect(url.pathname).toBe(`/v1/crm/conversation/mailboxes${target === null ? "" : "/" + target}/write-original`);
      expect([...url.searchParams.keys()]).toEqual(["original_wire"]); expect(url.searchParams.get("original_wire")).toBe(wire);
      expect(init?.method).toBe("GET"); expect(init?.body).toBeUndefined(); expect(new Headers(init?.headers).get("Idempotency-Key")).toBe(key);
      return nativeReceipt(target === null ? created : updated, 200);
    }, { defaultHeaders: { "IDEMPOTENCY-KEY": "discard-default" } }).crmMailboxWriters(paths);
    expect((await resource.getMailboxWriteOriginal(decodeCrmMailboxWriteIntent(target, key, wire))).data.effect_id).toBe(effectId); expect(calls).toBe(1);
  });
  it("encodes original query transport once and preserves JSON escaped property spelling and trailing whitespace", async () => {
    const wire = createWire.replace('"provider"', '"prov\\u0069der"') + "\t\r\n"; let calls = 0;
    const resource = sdk(async (input, init) => {
      calls++; const url = new URL(String(input)); expect(url.searchParams.get("original_wire")).toBe(wire);
      expect(url.search).toContain("%5Cu0069"); expect(url.search).toContain("%09%0D%0A"); expect(init?.body).toBeUndefined();
      return nativeReceipt(created, 200);
    }).crmMailboxWriters(paths);
    await resource.getMailboxWriteOriginal(decodeCrmMailboxWriteIntent(null, key, wire)); expect(calls).toBe(1);
  });
  it("retains lost-ACK intent and requires an explicit readonly recovery without automatic resend/recovery", async () => {
    const calls: string[] = []; const intent = decodeCrmMailboxWriteIntent(null, key, createWire);
    const resource = sdk(async (_input, init) => {
      calls.push(init!.method!); if (init?.method === "POST") throw new TypeError("Synthetic lost acknowledgement");
      return nativeReceipt(created, 200);
    }).crmMailboxWriters(paths);
    const error = await resource.createMailboxConfiguration(intent).catch((cause: unknown) => cause);
    expect(error).toBeInstanceOf(CrmMailboxUnconfirmedWriteError);
    expect(error).toMatchObject({ originalIntent: intent, idempotencyKey: key, operationId: "createMailboxConfigurationV1", state: "unconfirmed" });
    expect(calls).toEqual(["POST"]); expect((error as CrmMailboxUnconfirmedWriteError).originalIntent).not.toHaveProperty("effect_id");
    expect((await resource.getMailboxWriteOriginal((error as CrmMailboxUnconfirmedWriteError).originalIntent)).data.id).toBe(mailboxId);
    expect(calls).toEqual(["POST", "GET"]);
  });
  it("snapshots exact caller intent before awaiting configured auth/network", async () => {
    const mutable = { targetId: mailboxId, originalKey: key, originalWire: updateWire }; let enter!: () => void; let release!: () => void;
    const entered = new Promise<void>((resolve) => { enter = resolve; }); const pending = new Promise<void>((resolve) => { release = resolve; });
    const resource = sdk(async (_input, init) => {
      enter(); await pending; expect(init?.body).toBe(updateWire); expect(new Headers(init?.headers).get("Idempotency-Key")).toBe(key);
      return nativeReceipt(updated, 200);
    }).crmMailboxWriters(paths);
    const result = resource.updateMailboxConfiguration(mutable); await entered;
    mutable.originalKey = "different-key"; mutable.originalWire = createWire; mutable.targetId = teamId; release();
    expect((await result).data.id).toBe(mailboxId);
  });
  it.each([403, 409, 422, 429])("preserves native %s errors/current authority without retry or claiming a receipt", async (status) => {
    let calls = 0; const native = { error: { type: "native_error", code: "native_current_authority", subcode: "native_exact_subcode", param: "expected_version", message: "Native refusal", errors: [{ param: "connection_id", code: "native_current", message: "Changed" }] } };
    const resource = sdk(async () => { calls++; return Response.json(native, { status, headers: { "X-Request-Id": "native-refusal", "Retry-After": "0" } }); }).crmMailboxWriters(paths);
    const error = await resource.updateMailboxConfiguration(decodeCrmMailboxWriteIntent(mailboxId, key, updateWire)).catch((cause: unknown) => cause);
    expect(error).toBeInstanceOf(FactuareaError); expect(error).not.toBeInstanceOf(CrmMailboxUnconfirmedWriteError);
    expect(error).toMatchObject({ status, code: "native_current_authority", subcode: "native_exact_subcode", param: "expected_version", requestId: "native-refusal", rawResponse: native });
    expect(calls).toBe(1);
  });
  it("treats native 503 write as unconfirmed and retains the native cause without retry", async () => {
    let calls = 0; const resource = sdk(async () => { calls++; return Response.json({ error: { code: "native_producer_unavailable", message: "Unavailable" } }, { status: 503 }); }).crmMailboxWriters(paths);
    const error = await resource.updateMailboxConfiguration(decodeCrmMailboxWriteIntent(mailboxId, key, updateWire)).catch((cause: unknown) => cause);
    expect(error).toBeInstanceOf(CrmMailboxUnconfirmedWriteError); expect((error as Error).cause).toBeInstanceOf(ServerError);
    expect((error as Error).cause).toMatchObject({ status: 503, code: "native_producer_unavailable" }); expect(calls).toBe(1);
  });
  it.each([404, 503])("preserves native original-query %s errors as readonly failures without inventing null/current receipt or retry", async (status) => {
    let calls = 0; const resource = sdk(async () => { calls++; return Response.json({ error: { code: "native_original_unavailable", message: "Native refusal" } }, { status }); }).crmMailboxWriters(paths);
    const error = await resource.getMailboxWriteOriginal(decodeCrmMailboxWriteIntent(null, key, createWire)).catch((cause: unknown) => cause);
    expect(error).toBeInstanceOf(FactuareaError); expect(error).not.toBeInstanceOf(CrmMailboxUnconfirmedWriteError);
    expect(error).toMatchObject({ status, code: "native_original_unavailable" }); expect(calls).toBe(1);
  });
  it("rejects success-shaped new head, wrong provider/connection/target, null and wrong HTTP status as original proofs", async () => {
    const variants: Array<[unknown, number]> = [[{ ...updated, version: 9 }, 200], [{ ...updated, provider: "gmail" }, 200],
      [{ ...updated, connection_id: teamId }, 200], [{ ...updated, id: teamId }, 200], [null, 200], [updated, 201]];
    let calls = 0; const resource = sdk(async () => { const [data, status] = variants[calls++]!; return nativeReceipt(data, status); }).crmMailboxWriters(paths);
    for (const _ of variants) await expect(resource.getMailboxWriteOriginal(decodeCrmMailboxWriteIntent(mailboxId, key, updateWire))).rejects.toMatchObject({ code: "crm_mailbox_original_unreadable" });
    expect(calls).toBe(variants.length);
  });
  it("treats unreadable write acknowledgement/204 as unconfirmed instead of inventing an effect or Sequence control outcome", async () => {
    let calls = 0; const replies = [Response.json({ data: null }, { status: 201 }), new Response(null, { status: 204 }), nativeReceipt(created, 200)];
    const resource = sdk(async () => replies[calls++]!).crmMailboxWriters(paths);
    for (const _ of replies) await expect(resource.createMailboxConfiguration(decodeCrmMailboxWriteIntent(null, key, createWire))).rejects.toBeInstanceOf(CrmMailboxUnconfirmedWriteError);
    expect(calls).toBe(3);
  });
  it("refuses invalid intent/mode/foreign or query-bearing required route before any dispatch", async () => {
    let calls = 0; const client = sdk(async () => { calls++; throw new Error("No dispatch"); }); const resource = client.crmMailboxWriters(paths);
    await expect(resource.createMailboxConfiguration(decodeCrmMailboxWriteIntent(mailboxId, key, updateWire) as never)).rejects.toThrow(TypeError);
    await expect(resource.updateMailboxConfiguration(decodeCrmMailboxWriteIntent(null, key, createWire) as never)).rejects.toThrow(TypeError);
    await expect(resource.getMailboxWriteOriginal({ targetId: null, originalKey: "space key", originalWire: createWire })).rejects.toThrow(TypeError);
    const bad = client.crmMailboxWriters({ ...paths, getMailboxWriteOriginal: () => "/crm/conversation/mailboxes/write-original?operation=read" });
    await expect(bad.getMailboxWriteOriginal(decodeCrmMailboxWriteIntent(null, key, createWire))).rejects.toThrow(TypeError); expect(calls).toBe(0);
  });
  it("pre-aborted writes and original queries do not dispatch or imply a committed outcome", async () => {
    let calls = 0; const abort = new AbortController(); abort.abort("cancelled before send");
    const resource = sdk(async () => { calls++; throw new Error("No dispatch"); }).crmMailboxWriters(paths);
    for (const request of [resource.createMailboxConfiguration(decodeCrmMailboxWriteIntent(null, key, createWire), { signal: abort.signal }),
      resource.getMailboxWriteOriginal(decodeCrmMailboxWriteIntent(null, key, createWire), { signal: abort.signal })]) {
      const error = await request.catch((cause: unknown) => cause); expect(error).toBeInstanceOf(ConnectionError); expect(error).not.toBeInstanceOf(CrmMailboxUnconfirmedWriteError);
      expect(error).toMatchObject({ code: "request_aborted" });
    }
    expect(calls).toBe(0);
  });
});
