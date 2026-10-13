import { describe, expect, it } from "vitest";
import { ConnectionError, CrmServiceMacroPage, CrmServiceMacroUnconfirmedWriteError, CrmServiceMacrosResource, Factuarea, FactuareaError,
  createCrmServiceMacrosResource, decodeCrmServiceMacroIntent, decodeCrmServiceMacroList, decodeCrmServiceMacroOriginal,
  decodeCrmServiceMacroRender, decodeCrmServiceMacroUsage } from "../src/index.js";
import type { CrmServiceMacrosV1Paths, CrmServiceMacroApplyBody, CrmServiceMacroApplyIntent, CrmServiceMacroCreateBody, CrmServiceMacroIntent, CrmServiceMacroRenderBody } from "../src/index.js";

const macroId = "018f1111-2222-7333-8444-555555555555";
const ticketId = "018f1111-2222-7333-8444-666666666666";
const teamId = "018f1111-2222-7333-8444-777777777777";
const userId = "550e8400-e29b-41d4-a716-446655440000";
const historicalUserId = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
const key = "opaque-service-macro-original-Key!";
const createBody: CrmServiceMacroCreateBody = { expected_version: 0, confirmed: true, name: "Respuesta inicial", visibility: "personal", team_id: null,
  body_template: "Hola {{customer_name}}", variables_schema: ["customer_name"], actions: {}, enabled: true, usage_metric: "application" };
const updateBody = { expected_version: 3, confirmed: true, team_id: null, actions: { assignees: [], tags: [] } };
const archiveBody = { expected_version: 4, confirmed: true };
const applyBody: CrmServiceMacroApplyBody = { expected_version: 4, confirmed: true, ticket_id: ticketId, ticket_expected_version: 8, recipient_id: null,
  locale: "ca", mode: "application", selected_actions: null };
const renderBody: CrmServiceMacroRenderBody = { macro_version: 4, ticket_id: ticketId, ticket_version: 8, locale: "ca" };
const render = { macro_id: macroId, macro_version: 4, ticket_id: ticketId, ticket_version: 8, recipient_id: null, locale: "ca", draft: "Hola",
  warnings: [{ token: "customer_name", reason: "hidden" }], actions: {}, render_hash: "a".repeat(64), requires_review: true };
// Required paths are explicit test bindings to the actual native V1 Source leaf; the production SDK supplies no defaults.
const paths: CrmServiceMacrosV1Paths = {
  listServiceMacros: "/crm/service-macros", createServiceMacro: "/crm/service-macros", updateServiceMacro: (id) => `/crm/service-macros/${id}`,
  archiveServiceMacro: (id) => `/crm/service-macros/${id}/archive`, applyServiceMacro: (id) => `/crm/service-macros/${id}/apply`,
  renderServiceMacro: (id) => `/crm/service-macros/${id}/render`, getServiceMacroUsage: (id) => `/crm/service-macros/${id}/usage`,
  getSaveServiceMacroOriginal: "/crm/service-macro-receipts/save", getArchiveServiceMacroOriginal: "/crm/service-macro-receipts/archive", getApplyServiceMacroOriginal: "/crm/service-macro-receipts/apply",
};
function sdk(fetch: typeof globalThis.fetch, options: Partial<ConstructorParameters<typeof Factuarea>[0]> = {}): Factuarea {
  return new Factuarea({ apiKey: "fact_test_synthetic_macro_A", baseUrl: "https://sdk-boundary.invalid/v1", maxRetries: 7, timeout: 1000, fetch, ...options });
}
function original(version = 1, operation = "customer_service.save_macro", fields: Record<string, unknown> = {}) {
  return { data: { macro_id: macroId, count: 1, receipts: [{ id: macroId, version, fields, operation }], page: 1, per_page: 1 } };
}
function response(value: unknown, status = 200): Response { return Response.json(value, { status, headers: { "X-Request-Id": "native-macro-request" } }); }
function intent(operation: "save", target: string | null, body?: object): ReturnType<typeof decodeCrmServiceMacroIntent>;
function intent(operation: "archive" | "apply", target: string, body?: object): ReturnType<typeof decodeCrmServiceMacroIntent>;
function intent(operation: "save" | "archive" | "apply", target: string | null, body?: object): ReturnType<typeof decodeCrmServiceMacroIntent> {
  return decodeCrmServiceMacroIntent(operation, target, key, JSON.stringify(body ?? (operation === "save" ? target === null ? createBody : updateBody : operation === "archive" ? archiveBody : applyBody)));
}

describe("native ServiceMacro wire/DTO boundaries", () => {
  it("preserves mandatory confirmation, exact raw key/wire, explicit null and empty objects/lists", () => {
    const wire = ` \n${JSON.stringify(createBody)}\r\n`;
    const value = decodeCrmServiceMacroIntent("save", null, key, wire);
    expect(value).toEqual({ operation: "save", targetId: null, originalKey: key, originalWire: wire }); expect(Object.isFrozen(value)).toBe(true);
    expect(JSON.parse(intent("save", macroId).originalWire)).toEqual(updateBody);
    expect(() => decodeCrmServiceMacroIntent("save", null, key, JSON.stringify({ ...createBody, actions: [] }))).toThrow(TypeError);
    expect(decodeCrmServiceMacroIntent("save", null, key, JSON.stringify({ ...createBody, actions: { assignees: [userId, historicalUserId] } })).originalKey).toBe(key);
  });
  it.each(["name", "visibility", "body_template", "variables_schema", "actions", "enabled", "usage_metric", "confirmed", "expected_version"])("requires native create member %s", (field) => {
    expect(() => decodeCrmServiceMacroIntent("save", null, key, JSON.stringify(Object.fromEntries(Object.entries(createBody).filter(([name]) => name !== field))))).toThrow(TypeError);
  });
  it("rejects client business/effect/context identities, SPA names, invalid key/CAS and null-required primitives", () => {
    for (const change of [{ id: macroId }, { effect_id: ticketId }, { company_id: macroId }, { authorization_version: "opaque-c7" }, { team_uuid: teamId },
      { confirmed: false }, { expected_version: 1 }, { expected_version: Number.MAX_SAFE_INTEGER + 1 }, { name: null }, { actions: null }, { variables_schema: null }]) {
      expect(() => decodeCrmServiceMacroIntent("save", null, key, JSON.stringify({ ...createBody, ...change }))).toThrow(TypeError);
    }
    for (const bad of ["", "key with space", "key\n", "é", "x".repeat(256)]) expect(() => decodeCrmServiceMacroIntent("save", null, bad, JSON.stringify(createBody))).toThrow(TypeError);
    expect(() => decodeCrmServiceMacroIntent("archive", null as never, key, JSON.stringify(archiveBody))).toThrow(TypeError);
    expect(() => decodeCrmServiceMacroIntent("save", macroId, key, '{"expected_version":3,"confirmed":true}')).toThrow(TypeError);
  });
  it("rejects nested duplicate JSON names, escaped duplicates, exponent/float CAS and oversized original wire", () => {
    const wire = JSON.stringify(createBody);
    for (const bad of [wire.replace('"expected_version":0', '"expected_version":0.0'), wire.replace('"expected_version":0', '"expected_version":0e0'),
      wire.replace('"actions":{}', '"actions":{"status":"new","sta\\u0074us":"new"}'), wire.replace('"name":', '"name":"a","na\\u006de":')]) {
      expect(() => decodeCrmServiceMacroIntent("save", null, key, bad)).toThrow(TypeError);
    }
    const atBound = wire + " ".repeat(250000 - Buffer.byteLength(wire));
    expect(decodeCrmServiceMacroIntent("save", null, key, atBound).originalWire).toBe(atBound);
    expect(() => decodeCrmServiceMacroIntent("save", null, key, atBound + " ")).toThrow(TypeError);
  });
  it("uses the actual application/confirm_render rules without treating rendering as delivery", () => {
    expect(() => decodeCrmServiceMacroIntent("apply", macroId, key, JSON.stringify({ ...applyBody, selected_actions: [] }))).toThrow(TypeError);
    expect(() => decodeCrmServiceMacroIntent("apply", macroId, key, JSON.stringify({ ...applyBody, mode: "confirm_render" }))).toThrow(TypeError);
    expect(() => decodeCrmServiceMacroIntent("apply", macroId, key, JSON.stringify({ ...applyBody, ticket_id: userId }))).toThrow(TypeError);
    expect(decodeCrmServiceMacroIntent("apply", macroId, key, JSON.stringify({ ...applyBody, mode: "confirm_render", render_hash: "f".repeat(64), selected_actions: [] })).operation).toBe("apply");
  });
  it("preserves masked omitted fields and explicit nulls across list/usage/original native projections", () => {
    const list = { data: { items: [{ id: macroId, version: 4, fields: { team_id: null, actions: {}, enabled: false } }], total: 1, page: 1, per_page: 25 } };
    expect(decodeCrmServiceMacroList(list)).toBe(list); expect(list.data.items[0]!.fields).not.toHaveProperty("name");
    const usage = { data: { macro_id: macroId, count: 1, receipts: [{ actor_id: historicalUserId, ticket_id: null, ticket_version: null, selected_actions: {} }], page: 1, per_page: 25 } };
    expect(decodeCrmServiceMacroUsage(usage)).toBe(usage);
    const masked = original(); delete (masked.data.receipts[0] as { operation?: string }).operation;
    expect(decodeCrmServiceMacroOriginal(masked)).toBe(masked);
    expect(masked.data.receipts[0]).not.toHaveProperty("effect_id"); expect(masked.data.receipts[0]).not.toHaveProperty("actor_id");
  });
  it("refuses unknown/authority fields, duplicate identities and unconfirmed/null/current-head substitutes", () => {
    for (const body of [null, { data: null }, { ...original(), confirmed: true }, { data: { ...original().data, count: 0, receipts: [] } },
      { data: { ...original().data, receipts: [{ id: macroId, version: 1, fields: {}, effect_id: ticketId }] } },
      { data: { ...original().data, receipts: [{ id: ticketId, version: 1, fields: {} }] } }]) expect(() => decodeCrmServiceMacroOriginal(body)).toThrow(TypeError);
    expect(() => decodeCrmServiceMacroUsage({ data: { macro_id: macroId, count: 1, page: 1, per_page: 25, receipts: [{ actor_id: 17 }] } })).toThrow(TypeError);
    expect(() => decodeCrmServiceMacroRender({ data: { ...render, delivered: true } })).toThrow(TypeError);
  });
});

describe("configured ServiceMacro V1 resource, offline only", () => {
  it("exports additive factory and rejects missing/foreign/extra native bindings before I/O", () => {
    const client = sdk(async () => { throw new Error("No dispatch"); });
    expect(client.crmServiceMacros(paths)).toBeInstanceOf(CrmServiceMacrosResource); expect(createCrmServiceMacrosResource(client.http, paths)).toBeInstanceOf(CrmServiceMacrosResource);
    expect(() => client.crmServiceMacros(undefined as never)).toThrow(TypeError);
    expect(() => client.crmServiceMacros({ ...paths, send: "/mail/send" } as never)).toThrow(TypeError);
    expect(() => client.crmServiceMacros({ ...paths, getSaveServiceMacroOriginal: "https://foreign.invalid/read" })).toThrow(TypeError);
    expect(typeof client.crmVerticalPacks).toBe("function"); expect(typeof client.crmMailboxWriters).toBe("function");
  });
  it("sends all four native writes with original raw bytes/key, expected statuses and configured auth/options", async () => {
    const calls: Array<{ method?: string; path: string; wire: unknown; key: string | null }> = []; const seen: string[] = [];
    const originals = [intent("save", null), intent("save", macroId), intent("archive", macroId), intent("apply", macroId)];
    const resource = sdk(async (input, init) => {
      const headers = new Headers(init?.headers); expect(headers.get("Authorization")).toBe("Bearer fact_test_synthetic_macro_A"); expect(headers.get("Content-Type")).toBe("application/json");
      expect(headers.get("X-Active-Profile")).toBe(userId); expect(headers.get("Factuarea-Version")).toBe("2026-06-01");
      const url = new URL(String(input)); expect(url.search).toBe(""); calls.push({ method: init?.method, path: url.pathname, wire: init?.body, key: headers.get("Idempotency-Key") });
      return response(original([1, 4, 5, 4][calls.length - 1]!, ["save", "save", "archive", "apply"].map((action) => `customer_service.${action}_macro`)[calls.length - 1]!), calls.length === 1 ? 201 : 200);
    }, { defaultHeaders: { "idempotency-key": "discard-default", "content-type": "text/plain" } }).crmServiceMacros(paths);
    const config = { headers: { "IDEMPOTENCY-KEY": "discard-config", "X-Active-Profile": userId }, onResponse: (result: { requestId: string | null }) => seen.push(result.requestId!) };
    await resource.saveServiceMacro(originals[0] as never, config); await resource.saveServiceMacro(originals[1] as never, config);
    await resource.archiveServiceMacro(originals[2] as never, config); await resource.applyServiceMacro(originals[3] as never, config);
    expect(calls.map((call) => call.method)).toEqual(["POST", "PATCH", "POST", "POST"]);
    expect(calls.map((call) => call.path)).toEqual(["/v1/crm/service-macros", `/v1/crm/service-macros/${macroId}`, `/v1/crm/service-macros/${macroId}/archive`, `/v1/crm/service-macros/${macroId}/apply`]);
    expect(calls.map((call) => call.wire)).toEqual(originals.map((value) => value.originalWire)); expect(calls.every((call) => call.key === key)).toBe(true); expect(seen).toHaveLength(4);
  });
  it("dispatches valid native Macro bodies larger than the unrelated mailbox 65536 limit unchanged", async () => {
    const wire = JSON.stringify({ ...createBody, body_template: "á".repeat(40000) }); expect(Buffer.byteLength(wire)).toBeGreaterThan(65536);
    const resource = sdk(async (_input, init) => { expect(init?.body).toBe(wire); return response(original(), 201); }).crmServiceMacros(paths);
    await resource.saveServiceMacro(decodeCrmServiceMacroIntent("save", null, key, wire));
  });
  it.each(["save-create", "save-update", "archive", "apply"] as const)("recovers %s by GET header and only optional macro_id, preserving original receipt after later head", async (kind) => {
    const operation = kind.startsWith("save") ? "save" : kind; const target = kind === "save-create" ? null : macroId;
    const value = decodeCrmServiceMacroIntent(operation as "save", target, key, JSON.stringify(operation === "save" ? target === null ? createBody : updateBody : operation === "archive" ? archiveBody : applyBody)); let calls = 0;
    const resource = sdk(async (input, init) => {
      calls++; const url = new URL(String(input)); expect(url.pathname).toBe(`/v1/crm/service-macro-receipts/${operation}`);
      expect([...url.searchParams.keys()]).toEqual(target === null ? [] : ["macro_id"]); expect(url.searchParams.get("macro_id")).toBe(target);
      expect(init?.method).toBe("GET"); expect(init?.body).toBeUndefined(); expect(new Headers(init?.headers).get("Idempotency-Key")).toBe(key);
      return response(original(operation === "save" ? target === null ? 1 : 4 : operation === "archive" ? 5 : 4, `customer_service.${operation}_macro`));
    }).crmServiceMacros(paths);
    const result = operation === "save" ? await resource.getSaveServiceMacroOriginal(value as never) : operation === "archive" ? await resource.getArchiveServiceMacroOriginal(value as never) : await resource.getApplyServiceMacroOriginal(value as never);
    expect(result.data.receipts[0].version).toBe(operation === "archive" ? 5 : kind === "save-create" ? 1 : 4); expect(calls).toBe(1);
  });
  it("keeps lost acknowledgement uncertain with one command and only explicit original GET recovery", async () => {
    const methods: string[] = []; const value = intent("save", null); const resource = sdk(async (_input, init) => {
      methods.push(init!.method!); if (init!.method === "POST") throw new TypeError("Synthetic lost ACK"); return response(original());
    }).crmServiceMacros(paths);
    const error = await resource.saveServiceMacro(value as never).catch((cause: unknown) => cause);
    expect(error).toBeInstanceOf(CrmServiceMacroUnconfirmedWriteError); expect(error).toMatchObject({ originalIntent: value, state: "unconfirmed", idempotencyKey: key }); expect(methods).toEqual(["POST"]);
    await resource.getSaveServiceMacroOriginal((error as CrmServiceMacroUnconfirmedWriteError).originalIntent as never); expect(methods).toEqual(["POST", "GET"]);
  });
  it("keeps native explicit original-unconfirmed409 uncertain while exposing its unchanged cause", async () => {
    let calls = 0; const native = { error: { code: "crm_version_conflict", subcode: "service_macro_original_unconfirmed", message: "Recover the same original" } };
    const resource = sdk(async () => { calls++; return response(native, 409); }).crmServiceMacros(paths);
    const error = await resource.saveServiceMacro(intent("save", null) as never).catch((cause: unknown) => cause);
    expect(error).toBeInstanceOf(CrmServiceMacroUnconfirmedWriteError); expect((error as Error).cause).toMatchObject({ status: 409, subcode: "service_macro_original_unconfirmed", rawResponse: native }); expect(calls).toBe(1);
  });
  it.each([403, 404, 409, 422, 429])("preserves native definitive%s error/subcode/field and never repeats a mutation", async (status) => {
    let calls = 0; const native = { error: { code: "native_macro_error", subcode: "service_macro_conflict", param: "expected_version", message: "Native refusal" } };
    const resource = sdk(async () => { calls++; return response(native, status); }).crmServiceMacros(paths);
    const error = await resource.archiveServiceMacro(intent("archive", macroId) as never).catch((cause: unknown) => cause);
    expect(error).toBeInstanceOf(FactuareaError); expect(error).not.toBeInstanceOf(CrmServiceMacroUnconfirmedWriteError);
    expect(error).toMatchObject({ status, code: "native_macro_error", subcode: "service_macro_conflict", param: "expected_version", rawResponse: native }); expect(calls).toBe(1);
  });
  it.each([409, 503])("preserves readonly recovery%s refusal without inventing null/receipt or automatic retry", async (status) => {
    let calls = 0; const resource = sdk(async () => { calls++; return response({ error: { code: "crm_version_conflict", subcode: "service_macro_original_unconfirmed", message: "Unconfirmed" } }, status); }).crmServiceMacros(paths);
    const error = await resource.getSaveServiceMacroOriginal(intent("save", null) as never).catch((cause: unknown) => cause);
    expect(error).toBeInstanceOf(FactuareaError); expect(error).not.toBeInstanceOf(CrmServiceMacroUnconfirmedWriteError); expect(error).toMatchObject({ status }); expect(calls).toBe(1);
  });
  it("withholds successful HTTP current-head/wrong-operation projections as uncertain and keeps original intent", async () => {
    const value = intent("archive", macroId); const variants = [original(10, "customer_service.archive_macro"), original(5, "customer_service.apply_macro"), { data: null }]; let calls = 0;
    const resource = sdk(async () => response(variants[calls++])).crmServiceMacros(paths);
    for (const _ of variants) await expect(resource.archiveServiceMacro(value as never)).rejects.toMatchObject({ state: "unconfirmed", originalIntent: value }); expect(calls).toBe(3);
  });
  it("paginates actual number-page list and usage envelopes with omission/null masks intact", async () => {
    const seen: string[] = []; const resource = sdk(async (input, init) => {
      const url = new URL(String(input)); seen.push(url.pathname); expect(init?.method).toBe("GET"); expect(new Headers(init?.headers).get("Idempotency-Key")).toBeNull();
      const page = Number(url.searchParams.get("page") ?? "1"); const per_page = Number(url.searchParams.get("per_page") ?? "25");
      return url.pathname.endsWith("/usage") ? response({ data: { macro_id: macroId, count: 2, receipts: [{ counted: page === 1, ticket_id: null }], page, per_page } })
        : response({ data: { items: [{ id: page === 1 ? macroId : teamId, version: page, fields: { team_id: null } }], total: 2, page, per_page } });
    }, { defaultHeaders: { "Idempotency-Key": "discard-default" } }).crmServiceMacros(paths);
    const first = await resource.listServiceMacros({ per_page: 1 }); expect(first).toBeInstanceOf(CrmServiceMacroPage);
    expect((await first.toArray()).map((row) => row.id)).toEqual([macroId, teamId]);
    const usage = await resource.getServiceMacroUsage(macroId, { per_page: 1 }); expect(await usage.toArray()).toEqual([{ counted: true, ticket_id: null }, { counted: false, ticket_id: null }]);
    expect(seen).toHaveLength(4);
  });
  it("renders by pure POST with no original key/effect and binds exact selector without composing send", async () => {
    let calls = 0; const resource = sdk(async (input, init) => { calls++; expect(new URL(String(input)).pathname).toBe(`/v1/crm/service-macros/${macroId}/render`);
      expect(init?.method).toBe("POST"); expect(JSON.parse(init!.body as string)).toEqual(renderBody); expect(new Headers(init?.headers).get("Idempotency-Key")).toBeNull(); return response({ data: render });
    }, { defaultHeaders: { "IDEMPOTENCY-KEY": "discard-default" } }).crmServiceMacros(paths);
    expect((await resource.renderServiceMacro(macroId, renderBody)).data.requires_review).toBe(true); expect(calls).toBe(1); expect(resource).not.toHaveProperty("send");
  });
  it("rejects invalid route/page/request/operation before any I/O and withholds wrong response page/selector", async () => {
    let calls = 0; const resource = sdk(async () => { calls++; return response({ data: { ...render, macro_version: 9 } }); }).crmServiceMacros(paths);
    await expect(resource.getServiceMacroUsage(userId)).rejects.toThrow(TypeError); await expect(resource.listServiceMacros({ page: 0 })).rejects.toThrow(TypeError);
    await expect(resource.renderServiceMacro(macroId, { ...renderBody, company_id: macroId } as never)).rejects.toThrow(TypeError);
    await expect(resource.getArchiveServiceMacroOriginal(intent("save", macroId) as never)).rejects.toThrow(TypeError); expect(calls).toBe(0);
    await expect(resource.renderServiceMacro(macroId, renderBody)).rejects.toMatchObject({ code: "crm_service_macro_projection_unreadable" }); expect(calls).toBe(1);
  });
  it("snapshots mutable original intent before awaiting auth/network", async () => {
    const value = { ...intent("apply", macroId) }; let enter!: () => void; let release!: () => void;
    const entered = new Promise<void>((resolve) => { enter = resolve; }); const pending = new Promise<void>((resolve) => { release = resolve; }); const wire = value.originalWire;
    const resource = sdk(async (_input, init) => { enter(); await pending; expect(init?.body).toBe(wire); expect(new Headers(init?.headers).get("Idempotency-Key")).toBe(key); return response(original(4, "customer_service.apply_macro")); }).crmServiceMacros(paths);
    const result = resource.applyServiceMacro(value as CrmServiceMacroApplyIntent); await entered; value.originalKey = "different"; value.originalWire = "{}"; value.targetId = teamId; release(); expect((await result).data.macro_id).toBe(macroId);
  });
  it("cancels before dispatch without uncertainty and keeps postdispatch abort unconfirmed", async () => {
    const pre = new AbortController(); pre.abort(); let calls = 0;
    const resource = sdk(async () => { calls++; throw new TypeError("No ACK"); }).crmServiceMacros(paths);
    const error = await resource.saveServiceMacro(intent("save", null) as never, { signal: pre.signal }).catch((cause: unknown) => cause);
    expect(error).toBeInstanceOf(ConnectionError); expect(error).not.toBeInstanceOf(CrmServiceMacroUnconfirmedWriteError); expect(calls).toBe(0);
    const abort = new AbortController(); const pending = sdk(async (_input, init) => { calls++; abort.abort(); throw init!.signal!.reason; }).crmServiceMacros(paths);
    await expect(pending.saveServiceMacro(intent("save", null) as never, { signal: abort.signal })).rejects.toMatchObject({ state: "unconfirmed" }); expect(calls).toBe(1);
  });
  it("keeps authentication, original receipts and tenant context isolated across configured clients", async () => {
    const tokens: string[] = []; const fetch: typeof globalThis.fetch = async (_input, init) => { tokens.push(new Headers(init?.headers).get("Authorization")!); return response(original()); };
    const a = sdk(fetch).crmServiceMacros(paths), b = sdk(fetch, { apiKey: "fact_test_synthetic_macro_B" }).crmServiceMacros(paths);
    await a.getSaveServiceMacroOriginal(intent("save", null) as never); await b.getSaveServiceMacroOriginal(intent("save", null) as never);
    expect(tokens).toEqual(["Bearer fact_test_synthetic_macro_A", "Bearer fact_test_synthetic_macro_B"]);
  });
});

// Compile-time boundary: no provider send, payload principal or omitted confirmation type is advertised.
const typedCreate: CrmServiceMacroCreateBody = createBody;
const typedApply: CrmServiceMacroApplyBody = applyBody;
const typedIntent: CrmServiceMacroIntent = decodeCrmServiceMacroIntent("apply", macroId, key, JSON.stringify(typedApply));
void typedCreate; void typedIntent;
function compileOnly(resource: CrmServiceMacrosResource): void {
  // @ts-expect-error Native create confirmation cannot be omitted.
  const unconfirmed: CrmServiceMacroCreateBody = { ...createBody, confirmed: undefined };
  // @ts-expect-error The SDK does not advertise provider delivery as Macro rendering.
  resource.send(macroId);
  // @ts-expect-error Native public principals cannot be supplied in a render body.
  resource.renderServiceMacro(macroId, { ...renderBody, company_id: macroId });
  // @ts-expect-error Archive recovery does not accept a save operation intent.
  resource.getArchiveServiceMacroOriginal(decodeCrmServiceMacroIntent("save", null, key, JSON.stringify(createBody)));
  void unconfirmed;
}
void compileOnly;
