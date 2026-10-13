import { describe, expect, it } from "vitest";
import { decodeCrmSequenceList, decodeCrmSequenceOriginal, decodeCrmSequenceOriginalWire } from "../src/resources/crm-sequences.js";
import { AuthenticationError, ConnectionError, ConflictError, CrmSequenceControlUnconfirmedError, CrmSequenceUnconfirmedWriteError, CrmSequencesResource, Factuarea, ValidationError, createCrmSequencesResource } from "../src/index.js";
import type { CrmSequenceV1Paths } from "../src/index.js";

const sequenceId = "018f1111-2222-7333-8444-555555555555";
const subjectId = "018f1111-2222-7333-8444-666666666666";
const userId = "550e8400-e29b-41d4-a716-446655440000";
const key = "original-opaque-key-without-entity-identity";
const definition = { timezone: "Europe/Madrid", ambiguous_offset: "earlier", allowed_windows: [{ weekday: 1, start_minute: 540, end_minute: 1020 }],
  steps: [{ type: "draft", wait_seconds: null, recipe_id: subjectId }], stop_on_closure: true, purpose: "commercial_follow_up", channel: "email" };

describe("native v1 sequence codecs", () => {
  it("retains exact original wire and opaque key while distinguishing absent stop conditions from explicit empty authoring", () => {
    const wire = ` { "definition" : ${JSON.stringify(definition)}, "expected_version" : 0 }\n`;
    const original = decodeCrmSequenceOriginalWire("save", null, key, wire);
    expect(original.originalWire).toBe(wire);
    expect(original.originalKey).toBe(key);
    expect(original.targetId).toBeNull();
    expect(Object.isFrozen(original)).toBe(true);
    expect(JSON.parse(original.originalWire).definition).not.toHaveProperty("stop_conditions");
    const explicit = decodeCrmSequenceOriginalWire("save", null, key, JSON.stringify({ expected_version: 0, definition: { ...definition, stop_conditions: [] } }));
    expect(JSON.parse(explicit.originalWire).definition.stop_conditions).toEqual([]);
    const enrolWire = `{"subject_type":"lead", "subject_id":"${subjectId}", "expected_definition_version":3}`;
    expect(decodeCrmSequenceOriginalWire("enrol", sequenceId, key, enrolWire).originalWire).toBe(enrolWire);
  });

  it("rejects duplicate escaped keys, UUID aliases, injected identity, unsafe CAS and non-closed stop conditions before transport", () => {
    const invalid = [
      `{"expected_version":0,"expected_\\u0076ersion":0,"definition":${JSON.stringify(definition)}}`,
      JSON.stringify({ expected_version: 0, definition: { ...definition, steps: [{ type: "draft", wait_seconds: null, recipe_uuid: subjectId }] } }),
      JSON.stringify({ expected_version: 0, definition, id: sequenceId }),
      JSON.stringify({ expected_version: Number.MAX_SAFE_INTEGER + 1, definition }),
      JSON.stringify({ expected_version: 0, definition: { ...definition, stop_conditions: null } }),
      JSON.stringify({ expected_version: 0, definition: { ...definition, stop_conditions: {} } }),
      JSON.stringify({ expected_version: 0, definition: { ...definition, stop_conditions: ["booking_confirmed", "booking_confirmed"] } }),
      JSON.stringify({ expected_version: 0, definition: { ...definition, stop_conditions: ["optout"] } }),
    ];
    for (const wire of invalid) expect(() => decodeCrmSequenceOriginalWire("save", null, key, wire)).toThrow(TypeError);
    expect(() => decodeCrmSequenceOriginalWire("enrol", sequenceId, key, JSON.stringify({ subject_type: "lead", subject_uuid: subjectId, expected_definition_version: 3 }))).toThrow(TypeError);
    expect(() => decodeCrmSequenceOriginalWire("save", null, "bad key", JSON.stringify({ expected_version: 0, definition }))).toThrow(TypeError);
  });

  it("preserves current masks and original identities without promoting list metadata, private fields or mutable heads into receipts", () => {
    const row = { id: sequenceId, version: 3, authorization_version: "current-c7", sandbox: true, state: "draft", owner_id: userId, team_id: null, fields: { next_due_at: null } };
    const envelope = { data: { resource: "schedules", items: [row], enrolments: [], next_cursor: null, visible_count: 1 } };
    expect(decodeCrmSequenceList(envelope, "schedules")).toBe(envelope);
    const original = decodeCrmSequenceOriginal({ data: row }, "save");
    expect(original.data.fields).toEqual({ next_due_at: null });
    expect(original.data.fields).not.toHaveProperty("definition");
    expect(() => decodeCrmSequenceOriginal({ data: { ...row, fields: { definition: "{}" } } }, "save")).toThrow(TypeError);
    expect(() => decodeCrmSequenceOriginal({ data: { ...row, effect_id: subjectId } }, "save")).toThrow(TypeError);
    expect(() => decodeCrmSequenceOriginal({ data: { ...row, version: Number.MAX_SAFE_INTEGER + 1 } }, "save")).toThrow(TypeError);
    expect(() => decodeCrmSequenceList({ data: { ...envelope.data, items: [{ ...row, uuid: sequenceId }] } }, "schedules")).toThrow(TypeError);
    expect(() => decodeCrmSequenceList(envelope, "enrolments")).toThrow(TypeError);
    const enrolment = { id: subjectId, version: 1, authorization_version: "current-c7", sandbox: true, sequence_id: sequenceId, subject_type: "lead", subject_id: subjectId,
      generation: 1, definition_version: 3, state: "waiting", current_step: 0, due_at: null, stop_reason: null, fields: {} };
    expect(decodeCrmSequenceOriginal({ data: enrolment }, "enrol").data).toBe(enrolment);
    expect(() => decodeCrmSequenceList({ data: { resource: "enrolments", items: [], enrolments: [enrolment], next_cursor: null, visible_count: 1 } }, "enrolments")).toThrow(TypeError);
  });
});

const paths: CrmSequenceV1Paths = {
  list: "/crm/crmsequence",
  originalSave: "/crm/crmsequence/original",
  originalEnrol: "/crm/crmsequence/enrolments/original",
  save: (id) => id === null ? "/crm/crmsequence" : `/crm/crmsequence/${id}`,
  enrol: (id) => `/crm/crmsequence/${id}/enrolments`,
  preview: (id) => `/crm/crmsequence/${id}/preview`,
  control: (id, action) => `/crm/crmsequence/enrolments/${id}/${action}`,
};
const scheduleOriginal = { id: sequenceId, version: 3, authorization_version: "current-c7", sandbox: true, state: "draft", owner_id: userId, team_id: null, fields: { next_due_at: null } };
const enrolmentOriginal = { id: "018f1111-2222-7333-8444-777777777777", version: 1, authorization_version: "current-c7", sandbox: true,
  sequence_id: sequenceId, subject_type: "lead", subject_id: subjectId, generation: 1, definition_version: 3, state: "waiting", current_step: 0, due_at: null, stop_reason: null, fields: {} };
function sdk(fetch: typeof globalThis.fetch, extra: Partial<ConstructorParameters<typeof Factuarea>[0]> = {}): Factuarea {
  return new Factuarea({ apiKey: "fact_test_synthetic_sequence", baseUrl: "https://sdk-boundary.invalid/v1", timeout: 1000, maxRetries: 8, fetch, ...extra });
}

describe("configured SDK sequence transport, entirely offline", () => {
  it("exports a real public factory requiring explicit routes and uses the same configured client", () => {
    const client = sdk(async () => { throw new Error("No dispatch"); });
    expect(client.crmSequences(paths)).toBeInstanceOf(CrmSequencesResource);
    expect(createCrmSequencesResource(client.http, paths)).toBeInstanceOf(CrmSequencesResource);
    expect(() => client.crmSequences(undefined as never)).toThrow(TypeError);
    expect(() => client.crmSequences({ ...paths, originalSave: "https://foreign.invalid/receipt" })).toThrow(TypeError);
  });

  it("sends byte-exact v1 create/update/enrol original wires and explicit keys without allocating client identity", async () => {
    const wires = [` { "expected_version" : 0, "definition" : ${JSON.stringify({ ...definition, stop_conditions: [] })} }\n`,
      `{"definition":${JSON.stringify(definition)}, "expected_version":2}`, `{"subject_type":"lead", "subject_id":"${subjectId}", "expected_definition_version":3}`];
    const calls: Array<{ url: string; method: string; wire: unknown; key: string | null }> = [];
    const observed: number[] = [];
    const client = sdk(async (input, init) => {
      const headers = new Headers(init?.headers);
      expect(headers.get("Authorization")).toBe("Bearer fact_test_synthetic_sequence");
      expect(headers.get("Factuarea-Version")).toBe("2026-06-01");
      expect(headers.get("X-Active-Profile")).toBe(userId);
      expect(headers.get("Content-Type")).toBe("application/json");
      calls.push({ url: new URL(String(input)).pathname, method: init!.method!, wire: init?.body, key: headers.get("Idempotency-Key") });
      return Response.json({ data: String(input).endsWith("/enrolments") ? enrolmentOriginal : scheduleOriginal }, { headers: { "X-Request-Id": "native-original" } });
    }, { defaultHeaders: { "content-type": "text/plain", "idempotency-key": "discarded-default" } });
    const resource = client.crmSequences(paths);
    const config = { headers: { "X-Active-Profile": userId, "Idempotency-Key": "discarded-request" }, onResponse: (response: { status: number }) => observed.push(response.status) };
    expect((await resource.save(decodeCrmSequenceOriginalWire("save", null, key, wires[0]!), config)).data.id).toBe(sequenceId);
    await resource.save(decodeCrmSequenceOriginalWire("save", sequenceId, key + "-update", wires[1]!), config);
    expect((await resource.enrol(decodeCrmSequenceOriginalWire("enrol", sequenceId, key + "-enrol", wires[2]!), config)).data.id).toBe(enrolmentOriginal.id);
    expect(calls).toEqual([
      { url: "/v1/crm/crmsequence", method: "POST", wire: wires[0], key },
      { url: `/v1/crm/crmsequence/${sequenceId}`, method: "POST", wire: wires[1], key: key + "-update" },
      { url: `/v1/crm/crmsequence/${sequenceId}/enrolments`, method: "POST", wire: wires[2], key: key + "-enrol" },
    ]);
    expect(observed).toEqual([200, 200, 200]);
    expect(JSON.parse(String(calls[0]!.wire))).not.toHaveProperty("id");
  });

  it("keeps the original exact wire/key after ACK loss and recovers by a bodyless GET only", async () => {
    const calls: Array<{ method: string; path: string; body: unknown; key: string | null; search: string }> = [];
    const client = sdk(async (input, init) => {
      const url = new URL(String(input));
      calls.push({ method: init!.method!, path: url.pathname, body: init?.body, key: new Headers(init?.headers).get("Idempotency-Key"), search: url.search });
      if (init?.method === "POST") throw new TypeError("Synthetic lost acknowledgement");
      return Response.json({ data: scheduleOriginal }, { headers: { "Idempotent-Replayed": "true", "X-Request-Id": "readonly-original" } });
    });
    const resource = client.crmSequences(paths);
    const wire = ` {"expected_version":0, "definition":${JSON.stringify(definition)}} `;
    const error: unknown = await resource.save(decodeCrmSequenceOriginalWire("save", null, key, wire)).catch((cause: unknown) => cause);
    expect(error).toBeInstanceOf(CrmSequenceUnconfirmedWriteError);
    const original = (error as CrmSequenceUnconfirmedWriteError).originalIntent;
    expect(original).toMatchObject({ targetId: null, originalKey: key, originalWire: wire });
    expect((await resource.originalSave({ idempotencyKey: original.originalKey })).data.id).toBe(sequenceId);
    expect(calls).toEqual([
      { method: "POST", path: "/v1/crm/crmsequence", body: wire, key, search: "" },
      { method: "GET", path: "/v1/crm/crmsequence/original", body: undefined, key, search: "" },
    ]);
  });

  it.each(["subject", "definition"] as const)("keeps a mismatched enrol %s original unconfirmed without another dispatch", async (mismatch) => {
    let calls = 0;
    const resource = sdk(async () => {
      calls++;
      return Response.json({ data: { ...enrolmentOriginal, ...(mismatch === "subject" ? { subject_id: sequenceId } : { definition_version: 4 }) } });
    }).crmSequences(paths);
    const intent = decodeCrmSequenceOriginalWire("enrol", sequenceId, key, JSON.stringify({ subject_type: "lead", subject_id: subjectId, expected_definition_version: 3 }));
    await expect(resource.enrol(intent)).rejects.toMatchObject({ state: "unconfirmed", originalIntent: intent });
    expect(calls).toBe(1);
  });

  it("uses the configured auth strategy and native response hook without a second transport", async () => {
    let resolutions = 0;
    const seen: string[] = [];
    const client = sdk(async (_input, init) => {
      expect(new Headers(init?.headers).get("Authorization")).toBe("Bearer current-custom-binding");
      return Response.json({ data: scheduleOriginal }, { headers: { "X-Request-Id": "same-native-client" } });
    }, { authStrategy: { headers: async () => { resolutions++; return { Authorization: "Bearer current-custom-binding" }; } } });
    expect(client.environment).toBe("unknown");
    await client.crmSequences(paths).save(decodeCrmSequenceOriginalWire("save", null, key, JSON.stringify({ expected_version: 0, definition })),
      { onResponse: (response) => seen.push(response.requestId!) });
    expect(resolutions).toBe(1);
    expect(seen).toEqual(["same-native-client"]);
  });

  it("bounds an in-flight timeout to one attempt while retaining original bytes and key", async () => {
    let calls = 0;
    const resource = sdk(async (_input, init) => {
      calls++;
      return await new Promise<Response>((_resolve, reject) => {
        init!.signal!.addEventListener("abort", () => reject(new DOMException("Synthetic native timeout", "AbortError")), { once: true });
      });
    }, { timeout: 10 }).crmSequences(paths);
    const intent = decodeCrmSequenceOriginalWire("save", null, key, JSON.stringify({ expected_version: 0, definition }));
    await expect(resource.save(intent)).rejects.toMatchObject({ state: "unconfirmed", originalIntent: intent, idempotencyKey: key });
    expect(calls).toBe(1);
  });

  it("keeps enrolment ambiguity on one attempt and recovers its first UUID through the original enrol GET", async () => {
    const methods: string[] = [];
    const client = sdk(async (input, init) => {
      methods.push(init!.method!);
      expect(new Headers(init?.headers).get("Idempotency-Key")).toBe(key);
      if (init?.method === "POST") return Response.json({ error: { type: "service_unavailable_error", code: "temporary", message: "Unavailable" } }, { status: 503, headers: { "X-Request-Id": "ambiguous-enrol" } });
      expect(new URL(String(input)).pathname).toBe("/v1/crm/crmsequence/enrolments/original");
      expect(init?.body).toBeUndefined();
      return Response.json({ data: enrolmentOriginal });
    });
    const resource = client.crmSequences(paths);
    const intent = decodeCrmSequenceOriginalWire("enrol", sequenceId, key, JSON.stringify({ subject_type: "lead", subject_id: subjectId, expected_definition_version: 3 }));
    const error: unknown = await resource.enrol(intent).catch((cause: unknown) => cause);
    expect(error).toMatchObject({ state: "unconfirmed", idempotencyKey: key, requestId: "ambiguous-enrol", originalIntent: intent });
    expect((await resource.originalEnrol({ idempotencyKey: key })).data).toEqual(enrolmentOriginal);
    expect(methods).toEqual(["POST", "GET"]);
  });

  it("leaves malformed successful originals unconfirmed and rejects private/unsafe receipt recovery", async () => {
    let calls = 0;
    const client = sdk(async (_input, init) => {
      calls++;
      return init?.method === "POST" ? new Response("broken JSON", { status: 200, headers: { "X-Request-Id": "malformed-original" } })
        : Response.json({ data: { ...scheduleOriginal, fields: { definition: "private original" }, version: Number.MAX_SAFE_INTEGER + 1 } });
    });
    const resource = client.crmSequences(paths);
    await expect(resource.save(decodeCrmSequenceOriginalWire("save", null, key, JSON.stringify({ expected_version: 0, definition })))).rejects.toMatchObject({ state: "unconfirmed", idempotencyKey: key, requestId: "malformed-original" });
    await expect(resource.originalSave({ idempotencyKey: key, maxRetries: 0 })).rejects.toMatchObject({ code: "crm_receipt_unreadable" });
    expect(calls).toBe(2);
  });

  it.each(["pause", "resume", "cancel"] as const)("%s uses native PATCH204 void without a default/request/dummy key or original receipt", async (action) => {
    let calls = 0;
    const seen: number[] = [];
    const client = sdk(async (input, init) => {
      calls++;
      expect(new URL(String(input)).pathname).toBe(`/v1/crm/crmsequence/enrolments/${enrolmentOriginal.id}/${action}`);
      expect(init?.method).toBe("PATCH");
      expect(new Headers(init?.headers).get("Idempotency-Key")).toBeNull();
      expect(JSON.parse(String(init?.body))).toEqual(action === "pause" ? { expected_version: 4, reason: "manual" } : { expected_version: 4 });
      return new Response(null, { status: 204 });
    }, { defaultHeaders: { "Idempotency-Key": "discarded-configured-key" } });
    const resource = client.crmSequences(paths);
    const config = { headers: { "idempotency-key": "discarded-request-key" }, onResponse: (response: { status: number }) => seen.push(response.status) };
    const result = action === "pause" ? await resource.pause(enrolmentOriginal.id, { expected_version: 4, reason: "manual" }, config)
      : await resource[action](enrolmentOriginal.id, { expected_version: 4 }, config);
    expect(result).toBeUndefined();
    expect(calls).toBe(1);
    expect(seen).toEqual([204]);
  });

  it("never retries a control after a network failure and provides no original key/receipt recovery claim", async () => {
    let calls = 0;
    const resource = sdk(async () => { calls++; throw new TypeError("Synthetic timeout"); }).crmSequences(paths);
    const error: unknown = await resource.cancel(enrolmentOriginal.id, { expected_version: 4 }).catch((cause: unknown) => cause);
    expect(error).toBeInstanceOf(CrmSequenceControlUnconfirmedError);
    expect(error).toMatchObject({ action: "cancel", enrolmentId: enrolmentOriginal.id, expectedVersion: 4, state: "unconfirmed" });
    expect(error).not.toHaveProperty("idempotencyKey");
    expect(error).not.toHaveProperty("originalIntent");
    expect(calls).toBe(1);
  });

  it("treats a non204 control response as unknown and rejects cancellation before any transport", async () => {
    let calls = 0;
    const resource = sdk(async () => { calls++; return Response.json({ data: scheduleOriginal }); }).crmSequences(paths);
    await expect(resource.resume(enrolmentOriginal.id, { expected_version: 4 })).rejects.toBeInstanceOf(CrmSequenceControlUnconfirmedError);
    const abort = new AbortController(); abort.abort();
    await expect(resource.pause(enrolmentOriginal.id, { expected_version: 4, reason: "manual" }, { signal: abort.signal })).rejects.toBeInstanceOf(ConnectionError);
    expect(calls).toBe(1);
  });

  it.each([[403, AuthenticationError], [409, ConflictError], [422, ValidationError]] as const)("preserves native %s denial/current fields without wrapping it as ambiguity or retrying", async (status, ErrorType) => {
    let calls = 0;
    const native = { error: { type: "invalid_request_error", code: "current_native_denial", subcode: "current_cas", message: "Current denial", errors: [{ param: "expected_version", code: "stale", message: "Changed" }], details: { current_fields: { version: 5, state: null } } } };
    const resource = sdk(async () => { calls++; return Response.json(native, { status, headers: { "X-Request-Id": "current-denial" } }); }).crmSequences(paths);
    const error: unknown = await resource.save(decodeCrmSequenceOriginalWire("save", sequenceId, key, JSON.stringify({ expected_version: 2, definition }))).catch((cause: unknown) => cause);
    expect(error).toBeInstanceOf(ErrorType);
    expect(error).not.toBeInstanceOf(CrmSequenceUnconfirmedWriteError);
    expect(error).toMatchObject({ status, code: "current_native_denial", requestId: "current-denial", rawResponse: native });
    expect(calls).toBe(1);
  });

  it("walks the opaque cursor with current parent metadata and preserved closed filters rather than reading subjects/private receipts", async () => {
    const urls: URL[] = [];
    const parent = scheduleOriginal;
    const meta = { id: enrolmentOriginal.id, version: 2, authorization_version: "current-c7", sandbox: true, sequence_id: sequenceId, owner_id: userId, team_id: null,
      generation: 1, definition_version: 3, state: "waiting", current_step: 0, next_due_at: null, stop_reason: null, created_at: "2026-10-10T00:00:00Z", updated_at: "2026-10-10T00:00:00Z" };
    const resource = sdk(async (input, init) => {
      const url = new URL(String(input)); urls.push(url);
      expect(init?.method).toBe("GET");
      expect(init?.body).toBeUndefined();
      expect(JSON.parse(url.searchParams.get("filters")!)).toEqual({ resource: "enrolments", team_id: null, definition_version: 3 });
      expect(url.searchParams.get("limit")).toBe("1");
      return Response.json({ data: { resource: "enrolments", items: [parent], enrolments: [{ ...meta, id: urls.length === 1 ? enrolmentOriginal.id : subjectId }], next_cursor: urls.length === 1 ? "opaque_cursor" : null, visible_count: 2 } });
    }).crmSequences(paths);
    const page = await resource.list({ filters: { resource: "enrolments", team_id: null, definition_version: 3 }, limit: 1 });
    expect(page.payload.items).toEqual([parent]);
    expect((await page.toArray()).map((row) => row.id)).toEqual([enrolmentOriginal.id, subjectId]);
    expect(urls[1]!.searchParams.get("cursor")).toBe("opaque_cursor");
  });

  it("keeps preview a GET with v1 IDs and rejects an unrelated identity", async () => {
    let calls = 0;
    const resource = sdk(async (input, init) => {
      calls++;
      const url = new URL(String(input));
      expect(init?.method).toBe("GET"); expect(init?.body).toBeUndefined();
      expect(new Headers(init?.headers).get("Idempotency-Key")).toBeNull();
      expect(url.searchParams.get("subject_id")).toBe(subjectId);
      expect(url.searchParams.has("subject_uuid")).toBe(false);
      return Response.json({ data: { sequence_id: sequenceId, definition_version: 3, subject_id: calls === 1 ? subjectId : sequenceId, timezone: "Europe/Madrid", steps: [{ step_index: 0, type: "draft", due_at: "2026-10-10T09:00:00Z", recipe_id: subjectId }] } });
    }, { defaultHeaders: { "idempotency-key": "discarded-read-default" } }).crmSequences(paths);
    const parameters = { subject_type: "lead" as const, subject_id: subjectId, start_at: "2026-10-10T08:00:00+00:00" };
    expect((await resource.preview(sequenceId, parameters)).data.steps).toHaveLength(1);
    await expect(resource.preview(sequenceId, parameters)).rejects.toThrow("preview identity");
    expect(calls).toBe(2);
  });

  it("preserves ordinary configured SDK JSON/header behavior while raw body combinations fail before fetch", async () => {
    let calls = 0;
    const client = sdk(async (_input, init) => {
      calls++;
      expect(init?.body).toBe(JSON.stringify({ ordinary: true }));
      expect(new Headers(init?.headers).get("Idempotency-Key")).toBe("ordinary-original");
      return Response.json({ ordinary: true });
    });
    await client.http.request({ method: "POST", path: "/existing-resource", body: { ordinary: true }, idempotencyKey: "ordinary-original", maxRetries: 0 });
    await expect(client.http.requestOriginalJson({ method: "POST", path: paths.list, rawJsonBody: "{}", body: {} })).rejects.toThrow("exclusive");
    await expect(client.http.requestOriginalJson({ method: "POST", path: paths.list, rawJsonBody: "not JSON" })).rejects.toThrow("valid JSON");
    await expect(client.http.requestOriginalJson({ method: "GET", path: paths.list, rawJsonBody: "{}" })).rejects.toThrow("exclusive");
    expect(calls).toBe(1);
  });
});
