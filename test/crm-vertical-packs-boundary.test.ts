import { describe, expect, it } from "vitest";
import { ConnectionError, CrmVerticalPackUnconfirmedWriteError, CrmVerticalPacksResource, Factuarea, FactuareaError, ServerError, createCrmVerticalPacksResource,
  decodeCrmVerticalPackIntent, decodeCrmVerticalPackCatalog, decodeCrmVerticalPackPlan, decodeCrmVerticalPackConflicts, decodeCrmVerticalPackReceipt } from "../src/index.js";
import type { CrmVerticalPacksV1Paths } from "../src/index.js";

const packId = "018f1111-2222-7333-8444-111111111111";
const planId = "018f1111-2222-7333-8444-222222222222";
const installationId = "018f1111-2222-7333-8444-333333333333";
const receiptId = "018f1111-2222-7333-8444-444444444444";
const itemId = "018f1111-2222-7333-8444-555555555555";
const conflictId = "018f1111-2222-7333-8444-666666666666";
const targetId = "018f1111-2222-7333-8444-777777777777";
const undoReceiptId = "018f1111-2222-7333-8444-888888888888";
const actorId = "550e8400-e29b-41d4-a716-446655440000";
const key = "b".repeat(64); const previewHash = "a".repeat(64); const token = "opaque-native-token+/=original-secret";
const translated = { es: "Campo actual", en: "Current field", ca: "Camp actual" };
const add = { id: itemId, kind: "field", machine_key: "lead.native_key", label: translated, decision: "add", current_version: null, allowed_resolutions: [], current_display: null, proposed_display: translated };
const conflict = { ...add, id: conflictId, kind: "label", machine_key: "label.lead", decision: "conflict", current_version: 4, allowed_resolutions: ["keep", "replace"], current_display: translated };
const catalog = { items: [{ id: packId, version: 1, sector: "real_estate", title: translated, description: translated, supports_demo: true, installation: null }], next_cursor: null };
const plan = { id: planId, version: 1, pack_id: packId, pack_version: 1, preview_hash: previewHash, plan_token: token, authorization_version: "native-current-c7", sandbox: true, demo_selected: false,
  items: [add, conflict], blocking_codes: [] };
const conflicts = { items: [conflict], preview_hash: previewHash };
const applyBody = { expected_plan_version: 1, preview_hash: previewHash, plan_token: token, resolutions: [{ item_id: conflictId, resolution: "keep" }], demo_selected: false, confirmed: true };
const undoBody = { expected_installation_version: 23, original_receipt_id: receiptId, confirmed: true };
const applyWire = ' \n' + JSON.stringify(applyBody).replace('"plan_token"', '"plan_tok\\u0065n"') + '\t\r\n';
const undoWire = ` { "expected_installation_version" : 23, "original_receipt_id" : "${receiptId}", "confirmed" : true }\n`;
const applied = { id: receiptId, operation: "apply", target_id: planId, confirmed: true, installation: { id: installationId, version: 23, receipt_id: receiptId, pack_id: packId, pack_version: 1 },
  items: [{ item_id: itemId, outcome: "added", target_id: targetId, version: 1 }, { item_id: conflictId, outcome: "kept", target_id: null, version: null }] };
const undone = { ...applied, id: undoReceiptId, operation: "undo", target_id: installationId, installation: { ...applied.installation, version: 27, receipt_id: undoReceiptId },
  items: [{ item_id: itemId, outcome: "undone", target_id: null, version: null }] };
const paths: CrmVerticalPacksV1Paths = { listCrmPacks: "/crm/configuration/packs", previewCrmPack: (id) => `/crm/configuration/packs/${id}/preview`,
  getCrmPackPlan: (id) => `/crm/configuration/pack-plans/${id}/read`, getCrmPackConflicts: (id) => `/crm/configuration/pack-plans/${id}/conflicts`,
  applyCrmPack: (id) => `/crm/configuration/pack-plans/${id}/apply`, undoCrmPackInstallation: (id) => `/crm/configuration/pack-installations/${id}/undo`,
  getOriginalCrmPackReceipt: "/crm/configuration/pack-original-receipts/read" };
function sdk(fetch: typeof globalThis.fetch, extra: Partial<ConstructorParameters<typeof Factuarea>[0]> = {}): Factuarea {
  return new Factuarea({ apiKey: "fact_test_synthetic_vertical_packs", baseUrl: "https://sdk-boundary.invalid/v1", maxRetries: 8, timeout: 1000, fetch, ...extra });
}
function response(data: unknown, status = 200): Response { return Response.json({ data }, { status, headers: { "X-Request-Id": "native-pack-original", "Cache-Control": "private, no-store" } }); }

describe("closed native VerticalPacks V1 codecs", () => {
  it("preserves original raw JSON/key/identity and explicit confirmation without generating or translating business fields", () => {
    const apply = decodeCrmVerticalPackIntent("apply", planId, key, applyWire);
    expect(apply.originalWire).toBe(applyWire); expect(apply.originalKey).toBe(key); expect(Object.isFrozen(apply)).toBe(true);
    expect(JSON.parse(apply.originalWire)).toEqual(applyBody); expect(JSON.parse(apply.originalWire)).not.toHaveProperty("effect_id");
    expect(decodeCrmVerticalPackIntent("undo", installationId, key, undoWire).originalWire).toBe(undoWire);
  });
  it("requires closed public wire fields, native safe CAS/booleans/key and unique explicit resolutions", () => {
    const invalid = [{ ...applyBody, confirmed: false }, { ...applyBody, confirmed: "true" }, { ...applyBody, demo_selected: 0 }, { ...applyBody, company_id: 1 },
      { ...applyBody, effect_id: receiptId }, { ...applyBody, expected_plan_version: Number.MAX_SAFE_INTEGER + 1 }, { ...applyBody, plan_token: null },
      { ...applyBody, preview_hash: "A".repeat(64) }, { ...applyBody, resolutions: [{ item_uuid: conflictId, resolution: "keep" }] },
      { ...applyBody, resolutions: [{ item_id: conflictId, resolution: "merge" }] }, { ...applyBody, resolutions: [applyBody.resolutions[0], applyBody.resolutions[0]] }];
    for (const body of invalid) expect(() => decodeCrmVerticalPackIntent("apply", planId, key, JSON.stringify(body))).toThrow(TypeError);
    for (const bad of ["", "b".repeat(63), "B".repeat(64), actorId, "b".repeat(65)]) expect(() => decodeCrmVerticalPackIntent("apply", planId, bad, applyWire)).toThrow(TypeError);
    expect(() => decodeCrmVerticalPackIntent("apply", actorId, key, applyWire)).toThrow(TypeError);
    for (const cas of ["1.0", "1e0", '"1"', "null"]) expect(() => decodeCrmVerticalPackIntent("apply", planId, key, JSON.stringify(applyBody).replace('"expected_plan_version":1', '"expected_plan_version":' + cas))).toThrow(TypeError);
    expect(() => decodeCrmVerticalPackIntent("undo", installationId, key, JSON.stringify({ ...undoBody, original_receipt_uuid: receiptId }))).toThrow(TypeError);
    expect(() => decodeCrmVerticalPackIntent("undo", installationId, key, JSON.stringify({ ...undoBody, original_receipt_id: null }))).toThrow(TypeError);
  });
  it("enforces exact UTF8 wire65536/token32768 bounds without normalizing whitespace or encrypted selectors", () => {
    const exact = applyWire + " ".repeat(65536 - Buffer.byteLength(applyWire));
    expect(decodeCrmVerticalPackIntent("apply", planId, key, exact).originalWire).toBe(exact);
    expect(() => decodeCrmVerticalPackIntent("apply", planId, key, exact + " ")).toThrow(TypeError);
    const tokenBody = { ...applyBody, plan_token: "é".repeat(16384) };
    expect(decodeCrmVerticalPackIntent("apply", planId, key, JSON.stringify(tokenBody)).originalWire).toBe(JSON.stringify(tokenBody));
    expect(() => decodeCrmVerticalPackIntent("apply", planId, key, JSON.stringify({ ...tokenBody, plan_token: tokenBody.plan_token + "é" }))).toThrow(TypeError);
    expect(() => decodeCrmVerticalPackIntent("apply", planId, key, applyWire + "\uD800")).toThrow(TypeError);
  });
  it("decodes catalog/plan/conflicts exact public IDs/translations/current nulls and keeps machine names unchanged", () => {
    expect(decodeCrmVerticalPackCatalog({ data: catalog }).data.next_cursor).toBeNull();
    const result = decodeCrmVerticalPackPlan({ data: plan }); expect(result.data.items[0]!.machine_key).toBe("lead.native_key");
    expect(result.data.items[0]!.current_display).toBeNull(); expect(result.data.items[1]!.allowed_resolutions).toEqual(["keep", "replace"]);
    expect(result.data.plan_token).toBe(token); expect(result.data).not.toHaveProperty("source_revision");
    expect(decodeCrmVerticalPackConflicts({ data: conflicts }).data.items).toEqual([conflict]);
  });
  it("preserves explicit demo support and actual current installation/null without treating either as consent or original recovery", () => {
    const absent = decodeCrmVerticalPackCatalog({ data: catalog }).data.items[0]!;
    expect(absent.supports_demo).toBe(true); expect(absent.installation).toBeNull(); expect(absent).not.toHaveProperty("demo_selected");
    const installed = { ...catalog.items[0], supports_demo: false, installation: applied.installation };
    const result = decodeCrmVerticalPackCatalog({ data: { ...catalog, items: [installed] } }).data.items[0]!;
    expect(result.supports_demo).toBe(false); expect(result.installation).toEqual(applied.installation);
    expect(result.installation!.version).toBe(23); expect(result.installation).not.toHaveProperty("state");
  });
  it("rejects missing/masked demo or installation facts, private aliases, unsafe CAS and installation from another pack", () => {
    const item = catalog.items[0]!; const { supports_demo: _demo, ...missingDemo } = item; const { installation: _install, ...missingInstall } = item;
    const invalid = [missingDemo, missingInstall, { ...item, supports_demo: null }, { ...item, supports_demo: 1 }, { ...item, supports_demo: "false" },
      { ...item, installation: {} }, { ...item, installation: { ...applied.installation, receipt_id: null } },
      { ...item, installation: { ...applied.installation, pack_id: planId } }, { ...item, installation: { ...applied.installation, version: 0 } },
      { ...item, installation: { ...applied.installation, pack_version: Number.MAX_SAFE_INTEGER + 1 } },
      { ...item, installation: { ...applied.installation, receipt_uuid: receiptId } }, { ...item, available: true }];
    for (const row of invalid) expect(() => decodeCrmVerticalPackCatalog({ data: { ...catalog, items: [row] } })).toThrow(TypeError);
  });
  it("rejects unknown/missing projection fields, aliases, grants, masked defaults, changed selectors and invalid plan choices", () => {
    const invalid = [{ ...plan, uuid: planId }, { ...plan, available: true }, { ...plan, sandbox: false, demo_selected: true },
      { ...plan, items: [{ ...add, current_version: 0 }] }, { ...plan, items: [{ ...add, current_display: translated }] },
      { ...plan, items: [{ ...conflict, allowed_resolutions: [] }] }, { ...plan, items: [{ ...add, machine_key: "Campo traducido" }] },
      { ...plan, items: [{ ...add, proposed_display: { es: "ok", en: "ok" } }] }, { ...plan, items: [add, add] }];
    for (const data of invalid) expect(() => decodeCrmVerticalPackPlan({ data })).toThrow(TypeError);
    expect(() => decodeCrmVerticalPackCatalog({ data: { ...catalog, next_cursor: "invented" } })).toThrow(TypeError);
    expect(() => decodeCrmVerticalPackConflicts({ data: { ...conflicts, items: [add] } })).toThrow(TypeError);
    expect(() => decodeCrmVerticalPackPlan({ data: { ...plan, items: [{ ...add, label: { ...translated, es: "x".repeat(2001) } }] } })).toThrow(TypeError);
  });
  it("distinguishes200originalabsence from server confirmed receipts and retains paired null/nativeitem outcomes", () => {
    expect(decodeCrmVerticalPackReceipt({ data: null })).toEqual({ data: null });
    expect(decodeCrmVerticalPackReceipt({ data: applied }).data).toEqual(applied);
    expect(decodeCrmVerticalPackReceipt({ data: undone }).data).toEqual(undone);
    const invalid = [{ ...applied, confirmed: false }, { ...applied, items: [{ ...applied.items[0], version: null }] }, { ...applied, items: [{ ...applied.items[0], target_id: null }] },
      { ...applied, items: [{ ...applied.items[0], outcome: "queued" }] }, { ...applied, installation: { ...applied.installation, version: Number.MAX_SAFE_INTEGER + 1 } },
      { ...applied, target_uuid: planId }, { ...applied, items: [applied.items[0], applied.items[0]] }];
    for (const data of invalid) expect(() => decodeCrmVerticalPackReceipt({ data })).toThrow(TypeError);
  });
});

describe("configured native VerticalPacks SDK offline boundary", () => {
  it("exports the real required-path factory while preserving prior factories and no activation/default/endpoints", () => {
    const client = sdk(async () => { throw new Error("No dispatch"); }); expect(client.crmVerticalPacks(paths)).toBeInstanceOf(CrmVerticalPacksResource);
    expect(createCrmVerticalPacksResource(client.http, paths)).toBeInstanceOf(CrmVerticalPacksResource);
    expect(() => client.crmVerticalPacks(undefined as never)).toThrow(TypeError);
    expect(() => client.crmVerticalPacks({ ...paths, getOriginalCrmPackReceipt: "https://foreign.invalid/original" })).toThrow(TypeError);
    expect(() => client.crmVerticalPacks({ ...paths, activate: "/activate" } as never)).toThrow(TypeError);
    expect(typeof client.crmServiceInsights).toBe("function"); expect(typeof client.crmMailboxWriters).toBe("function"); expect(typeof client.crmSequences).toBe("function");
    expect(client.crmVerticalPacks(paths)).not.toHaveProperty("activate");
  });
  it("uses oneGET and four queryPOST on SAME auth/options/hooks, no key/tokenURL/autoretry or private business DTO", async () => {
    const calls: string[] = []; const hooks: string[] = [];
    const resource = sdk(async (input, init) => {
      const url = new URL(String(input)); const h = new Headers(init?.headers); calls.push(init!.method! + " " + url.pathname);
      expect(h.get("Authorization")).toBe("Bearer fact_test_synthetic_vertical_packs"); expect(h.get("Factuarea-Version")).toBe("2026-06-01"); expect(h.get("X-Active-Profile")).toBe(actorId);
      expect(h.get("Idempotency-Key")).toBeNull(); expect(url.toString()).not.toContain(token); expect(url.toString()).not.toContain(key);
      if (init?.method === "GET") { expect(url.searchParams.get("sector")).toBe("real_estate"); expect(init.body).toBeUndefined(); return response(catalog); }
      expect(url.search).toBe(""); expect(h.get("Content-Type")).toBe("application/json"); const body = JSON.parse(String(init?.body));
      if (url.pathname.endsWith("/preview")) { expect(body).toEqual({ pack_version: 1, demo_selected: false }); return response(plan); }
      if (url.pathname.endsWith("/conflicts")) { expect(body).toEqual({ plan_token: token }); return response(conflicts); }
      if (url.pathname.includes("pack-original-receipts")) { expect(body).toEqual({ operation: "apply", target_id: planId, original_key: key, original_wire: applyWire }); return response(applied); }
      expect(body).toEqual({ plan_token: token }); return response(plan);
    }, { defaultHeaders: { "Idempotency-Key": "discard-default", "content-type": "text/plain" } }).crmVerticalPacks(paths);
    const config = { headers: { "IDEMPOTENCY-KEY": "discard-request", "X-Active-Profile": actorId }, onResponse: (r: { requestId: string | null }) => hooks.push(r.requestId!) };
    await resource.listCrmPacks({ sector: "real_estate" }, config); await resource.previewCrmPack(packId, { pack_version: 1, demo_selected: false }, config);
    await resource.getCrmPackPlan(planId, { plan_token: token }, config); await resource.getCrmPackConflicts(planId, { plan_token: token }, config);
    await resource.getOriginalCrmPackReceipt(decodeCrmVerticalPackIntent("apply", planId, key, applyWire), config);
    expect(calls).toEqual(["GET /v1/crm/configuration/packs", `POST /v1/crm/configuration/packs/${packId}/preview`, `POST /v1/crm/configuration/pack-plans/${planId}/read`,
      `POST /v1/crm/configuration/pack-plans/${planId}/conflicts`, "POST /v1/crm/configuration/pack-original-receipts/read"]); expect(hooks).toEqual(Array(5).fill("native-pack-original"));
  });
  it("reads changed current catalog installation facts with no recovery dispatch, grants, defaults or cached replacement", async () => {
    let calls = 0; const current = { ...catalog, items: [{ ...catalog.items[0], supports_demo: false, installation: applied.installation }] };
    const resource = sdk(async (_input, init) => {
      expect(init?.method).toBe("GET"); expect(init?.body).toBeUndefined(); expect(new Headers(init?.headers).get("Idempotency-Key")).toBeNull();
      return response(calls++ === 0 ? catalog : current);
    }).crmVerticalPacks(paths);
    expect((await resource.listCrmPacks()).data.items[0]!.installation).toBeNull();
    const observed = (await resource.listCrmPacks()).data.items[0]!; expect(observed.installation).toEqual(applied.installation); expect(observed.supports_demo).toBe(false);
    expect(calls).toBe(2);
  });
  it("sends native apply/undo byte-exact rawJSON with original64hex key and200receipt, never202/head/UUID allocation", async () => {
    const calls: unknown[] = [];
    const resource = sdk(async (input, init) => {
      const url = new URL(String(input)); const h = new Headers(init?.headers); expect(init?.method).toBe("POST"); expect(url.search).toBe("");
      expect(h.get("Authorization")).toBe("Bearer fact_test_synthetic_vertical_packs"); expect(h.get("Content-Type")).toBe("application/json");
      calls.push({ path: url.pathname, body: init?.body, key: h.get("Idempotency-Key") }); return response(url.pathname.endsWith("/apply") ? applied : undone);
    }, { defaultHeaders: { "IDEMPOTENCY-KEY": "discard-default" } }).crmVerticalPacks(paths);
    expect((await resource.applyCrmPack(decodeCrmVerticalPackIntent("apply", planId, key, applyWire))).data.installation.version).toBe(23);
    expect((await resource.undoCrmPackInstallation(decodeCrmVerticalPackIntent("undo", installationId, key, undoWire))).data.installation.version).toBe(27);
    expect(calls).toEqual([{ path: `/v1/crm/configuration/pack-plans/${planId}/apply`, body: applyWire, key }, { path: `/v1/crm/configuration/pack-installations/${installationId}/undo`, body: undoWire, key }]);
  });
  it.each(["apply", "undo"] as const)("retains lost-ACK %s intent and only runs an explicit original query, no autoresend/autorecovery", async (operation) => {
    const target = operation === "apply" ? planId : installationId; const raw = operation === "apply" ? applyWire : undoWire; const calls: string[] = [];
    const resource = sdk(async (input, init) => { const url = new URL(String(input)); calls.push(url.pathname);
      if (!url.pathname.includes("pack-original-receipts")) throw new TypeError("Synthetic lost acknowledgement");
      expect(new Headers(init?.headers).get("Idempotency-Key")).toBeNull(); expect(JSON.parse(String(init?.body)).original_wire).toBe(raw);
      return response(operation === "apply" ? applied : undone);
    }).crmVerticalPacks(paths);
    const intent = decodeCrmVerticalPackIntent(operation, target, key, raw);
    const error = await (operation === "apply" ? resource.applyCrmPack(intent as never) : resource.undoCrmPackInstallation(intent as never)).catch((cause: unknown) => cause);
    expect(error).toBeInstanceOf(CrmVerticalPackUnconfirmedWriteError); expect(error).toMatchObject({ originalIntent: intent, idempotencyKey: key, state: "unconfirmed" }); expect(calls).toHaveLength(1);
    expect((await resource.getOriginalCrmPackReceipt((error as CrmVerticalPackUnconfirmedWriteError).originalIntent)).data!.operation).toBe(operation); expect(calls).toHaveLength(2);
  });
  it("preserves200data:null as absence without dispatch/allocating/beginning another intent", async () => {
    let calls = 0; const resource = sdk(async (_input, init) => { calls++; expect(new Headers(init?.headers).get("Idempotency-Key")).toBeNull(); return response(null); }).crmVerticalPacks(paths);
    expect(await resource.getOriginalCrmPackReceipt(decodeCrmVerticalPackIntent("apply", planId, key, applyWire))).toEqual({ data: null }); expect(calls).toBe(1);
  });
  it("supports native recovery wrapper beyond core helper65536 while retaining inner original65536 bytes and no headerkey", async () => {
    const raw = applyWire + "\t".repeat(65536 - Buffer.byteLength(applyWire)); let calls = 0;
    const resource = sdk(async (_input, init) => {
      calls++; expect(Buffer.byteLength(String(init?.body))).toBeGreaterThan(65536); expect(Buffer.byteLength(String(init?.body))).toBeLessThanOrEqual(262144);
      const parsed = JSON.parse(String(init?.body)); expect(parsed.original_wire).toBe(raw); expect(Buffer.byteLength(parsed.original_wire)).toBe(65536);
      expect(new Headers(init?.headers).get("Idempotency-Key")).toBeNull(); return response(applied);
    }).crmVerticalPacks(paths);
    expect((await resource.getOriginalCrmPackReceipt(decodeCrmVerticalPackIntent("apply", planId, key, raw))).data!.id).toBe(receiptId); expect(calls).toBe(1);
  });
  it("snapshots original caller bytes/target/key and query token before waiting for network", async () => {
    const mutable = { operation: "apply" as const, targetId: planId, originalKey: key, originalWire: applyWire }; let enter!: () => void; let release!: () => void;
    const entered = new Promise<void>((resolve) => { enter = resolve; }); const pending = new Promise<void>((resolve) => { release = resolve; });
    const resource = sdk(async (_input, init) => { enter(); await pending; expect(init?.body).toBe(applyWire); expect(new Headers(init?.headers).get("Idempotency-Key")).toBe(key); return response(applied); }).crmVerticalPacks(paths);
    const reading = resource.applyCrmPack(mutable); await entered; mutable.targetId = installationId; mutable.originalKey = "c".repeat(64); mutable.originalWire = undoWire; release();
    expect((await reading).data.target_id).toBe(planId);
  });
  it.each([403, 409, 422, 429])("preserves native %s refusal/field/conflict without retry or successful fake receipts", async (status) => {
    let calls = 0; const native = { error: { code: "native_pack_refusal", subcode: "current_plan_changed", param: "preview_hash", message: "Native refusal" } };
    const resource = sdk(async () => { calls++; return Response.json(native, { status, headers: { "Retry-After": "0", "X-Request-Id": "native-refusal" } }); }).crmVerticalPacks(paths);
    const error = await resource.applyCrmPack(decodeCrmVerticalPackIntent("apply", planId, key, applyWire)).catch((cause: unknown) => cause);
    expect(error).toBeInstanceOf(FactuareaError); expect(error).not.toBeInstanceOf(CrmVerticalPackUnconfirmedWriteError);
    expect(error).toMatchObject({ status, code: "native_pack_refusal", subcode: "current_plan_changed", param: "preview_hash", rawResponse: native, requestId: "native-refusal" }); expect(calls).toBe(1);
  });
  it("marks native503 mutation uncertain with retainedcause, while readonly503 remains error and all four queries forbid retries", async () => {
    let calls = 0; const resource = sdk(async () => { calls++; return Response.json({ error: { code: "native_producer_unavailable", message: "Unavailable" } }, { status: 503, headers: { "Retry-After": "0" } }); }).crmVerticalPacks(paths);
    const error = await resource.applyCrmPack(decodeCrmVerticalPackIntent("apply", planId, key, applyWire)).catch((cause: unknown) => cause);
    expect(error).toBeInstanceOf(CrmVerticalPackUnconfirmedWriteError); expect((error as Error).cause).toBeInstanceOf(ServerError);
    for (const operation of [() => resource.previewCrmPack(packId, { pack_version: 1, demo_selected: false }), () => resource.getCrmPackPlan(planId, { plan_token: token }),
      () => resource.getCrmPackConflicts(planId, { plan_token: token }), () => resource.getOriginalCrmPackReceipt(decodeCrmVerticalPackIntent("apply", planId, key, applyWire))]) {
      const failure = await operation().catch((cause: unknown) => cause); expect(failure).toBeInstanceOf(ServerError); expect(failure).not.toBeInstanceOf(CrmVerticalPackUnconfirmedWriteError);
    }
    expect(calls).toBe(5);
  });
  it("never accepts202/null/wrong target/operation as mutation confirmation, nor mismatched recovery as original", async () => {
    const variants: Array<[unknown, number]> = [[applied, 202], [null, 200], [{ ...applied, target_id: installationId }, 200], [{ ...applied, operation: "undo" }, 200]];
    let calls = 0; const resource = sdk(async () => { const [data, status] = variants[calls++]!; return response(data, status); }).crmVerticalPacks(paths);
    for (const _ of variants) await expect(resource.applyCrmPack(decodeCrmVerticalPackIntent("apply", planId, key, applyWire))).rejects.toBeInstanceOf(CrmVerticalPackUnconfirmedWriteError); expect(calls).toBe(4);
    const wrong = sdk(async () => response({ ...undone, installation: { ...undone.installation, id: packId } })).crmVerticalPacks(paths);
    await expect(wrong.getOriginalCrmPackReceipt(decodeCrmVerticalPackIntent("undo", installationId, key, undoWire))).rejects.toMatchObject({ code: "crm_vertical_packs_projection_unreadable" });
  });
  it("rejects preview selection mismatch and original plan token refresh/identity drift instead of repreviewing", async () => {
    const variants = [{ ...plan, pack_id: installationId }, { ...plan, pack_version: 2 }, { ...plan, demo_selected: true }];
    let calls = 0; const resource = sdk(async () => response(variants[calls++])).crmVerticalPacks(paths);
    for (const _ of variants) await expect(resource.previewCrmPack(packId, { pack_version: 1, demo_selected: false })).rejects.toMatchObject({ code: "crm_vertical_packs_projection_unreadable" });
    const changed = sdk(async () => response({ ...plan, plan_token: "refreshed-fake-token" })).crmVerticalPacks(paths);
    await expect(changed.getCrmPackPlan(planId, { plan_token: token })).rejects.toMatchObject({ code: "crm_vertical_packs_projection_unreadable" }); expect(calls).toBe(3);
  });
  it("retains native catalog rejection of nonnull cursor and does not invent pagination/results", async () => {
    let calls = 0; const resource = sdk(async (input) => { calls++; expect(new URL(String(input)).searchParams.get("cursor")).toBe("original-cursor");
      return Response.json({ error: { code: "native_invalid_sector", param: "sector", message: "Current catalog has one page" } }, { status: 422 }); }).crmVerticalPacks(paths);
    await expect(resource.listCrmPacks({ cursor: "original-cursor" })).rejects.toMatchObject({ status: 422, code: "native_invalid_sector" }); expect(calls).toBe(1);
  });
  it("rejects wrong mode/fields/key/body/paths before dispatch and keeps pre-abort separate from uncertain effects", async () => {
    let calls = 0; const client = sdk(async () => { calls++; throw new Error("No dispatch"); }); const resource = client.crmVerticalPacks(paths);
    await expect(resource.applyCrmPack(decodeCrmVerticalPackIntent("undo", installationId, key, undoWire) as never)).rejects.toThrow(TypeError);
    await expect(resource.undoCrmPackInstallation(decodeCrmVerticalPackIntent("apply", planId, key, applyWire) as never)).rejects.toThrow(TypeError);
    await expect(resource.previewCrmPack(packId, { pack_version: 1, demo_selected: true, confirmed: true } as never)).rejects.toThrow(TypeError);
    await expect(resource.getCrmPackPlan(planId, { plan_token: token, authorization_version: "grant" } as never)).rejects.toThrow(TypeError);
    const bad = client.crmVerticalPacks({ ...paths, getCrmPackPlan: () => "/crm/configuration/pack-plans/read?plan_token=secret" });
    await expect(bad.getCrmPackPlan(planId, { plan_token: token })).rejects.toThrow(TypeError);
    const abort = new AbortController(); abort.abort("before dispatch");
    const error = await resource.applyCrmPack(decodeCrmVerticalPackIntent("apply", planId, key, applyWire), { signal: abort.signal }).catch((cause: unknown) => cause);
    expect(error).toBeInstanceOf(ConnectionError); expect(error).not.toBeInstanceOf(CrmVerticalPackUnconfirmedWriteError); expect(calls).toBe(0);
  });
});
