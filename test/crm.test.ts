import { readFileSync } from "node:fs";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { AuthenticationError, ConflictError, ConnectionError, CrmUnconfirmedWriteError, CRM_OPERATIONS, Factuarea, RateLimitError, ValidationError } from "../src/index.js";
import { BASE_URL, server, testClient, useMockServer } from "./helpers.js";

useMockServer();
const id = "0199152d-525d-7000-8000-000000000001";
const otherId = "0199152d-525d-7000-8000-000000000002";
const receipt = { data: { id, confirmed: true, representation_available: false } };
interface NativeOperation { requestBody?: unknown; parameters?: { in: string; name: string }[]; operationId: string; }
const spec = JSON.parse(readFileSync(new URL("../spec/crm-native.json", import.meta.url), "utf8")) as { paths: Record<string, Record<string, NativeOperation>> };
// This historical Source49 suite stays scoped to its immutable delivered input.
const SOURCE49_OPERATIONS = CRM_OPERATIONS.filter((entry) => entry.operation.startsWith("crm_"));

describe("native CRM operation contract", () => {
  it.each(SOURCE49_OPERATIONS)("$sdk sends $method $path", async (entry) => {
    const wire = spec.paths[entry.path]![entry.method.toLowerCase()]!;
    const path = entry.path.replace(/\{[^}]+\}/g, id);
    let observed = 0;
    server.use(http.all(`${BASE_URL}${path}`, async ({ request }) => {
      observed++;
      expect(request.method).toBe(entry.method);
      expect(request.headers.get("Authorization")).toBe("Bearer fact_test_secret");
      expect(request.headers.get("Idempotency-Key")).toBe(entry.method === "GET" ? null : "original-step");
      if (wire.requestBody) expect(await request.json()).toEqual({ expected_version: 7 });
      if (entry.operation === "crm_pipelines.index") return HttpResponse.json({ data: { items: [], next_cursor: null, has_more: false } });
      if (["crm_leads.index", "crm_leads.search", "crm_leads.history", "crm_leads.duplicates"].includes(entry.operation)) return HttpResponse.json({ data: { data: [], next_cursor: null, has_more: false } });
      if (["crm_contact_people.index", "crm_contact_people.options", "crm_contact_people.duplicates"].includes(entry.operation)) return HttpResponse.json({ data: [], meta: { total: 0, current_page: 1 } });
      return HttpResponse.json(receipt);
    }));
    const [, namespace, method] = entry.sdk.split(".");
    const resource = testClient().crm[namespace as keyof Factuarea["crm"]] as unknown as Record<string, (...args: unknown[]) => Promise<unknown>>;
    const args: unknown[] = (wire.parameters ?? []).filter((p) => p.in === "path").map(() => id);
    if (wire.requestBody) args.push({ expected_version: 7 });
    if (wire.parameters?.some((p) => p.in === "query")) args.push(entry.operation === "crm_contact_people.options" ? { kind: "people" } : {});
    args.push({ ...(entry.method === "GET" ? {} : { idempotencyKey: "original-step" }), humanConfirmed: true });
    await resource[method!]!.apply(resource, args);
    expect(observed).toBe(1);
  });

  it("exports exactly the native operation IDs without an invented discovery endpoint", () => {
    const ids = Object.values(spec.paths).flatMap((methods) => Object.values(methods).map((op) => op.operationId));
    expect(SOURCE49_OPERATIONS.map((op) => op.operationId).sort()).toEqual(ids.sort());
    expect(SOURCE49_OPERATIONS).toHaveLength(49);
    expect(CRM_OPERATIONS.some((op) => op.path.includes("capabilities"))).toBe(false);
    expect(SOURCE49_OPERATIONS.every((op) => op.scope.startsWith("crm_"))).toBe(true);
  });
});

describe("owner-specific pagination", () => {
  it("walks numbered people pages and preserves all filters and request context", async () => {
    const urls: URL[] = [];
    server.use(http.get(`${BASE_URL}/crm/contact-people`, ({ request }) => {
      const url = new URL(request.url); urls.push(url);
      const page = Number(url.searchParams.get("page") ?? 1);
      expect(request.headers.get("X-Active-Profile")).toBe("context-A");
      return HttpResponse.json({ data: [{ id: page === 1 ? id : otherId, kind: "person", name: "Test", version: 1, status: "active" }], meta: { total: 2, current_page: page, per_page: 1, last_page: 2 } }, { headers: { "X-Request-Id": `people-${page}` } });
    }));
    const page = await testClient().crm.contactPeople.list({ kind: "person", status: "active", tag: "local", search: "Test", typed_filters: '{"scope":"contact"}', per_page: 1 }, { headers: { "X-Active-Profile": "context-A" } });
    expect(page.meta.total).toBe(2); expect(page.requestId).toBe("people-1");
    expect((await page.toArray()).map((p) => p.id)).toEqual([id, otherId]);
    expect(urls[1]?.searchParams.get("page")).toBe("2");
    for (const url of urls) {
      expect(url.searchParams.get("typed_filters")).toBe('{"scope":"contact"}');
      expect(url.searchParams.get("kind")).toBe("person");
      expect(url.searchParams.get("tag")).toBe("local");
    }
  });

  it.each(["options", "duplicates"] as const)("walks %s using the native fixed 25-item pages", async (method) => {
    let calls = 0;
    const path = method === "options" ? "/crm/contact-people/options" : `/crm/contact-people/${id}/duplicates`;
    server.use(http.get(`${BASE_URL}${path}`, ({ request }) => {
      calls++; const page = Number(new URL(request.url).searchParams.get("page") ?? 1);
      return HttpResponse.json({ data: Array.from({ length: page === 1 ? 25 : 1 }, () => ({ id, label: "Test" })), meta: { total: 26, current_page: page } });
    }));
    const people = testClient().crm.contactPeople;
    const page = method === "options" ? await people.options({ kind: "people" }) : await people.duplicates(id);
    expect(await page.toArray()).toHaveLength(26); expect(calls).toBe(2);
  });

  it.each(["list", "search", "history", "duplicates"] as const)("walks nested Lead %s cursors without decoding them", async (method) => {
    const urls: URL[] = [];
    const path = method === "list" ? "/crm/leads" : method === "search" ? "/crm/leads/search" : `/crm/leads/${id}/${method}`;
    server.use(http.get(`${BASE_URL}${path}`, ({ request }) => {
      const url = new URL(request.url); urls.push(url);
      const next = url.searchParams.has("cursor");
      expect(request.headers.get("X-Active-Profile")).toBe("lead-context");
      return HttpResponse.json({ data: { data: [{ id: next ? otherId : id }], has_more: !next, next_cursor: next ? null : "signed+opaque/=cursor" } });
    }));
    const leads = testClient().crm.leads;
    const config = { headers: { "X-Active-Profile": "lead-context" } };
    const page = method === "list" || method === "search" ? await leads[method]({ filters: '{"status":"open"}', sort: "-created_at", limit: 1 }, config) : await leads[method](id, { limit: 1 }, config);
    expect((await page.toArray()).map((p) => p.id)).toEqual([id, otherId]);
    expect(urls[1]?.searchParams.get("cursor")).toBe("signed+opaque/=cursor");
    expect(urls[1]?.searchParams.get("limit")).toBe("1");
    if (method === "list" || method === "search") expect(urls[1]?.searchParams.get("filters")).toBe('{"status":"open"}');
  });

  it("walks Pipeline items while preserving team filters", async () => {
    const urls: URL[] = [];
    server.use(http.get(`${BASE_URL}/crm/pipelines`, ({ request }) => {
      const url = new URL(request.url); urls.push(url); const next = url.searchParams.has("cursor");
      return HttpResponse.json({ data: { items: [{ id: next ? otherId : id }], has_more: !next, next_cursor: next ? null : "pipeline-signed-token" } });
    }));
    const page = await testClient().crm.pipelines.list({ team_id: otherId, status: "active", sort: "name_asc", limit: 1 });
    expect((await page.toArray()).map((p) => p.id)).toEqual([id, otherId]);
    expect(urls[1]?.searchParams.get("team_id")).toBe(otherId);
    expect(urls[1]?.searchParams.get("cursor")).toBe("pipeline-signed-token");
  });

  it("fails on incompatible pagination instead of silently dropping records", async () => {
    server.use(http.get(`${BASE_URL}/crm/leads`, () => HttpResponse.json({ data: [], has_more: false, next_cursor: null })));
    await expect(testClient().crm.leads.list()).rejects.toThrow("incompatible CRM cursor response");
  });

  it("terminates repeated opaque cursors", async () => {
    server.use(http.get(`${BASE_URL}/crm/leads`, () => HttpResponse.json({ data: { data: [], has_more: true, next_cursor: "same" } })));
    await expect((await testClient().crm.leads.list()).toArray()).rejects.toThrow("repeated CRM cursor");
  });
});

describe("confirmed receipts, human decisions and write uncertainty", () => {
  it("keeps original confirmed receipts without reconstructing a version or repeating the effect", async () => {
    const calls: Request[] = [];
    server.use(http.patch(`${BASE_URL}/crm/leads/${id}`, async ({ request }) => {
      calls.push(request); expect(await request.json()).toEqual({ expected_version: 7, notes: null }); return HttpResponse.json(receipt);
    }));
    const client = testClient();
    expect(await client.crm.leads.update(id, { expected_version: 7, notes: null }, { idempotencyKey: "step-original" })).toEqual(receipt);
    expect(await client.crm.leads.update(id, { expected_version: 7, notes: null }, { idempotencyKey: "step-original" })).toEqual(receipt);
    expect(calls.map((r) => r.headers.get("Idempotency-Key"))).toEqual(["step-original", "step-original"]);
  });

  it("requires the caller's human confirmation for People merge/archive without inventing body fields", async () => {
    const people = testClient().crm.contactPeople;
    await expect(people.archive(id, { expected_version: 1 }, undefined as never)).rejects.toThrow("human confirmation");
    server.use(http.post(`${BASE_URL}/crm/contact-people/${id}/archive`, async ({ request }) => {
      expect(await request.json()).toEqual({ expected_version: 1 });
      expect(request.headers.get("humanConfirmed")).toBeNull(); return HttpResponse.json(receipt);
    }));
    expect(await people.archive(id, { expected_version: 1 }, { humanConfirmed: true })).toEqual(receipt);
  });

  it("sends native Pipeline confirmation, CAS and plan token exactly as supplied", async () => {
    const body = { expected_version: 3, plan_token: "signed-original-plan", confirmed: true as const };
    server.use(http.post(`${BASE_URL}/crm/pipelines/${id}/archive`, async ({ request }) => {
      expect(await request.json()).toEqual(body); return HttpResponse.json(receipt);
    }));
    expect(await testClient().crm.pipelines.archive(id, body)).toEqual(receipt);
  });

  it.each(["network", "server"] as const)("never retries an uncertain %s write and retains its original key", async (failure) => {
    let calls = 0;
    const client = testClient({ maxRetries: 5, fetch: async () => {
      calls++;
      if (failure === "network") throw new TypeError("network disconnected");
      return new Response(JSON.stringify({ error: { code: "infrastructure_failure", message: "Server failed" } }), { status: 500, headers: { "X-Request-Id": "original-request" } });
    } });
    const result = await client.crm.leads.create({ name: "Test" }, { idempotencyKey: "original-key", maxRetries: 10 }).catch((e: unknown) => e);
    expect(result).toBeInstanceOf(CrmUnconfirmedWriteError);
    expect(result).toMatchObject({ state: "unconfirmed", idempotencyKey: "original-key", operationId: "crmCreateLead" });
    expect(calls).toBe(1);
  });

  it("exposes native replay headers and the untouched original receipt", async () => {
    server.use(http.post(`${BASE_URL}/crm/leads`, () => HttpResponse.json(receipt, { headers: { "Idempotent-Replayed": "true", "X-Request-Id": "original-request" } })));
    let observed = false;
    const result = await testClient().crm.leads.create({ name: "Test" }, { idempotencyKey: "original-key", onResponse: (response) => {
      observed = true;
      expect(response.headers.get("Idempotent-Replayed")).toBe("true");
      expect(response.requestId).toBe("original-request");
      expect(response.data).toEqual(receipt);
    } });
    expect(result).toEqual(receipt); expect(observed).toBe(true);
  });

  it.each(["Idempotency-Key", "idempotency-key"])("preserves an idempotency header supplied as %s", async (headerName) => {
    server.use(http.post(`${BASE_URL}/crm/leads`, ({ request }) => {
      expect(request.headers.get("Idempotency-Key")).toBe("header-original"); return HttpResponse.json(receipt);
    }));
    await testClient().crm.leads.create({ name: "Test" }, { headers: { [headerName]: "header-original" } });
  });

  it("cancels a sent write without a resend and reports unconfirmed", async () => {
    let calls = 0; const controller = new AbortController();
    const client = testClient({ maxRetries: 5, fetch: async (_url, init) => {
      calls++; controller.abort(); init?.signal?.throwIfAborted(); throw new Error("unreachable");
    } });
    const result = await client.crm.leads.create({ name: "Test" }, { signal: controller.signal, idempotencyKey: "cancelled-effect" }).catch((e: unknown) => e);
    expect(result).toMatchObject({ state: "unconfirmed", idempotencyKey: "cancelled-effect" }); expect(calls).toBe(1);
  });

  it("keeps an unreadable committed response unconfirmed with the original request id", async () => {
    const client = testClient({ fetch: async () => new Response(new ReadableStream({ start(controller) { controller.error(new TypeError("disconnected body")); } }), { headers: { "X-Request-Id": "body-original" } }) });
    await expect(client.crm.leads.create({ name: "Test" }, { idempotencyKey: "body-key" })).rejects.toMatchObject({ state: "unconfirmed", idempotencyKey: "body-key", requestId: "body-original" });
  });

  it("cancels waiting for a sent write's response body and keeps its original identity", async () => {
    const controller = new AbortController();
    const client = testClient({ fetch: async () => new Response(new ReadableStream({ start(stream) {
      setTimeout(() => { controller.abort(); stream.error(new DOMException("cancelled", "AbortError")); }, 10);
    } }), { headers: { "X-Request-Id": "body-cancelled" } }) });
    await expect(client.crm.leads.create({ name: "Test" }, { signal: controller.signal, idempotencyKey: "body-cancel-key" })).rejects.toMatchObject({ state: "unconfirmed", idempotencyKey: "body-cancel-key", requestId: "body-cancelled" });
  });

  it("does not classify an already cancelled unsent write as an ambiguous effect", async () => {
    let calls = 0; const controller = new AbortController(); controller.abort();
    const client = testClient({ fetch: async () => { calls++; return new Response("{}"); } });
    const result = await client.crm.leads.create({ name: "Test" }, { signal: controller.signal }).catch((error: unknown) => error);
    expect(result).toBeInstanceOf(ConnectionError);
    expect(result).not.toBeInstanceOf(CrmUnconfirmedWriteError);
    expect(calls).toBe(0);
  });

  it("cancels a read during Retry-After waiting without another dispatch", async () => {
    let calls = 0; const controller = new AbortController();
    const client = testClient({ maxRetries: 3, fetch: async () => {
      calls++; setTimeout(() => controller.abort(), 10);
      return new Response("{}", { status: 503, headers: { "Retry-After": "10" } });
    } });
    await expect(client.crm.leads.show(id, { signal: controller.signal })).rejects.toMatchObject({ code: "request_aborted" });
    expect(calls).toBe(1);
  });

  it("preserves request_aborted when cancelling a read response body", async () => {
    const controller = new AbortController();
    const client = testClient({ fetch: async () => new Response(new ReadableStream({ start(stream) {
      setTimeout(() => { controller.abort(); stream.error(new DOMException("cancelled", "AbortError")); }, 10);
    } })) });
    await expect(client.crm.leads.show(id, { signal: controller.signal })).rejects.toMatchObject({ code: "request_aborted" });
  });

  it("cancels retry body draining for a nonterminating custom fetch stream", async () => {
    let calls = 0; const controller = new AbortController();
    const client = testClient({ maxRetries: 3, fetch: async () => {
      calls++; setTimeout(() => controller.abort(), 10);
      return new Response(new ReadableStream({ start() {} }), { status: 503 });
    } });
    await expect(client.crm.leads.show(id, { signal: controller.signal })).rejects.toMatchObject({ code: "request_aborted" });
    expect(calls).toBe(1);
  });

  it.each(["original-step", ""])("keeps the exact supplied key %j despite a lowercase default header", async (originalKey) => {
    let wireKey: string | null = null;
    const client = testClient({ defaultHeaders: { "idempotency-key": "legacy-default" }, fetch: async (_url, init) => {
      wireKey = new Headers(init?.headers).get("Idempotency-Key");
      return new Response("{}", { status: 500 });
    } });
    const result = await client.crm.leads.create({ name: "Test" }, { idempotencyKey: originalKey }).catch((error: unknown) => error);
    expect(wireKey).toBe(originalKey);
    expect(result).toMatchObject({ idempotencyKey: originalKey, state: "unconfirmed" });
  });

  it("cancels a read before fetch without retrying", async () => {
    let calls = 0; const controller = new AbortController(); controller.abort();
    const client = testClient({ fetch: async () => { calls++; return new Response("{}"); } });
    await expect(client.crm.leads.show(id, { signal: controller.signal })).rejects.toMatchObject({ code: "request_aborted" });
    expect(calls).toBe(0);
  });
});

describe("current authority and native typed errors", () => {
  it.each([{ status: 403, error: AuthenticationError }, { status: 409, error: ConflictError }, { status: 422, error: ValidationError }, { status: 429, error: RateLimitError }])("preserves the $status error envelope", async ({ status, error }) => {
    server.use(http.patch(`${BASE_URL}/crm/leads/${id}`, () => HttpResponse.json({ error: { code: status === 409 ? "crm_version_conflict" : "permission_denied", message: "Denied", param: "expected_version", request_id: "request-native", field_errors: { expected_version: ["Outdated"] } } }, { status, headers: { "Retry-After": "17" } })));
    const result = await testClient().crm.leads.update(id, { expected_version: 1 }).catch((e: unknown) => e);
    expect(result).toBeInstanceOf(error); expect(result).toMatchObject({ requestId: "request-native", param: "expected_version" });
    if (result instanceof ValidationError) expect(result.fields.expected_version).toEqual(["Outdated"]);
    if (result instanceof RateLimitError) expect(result.retryAfter).toBe(17);
  });

  it("rechecks credentials after preview and rejects revoked write access", async () => {
    server.use(
      http.post(`${BASE_URL}/crm/leads/${id}/conversion-preview`, () => HttpResponse.json({ data: { lead_id: id, plan_hash: "a".repeat(64) } })),
      http.post(`${BASE_URL}/crm/leads/${id}/convert`, () => HttpResponse.json({ error: { code: "permission_denied", message: "Revoked" } }, { status: 403 })),
    );
    const client = testClient();
    await client.crm.leads.conversionPreview(id, { strategy: "link_existing", business_contact_id: otherId, person_id: id, role_action: "preserve" });
    await expect(client.crm.leads.convert(id, { strategy: "link_existing", business_contact_id: otherId, person_id: id, role_action: "preserve", expected_version: 1, plan_hash: "a".repeat(64), confirmed: true })).rejects.toBeInstanceOf(AuthenticationError);
  });

  it("preserves every native validation issue and the original error response", async () => {
    const body = { error: { type: "invalid_request_error", code: "parameter_invalid", message: "Invalid fields", param: "email", request_id: "req-native-validation", errors: [
      { param: "email", code: "email_invalid", message: "Invalid email" },
      { param: "name", code: "required", message: "Name is required" },
      { param: "email", code: "email_not_allowed", message: "Email is not allowed" },
    ] } };
    server.use(http.post(`${BASE_URL}/crm/leads`, () => HttpResponse.json(body, { status: 422 })));
    const error = await testClient().crm.leads.create({ name: "Invalid example" }).catch((value) => value);
    expect(error).toBeInstanceOf(ValidationError);
    expect(error.fields).toEqual({ email: ["Invalid email", "Email is not allowed"], name: ["Name is required"] });
    expect(error.requestId).toBe("req-native-validation");
    expect(error.rawResponse).toEqual(body);
  });

  it("keeps instance credentials isolated and foreign UUIDs opaque", async () => {
    const headers: string[] = [];
    server.use(http.get(`${BASE_URL}/crm/leads/${id}`, ({ request }) => {
      const key = request.headers.get("Authorization")!; headers.push(key);
      return key.includes("tenant_A") ? HttpResponse.json({ data: { id } }) : HttpResponse.json({ error: { code: "resource_not_found", message: "Not found" } }, { status: 404 });
    }));
    const a = testClient({ apiKey: "fact_test_tenant_A" }); const b = testClient({ apiKey: "fact_test_tenant_B" });
    expect(await a.crm.leads.show(id)).toEqual({ data: { id } });
    await expect(b.crm.leads.show(id)).rejects.toMatchObject({ status: 404, code: "resource_not_found" });
    expect(headers).toEqual(["Bearer fact_test_tenant_A", "Bearer fact_test_tenant_B"]);
  });
});
