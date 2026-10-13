import { describe, expect, it } from "vitest";
import { AuthenticationError, ConnectionError, ConflictError, CrmBookingsResource, CrmBookingUnconfirmedWriteError, Factuarea, NotFoundError, ServerError, ValidationError,
  createCrmBookingsResource, decodeCrmBookingPage, decodeCrmBookingService, decodeCrmBookingServiceIntent, decodeCrmBookingServiceReceipt } from "../src/index.js";
import type { CrmBookingV1Paths } from "../src/index.js";

const serviceId = "018f1111-2222-7333-8444-555555555555";
const resourceId = "018f1111-2222-7333-8444-666666666666";
const bookingId = "018f1111-2222-7333-8444-777777777777";
const hostId = "550e8400-e29b-41d4-a716-446655440000";
const key = "opaque original booking key";
const schedule = { timezone: "Europe/Madrid", duration_minutes: 30, buffer_before: 5, buffer_after: 10, capacity: 1, minimum_notice_minutes: 60,
  booking_horizon_days: 30, slot_step_minutes: 15, dst_policy: "reject_ambiguous", windows: [{ weekday: 1, start_minute: 540, end_minute: 1020 }],
  exceptions: [{ date: "2026-12-25", windows: [] }] };
const definition = { public_id: "opaque-publication-booking-reference", state: "published", host_id: hostId, resource_id: resourceId, schedule,
  required_sources: ["booking"], notice_version: "legal-current-1", hold_minutes: 10 };
const receipt = { id: serviceId, version: 4, publication_version: 2, location: null };
const paths: CrmBookingV1Paths = {
  listBookingServices: "/crm/booking/services", listBookings: "/crm/booking/bookings", createBookingService: "/crm/booking/services",
  getBookingService: (id) => `/crm/booking/services/${id}`,
  saveBookingService: (id) => `/crm/booking/services/${id}`,
  recoverBookingServiceReceipt: (id) => `/crm/booking/services/receipts${id === null ? "" : "/" + id}`,
};
function sdk(fetch: typeof globalThis.fetch, extra: Partial<ConstructorParameters<typeof Factuarea>[0]> = {}): Factuarea {
  return new Factuarea({ apiKey: "fact_test_synthetic_booking", baseUrl: "https://sdk-boundary.invalid/v1", timeout: 1000, maxRetries: 8, fetch, ...extra });
}
const createWire = ` { "definition" : ${JSON.stringify(definition)}, "publication_confirmation_id" : "${resourceId}" }\n`;
const updateWire = ' {"definition":{"location":null}, "expected_version":3} ';

describe("native administrative Booking codecs", () => {
  it("retains prepared original bytes/key and distinguishes creation omitted/null CAS from update omission/null patches", () => {
    const create = decodeCrmBookingServiceIntent(null, key, createWire);
    expect(create.originalWire).toBe(createWire); expect(create.originalKey).toBe(key); expect(Object.isFrozen(create)).toBe(true);
    expect(JSON.parse(create.originalWire)).not.toHaveProperty("expected_version");
    expect(JSON.parse(create.originalWire).definition).not.toHaveProperty("location");
    const explicit = decodeCrmBookingServiceIntent(null, key, JSON.stringify({ expected_version: null, definition }));
    expect(JSON.parse(explicit.originalWire).expected_version).toBeNull();
    const update = decodeCrmBookingServiceIntent(serviceId, key, updateWire);
    expect(JSON.parse(update.originalWire).definition).toEqual({ location: null });
    expect(JSON.parse(update.originalWire).definition).not.toHaveProperty("state");
  });
  it("rejects duplicate escaped keys, caller IDs/authority, SPA UUID aliases, unsafe CAS and malformed closed schedules before transport", () => {
    const invalidCreate = [
      `{"definition":{},"defin\\u0069tion":{}}`, JSON.stringify({ definition, id: serviceId }), JSON.stringify({ definition, confirmed: true }),
      JSON.stringify({ definition, expected_version: 0 }), JSON.stringify({ definition, publication_confirmation_id: null }),
      JSON.stringify({ definition: { host_uuid: hostId } }), JSON.stringify({ definition: { resource_id: hostId } }), JSON.stringify({ definition: { state: null } }),
      JSON.stringify({ definition: { lead_capture: { purpose: "booking" } } }), JSON.stringify({ definition: { required_sources: ["calendar"] } }),
      JSON.stringify({ definition: { required_sources: ["booking", "booking"] } }), JSON.stringify({ definition: { notice_version: "é".repeat(101) } }),
      JSON.stringify({ definition: { schedule: { ...schedule, windows: [{ weekday: 1, start_minute: 0, end_minute: 20 }, { weekday: 1, start_minute: 10, end_minute: 30 }] } } }),
      JSON.stringify({ definition: { schedule: { ...schedule, exceptions: [{ date: "2026-02-30", windows: [] }] } } }),
      JSON.stringify({ definition: { schedule: { ...schedule, capacity: 0 } } }), JSON.stringify({ definition: { schedule: { ...schedule, dst_policy: "automatic" } } }),
    ];
    for (const wire of invalidCreate) expect(() => decodeCrmBookingServiceIntent(null, key, wire)).toThrow(TypeError);
    for (const wire of [JSON.stringify({ definition: {} }), JSON.stringify({ definition: {}, expected_version: null }),
      JSON.stringify({ definition: {}, expected_version: Number.MAX_SAFE_INTEGER + 1 })]) expect(() => decodeCrmBookingServiceIntent(serviceId, key, wire)).toThrow(TypeError);
    for (const originalKey of ["", "a".repeat(201), "bad\nkey", "bad\u007fkey", " edge", "edge ", "unrepresentable-漢"]) expect(() => decodeCrmBookingServiceIntent(null, originalKey, createWire)).toThrow(TypeError);
    expect(() => decodeCrmBookingServiceIntent(null, key, " ".repeat(65537))).toThrow(TypeError);
  });
  it("preserves current masks and original null without leaking source/visitor/token/internal identity or fabricating missing fields", () => {
    const envelope = { data: receipt }; expect(decodeCrmBookingService(envelope)).toBe(envelope);
    expect(decodeCrmBookingServiceReceipt({ data: null }).data).toBeNull();
    expect(decodeCrmBookingService(envelope).data).not.toHaveProperty("host_id");
    const servicePage = { data: { items: [{ ...receipt, host_id: hostId, source_statuses: { booking: { verified: true, revision: "a".repeat(64), reason: null } } }], total: 1, next_cursor: null } };
    expect(decodeCrmBookingPage(servicePage, "services")).toBe(servicePage);
    const bookingPage = { data: { items: [{ id: bookingId, version: 1, host_id: hostId, status: "confirmed", start_at: "2026-10-11T09:00:00Z" }], total: 1, next_cursor: "opaque cursor/+=" } };
    expect(decodeCrmBookingPage(bookingPage, "bookings")).toBe(bookingPage);
    for (const row of [{ ...receipt, visitor: {} }, { ...receipt, uuid: serviceId }, { ...receipt, manage_token: "private" },
      { ...receipt, source_statuses: {} }, { ...receipt, version: Number.MAX_SAFE_INTEGER + 1 }, { ...receipt, state: null }]) expect(() => decodeCrmBookingService({ data: row })).toThrow(TypeError);
    expect(() => decodeCrmBookingPage({ data: { ...bookingPage.data, items: [{ ...bookingPage.data.items[0], lead_id: resourceId }] } }, "bookings")).toThrow(TypeError);
    expect(() => decodeCrmBookingPage({ data: { ...servicePage.data, items: [{ ...receipt, source_statuses: { booking: { verified: true, revision: "invalid", reason: null } } }] } }, "services")).toThrow(TypeError);
  });
});

describe("configured SDK Booking transport, entirely offline", () => {
  it("exports a real required-path public factory on the same client without changing Sequence composition", () => {
    const client = sdk(async () => { throw new Error("No dispatch"); });
    expect(client.crmBookings(paths)).toBeInstanceOf(CrmBookingsResource); expect(createCrmBookingsResource(client.http, paths)).toBeInstanceOf(CrmBookingsResource);
    expect(typeof client.crmSequences).toBe("function");
    expect(() => client.crmBookings(undefined as never)).toThrow(TypeError);
    expect(() => client.crmBookings({ ...paths, listBookings: "https://foreign.invalid/bookings" })).toThrow(TypeError);
    expect(() => client.crmBookings({ ...paths, createBookingService: "/crm/booking/../other" })).toThrow(TypeError);
  });
  it("sends exact create POST201/update PUT200 wires with original key, configured auth/profile/version and native response hook", async () => {
    const calls: Array<{ method: string; path: string; wire: unknown; key: string | null }> = []; const observed: number[] = [];
    const client = sdk(async (input, init) => {
      const headers = new Headers(init?.headers);
      expect(headers.get("Authorization")).toBe("Bearer fact_test_synthetic_booking"); expect(headers.get("X-Active-Profile")).toBe(hostId);
      expect(headers.get("Factuarea-Version")).toBe("2026-06-01"); expect(headers.get("Content-Type")).toBe("application/json");
      calls.push({ method: init!.method!, path: new URL(String(input)).pathname, wire: init?.body, key: headers.get("Idempotency-Key") });
      return Response.json({ data: receipt }, { status: init?.method === "POST" ? 201 : 200, headers: { "Cache-Control": "no-store", "X-Request-Id": "native-booking-original" } });
    }, { defaultHeaders: { "idempotency-key": "discard-default", "content-type": "text/plain" } });
    const config = { headers: { "X-Active-Profile": hostId, "Idempotency-Key": "discard-request" }, onResponse: (response: { status: number }) => observed.push(response.status) };
    expect((await client.crmBookings(paths).createBookingService(decodeCrmBookingServiceIntent(null, key, createWire), config)).data).toEqual(receipt);
    await client.crmBookings(paths).saveBookingService(decodeCrmBookingServiceIntent(serviceId, key + " update", updateWire), config);
    expect(calls).toEqual([{ method: "POST", path: "/v1/crm/booking/services", wire: createWire, key },
      { method: "PUT", path: `/v1/crm/booking/services/${serviceId}`, wire: updateWire, key: key + " update" }]);
    expect(observed).toEqual([201, 200]); expect(JSON.parse(String(calls[0]!.wire))).not.toHaveProperty("id");
  });
  it("keeps lost-ACK creation original and recovers by readonly POST wrapper/key without target replacement or another save", async () => {
    const calls: Array<{ path: string; method: string; wire: unknown; key: string | null }> = [];
    const resource = sdk(async (input, init) => {
      const path = new URL(String(input)).pathname; calls.push({ path, method: init!.method!, wire: init?.body, key: new Headers(init?.headers).get("Idempotency-Key") });
      if (!path.includes("/receipts")) throw new TypeError("Synthetic lost acknowledgement");
      expect(JSON.parse(String(init?.body))).toEqual({ original_wire_body: createWire });
      return Response.json({ data: receipt });
    }).crmBookings(paths);
    const error: unknown = await resource.createBookingService(decodeCrmBookingServiceIntent(null, key, createWire)).catch((cause: unknown) => cause);
    expect(error).toBeInstanceOf(CrmBookingUnconfirmedWriteError);
    const original = (error as CrmBookingUnconfirmedWriteError).originalIntent;
    expect(original).toEqual({ targetId: null, originalKey: key, originalWire: createWire });
    expect((await resource.recoverBookingServiceReceipt(original)).data?.id).toBe(serviceId);
    expect(calls).toEqual([{ path: "/v1/crm/booking/services", method: "POST", wire: createWire, key },
      { path: "/v1/crm/booking/services/receipts", method: "POST", wire: JSON.stringify({ original_wire_body: createWire }), key }]);
  });
  it("uses the original update target/key/wire and preserves a proven absent receipt as data:null", async () => {
    let calls = 0;
    const resource = sdk(async (input, init) => {
      calls++; expect(new URL(String(input)).pathname).toBe(`/v1/crm/booking/services/receipts/${serviceId}`);
      expect(init?.method).toBe("POST"); expect(JSON.parse(String(init?.body)).original_wire_body).toBe(updateWire);
      expect(new Headers(init?.headers).get("Idempotency-Key")).toBe(key);
      return Response.json({ data: null });
    }).crmBookings(paths);
    expect(await resource.recoverBookingServiceReceipt(decodeCrmBookingServiceIntent(serviceId, key, updateWire))).toEqual({ data: null });
    expect(calls).toBe(1);
  });
  it("recovers a maximal original wire through the larger native wrapper without reencoding the original or inheriting wrong Content-Type", async () => {
    const wire = JSON.stringify({ definition: {}, expected_version: 3 }) + "\n".repeat(65490);
    expect(Buffer.byteLength(wire)).toBeLessThanOrEqual(65536); expect(Buffer.byteLength(JSON.stringify({ original_wire_body: wire }))).toBeGreaterThan(65536);
    const resource = sdk(async (_input, init) => {
      expect(new Headers(init?.headers).get("Content-Type")).toBe("application/json");
      expect(JSON.parse(String(init?.body))).toEqual({ original_wire_body: wire }); return Response.json({ data: null });
    }, { defaultHeaders: { "content-type": "text/plain" } }).crmBookings(paths);
    expect((await resource.recoverBookingServiceReceipt(decodeCrmBookingServiceIntent(serviceId, key, wire))).data).toBeNull();
  });
  it("preserves configured custom auth and fresh response metadata without a second HTTP client", async () => {
    let credentials = 0; const requestIds: Array<string | null> = [];
    const resource = sdk(async (_input, init) => {
      expect(new Headers(init?.headers).get("Authorization")).toBe("Bearer current-native-credential");
      return Response.json({ data: receipt }, { status: 201, headers: { "X-Request-Id": "same-http-auth" } });
    }, { authStrategy: { headers: async () => { credentials++; return { Authorization: "Bearer current-native-credential" }; } } }).crmBookings(paths);
    await resource.createBookingService(decodeCrmBookingServiceIntent(null, key, createWire), { onResponse: (response) => requestIds.push(response.requestId) });
    expect(credentials).toBe(1); expect(requestIds).toEqual(["same-http-auth"]);
  });
  it.each([500, 503])("keeps HTTP%s write uncertainty bounded to one attempt and retains the exact intent", async (status) => {
    let calls = 0;
    const resource = sdk(async () => { calls++; return Response.json({ error: { code: "service_unavailable", subcode: "availability_unavailable", message: "Current source unavailable" } }, { status, headers: { "X-Request-Id": "ambiguous-write" } }); }).crmBookings(paths);
    const intent = decodeCrmBookingServiceIntent(serviceId, key, updateWire);
    const error = await resource.saveBookingService(intent).catch((cause: unknown) => cause);
    expect(error).toBeInstanceOf(CrmBookingUnconfirmedWriteError); expect(error).toMatchObject({ originalIntent: intent, requestId: "ambiguous-write", state: "unconfirmed", idempotencyKey: key });
    expect((error as Error).cause).toBeInstanceOf(ServerError); expect(calls).toBe(1);
  });
  it.each([201, 204])("keeps incompatible update HTTP%s completion unconfirmed instead of borrowing Sequence control semantics", async (status) => {
    let calls = 0;
    const resource = sdk(async () => { calls++; return status === 204 ? new Response(null, { status }) : Response.json({ data: receipt }, { status }); }).crmBookings(paths);
    await expect(resource.saveBookingService(decodeCrmBookingServiceIntent(serviceId, key, updateWire))).rejects.toBeInstanceOf(CrmBookingUnconfirmedWriteError); expect(calls).toBe(1);
  });
  it("keeps malformed or mismatched original projections unconfirmed and never silently recovers a new head", async () => {
    let calls = 0;
    const resource = sdk(async () => {
      calls++; return calls === 1 ? new Response("broken JSON", { status: 201 }) : Response.json({ data: { ...receipt, id: resourceId } });
    }).crmBookings(paths);
    await expect(resource.createBookingService(decodeCrmBookingServiceIntent(null, key, createWire))).rejects.toBeInstanceOf(CrmBookingUnconfirmedWriteError);
    await expect(resource.saveBookingService(decodeCrmBookingServiceIntent(serviceId, key, updateWire))).rejects.toBeInstanceOf(CrmBookingUnconfirmedWriteError);
    await expect(resource.recoverBookingServiceReceipt(decodeCrmBookingServiceIntent(serviceId, key, updateWire))).rejects.toMatchObject({ code: "crm_booking_projection_unreadable" });
    expect(calls).toBe(3);
  });
  it.each([[401, AuthenticationError], [403, AuthenticationError], [404, NotFoundError], [409, ConflictError], [422, ValidationError]] as const)("preserves current native HTTP%s errors/param/details without retry or wrapping as uncertainty", async (status, ErrorType) => {
    let calls = 0;
    const native = { error: { code: status === 409 ? "resource_conflict" : "business_rule_violation", subcode: status === 409 ? "version_conflict" : "invalid_host_id", param: "host_id", message: "Current native denial", details: { current_fields: { version: 5, location: null } } } };
    const resource = sdk(async () => { calls++; return Response.json(native, { status, headers: { "X-Request-Id": "current-owner" } }); }).crmBookings(paths);
    const error = await resource.saveBookingService(decodeCrmBookingServiceIntent(serviceId, key, updateWire)).catch((cause: unknown) => cause);
    expect(error).toBeInstanceOf(ErrorType); expect(error).not.toBeInstanceOf(CrmBookingUnconfirmedWriteError);
    expect(error).toMatchObject({ status, rawResponse: native, param: "host_id", requestId: "current-owner" }); expect(calls).toBe(1);
    if (error instanceof ValidationError) expect(error.fields).toEqual({ host_id: ["Current native denial"] });
  });
  it("bounds recovery transport failure without resending the save or claiming a new original outcome", async () => {
    let calls = 0;
    const resource = sdk(async () => { calls++; throw new TypeError("Synthetic readonly recovery transport failure"); }).crmBookings(paths);
    const error = await resource.recoverBookingServiceReceipt(decodeCrmBookingServiceIntent(null, key, createWire)).catch((cause: unknown) => cause);
    expect(error).toBeInstanceOf(ConnectionError); expect(error).not.toBeInstanceOf(CrmBookingUnconfirmedWriteError); expect(calls).toBe(1);
  });
  it("reads the current head for editing without manufacturing an original receipt and rejects mismatched/private projections", async () => {
    const methods: string[] = [];
    const resource = sdk(async (input, init) => {
      methods.push(init!.method!); expect(new URL(String(input)).pathname).toBe(`/v1/crm/booking/services/${serviceId}`);
      expect(init?.body).toBeUndefined(); expect(new Headers(init?.headers).get("Idempotency-Key")).toBeNull();
      return Response.json({ data: methods.length === 1 ? { id: serviceId, version: 6, location: null } : { id: resourceId, version: 6 } });
    }, { defaultHeaders: { "idempotency-key": "discard-read-default" } }).crmBookings(paths);
    expect((await resource.getBookingService(serviceId)).data.version).toBe(6);
    await expect(resource.getBookingService(serviceId)).rejects.toMatchObject({ code: "crm_booking_projection_unreadable" }); expect(methods).toEqual(["GET", "GET"]);
  });
  it("walks opaque service cursors preserving total/masks/source revisions and leaves omitted limit to the native default", async () => {
    const urls: URL[] = [];
    const resource = sdk(async (input, init) => {
      const url = new URL(String(input)); urls.push(url); expect(init?.method).toBe("GET"); expect(url.searchParams.has("limit")).toBe(false);
      expect(new Headers(init?.headers).get("Idempotency-Key")).toBeNull();
      return Response.json({ data: { items: [{ id: urls.length === 1 ? serviceId : resourceId, version: 1, source_statuses: { booking: { verified: false, revision: "a".repeat(64), reason: "Current producer unavailable" } } }], total: 2, next_cursor: urls.length === 1 ? "opaque cursor/+=" : null } });
    }, { defaultHeaders: { "idempotency-key": "discard-read-default" } }).crmBookings(paths);
    const page = await resource.listBookingServices(); expect(page.total).toBe(2);
    expect((await page.toArray()).map((row) => row.id)).toEqual([serviceId, resourceId]); expect(urls[1]!.searchParams.get("cursor")).toBe("opaque cursor/+=" );
  });
  it("keeps booking list filters closed with v4 host, UTC bounds and limit while omitting all private visitor/lead fields", async () => {
    let calls = 0;
    const resource = sdk(async (input, init) => {
      calls++; const url = new URL(String(input)); expect(init?.method).toBe("GET"); expect(url.pathname).toBe("/v1/crm/booking/bookings");
      expect(Object.fromEntries(url.searchParams)).toEqual({ host_id: hostId, service_id: serviceId, status: "confirmed", from: "2026-10-10T00:00:00Z", through: "2026-10-12T00:00:00Z", limit: "1" });
      return Response.json({ data: { items: [{ id: bookingId, version: 1, host_id: hostId, status: "confirmed", projection_status: "completed" }], total: 1, next_cursor: null } });
    }).crmBookings(paths);
    const page = await resource.listBookings({ host_id: hostId, service_id: serviceId, status: "confirmed", from: "2026-10-10T00:00:00Z", through: "2026-10-12T00:00:00Z", limit: 1 });
    expect(page.data[0]).not.toHaveProperty("lead_id"); expect(page.data[0]).not.toHaveProperty("visitor"); expect(calls).toBe(1);
    await expect(resource.listBookings({ from: "2026-10-12T00:00:00Z", through: "2026-10-10T00:00:00Z" })).rejects.toThrow(TypeError);
    await expect(resource.listBookings({ host_uuid: hostId } as never)).rejects.toThrow(TypeError);
    await expect(resource.listBookingServices({ limit: 101 })).rejects.toThrow(TypeError); expect(calls).toBe(1);
  });
  it("rejects repeated opaque list cursors without making an effect", async () => {
    let calls = 0;
    const resource = sdk(async () => { calls++; return Response.json({ data: { items: [{ id: serviceId, version: 1 }], total: 1, next_cursor: "repeated" } }); }).crmBookings(paths);
    const page = await resource.listBookingServices(); await expect(page.toArray()).rejects.toThrow("repeated CRM cursor"); expect(calls).toBe(2);
  });
  it("cancels before dispatch with no unconfirmed claim and bounds an in-flight timeout to one attempt", async () => {
    let calls = 0;
    const resource = sdk(async (_input, init) => {
      calls++; return await new Promise<Response>((_resolve, reject) => init!.signal!.addEventListener("abort", () => reject(new DOMException("Synthetic timeout", "AbortError")), { once: true }));
    }, { timeout: 10 }).crmBookings(paths);
    const abort = new AbortController(); abort.abort();
    await expect(resource.createBookingService(decodeCrmBookingServiceIntent(null, key, createWire), { signal: abort.signal })).rejects.toMatchObject({ code: "request_aborted" }); expect(calls).toBe(0);
    await expect(resource.saveBookingService(decodeCrmBookingServiceIntent(serviceId, key, updateWire))).rejects.toMatchObject({ state: "unconfirmed", originalIntent: { originalWire: updateWire, originalKey: key } }); expect(calls).toBe(1);
  });
});
