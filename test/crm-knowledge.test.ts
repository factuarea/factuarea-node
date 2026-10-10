import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { AuthenticationError, ConflictError, ConnectionError, CrmUnconfirmedWriteError, CRM_OPERATIONS, Factuarea, NotFoundError, RateLimitError, ServerError, ValidationError } from "../src/index.js";
import { BASE_URL, testClient } from "./helpers.js";

const id = "0199152d-525d-7000-8000-000000000001";
const otherId = "0199152d-525d-7000-8000-000000000002";
const originalKey = "persisted-native-original-intent";
const operations = CRM_OPERATIONS.filter((entry) => entry.operation.startsWith("knowledge_articles.") || entry.operation.startsWith("public_help_centers."));
type Entry = (typeof operations)[number];
interface NativeOperation { operationId: string; requestBody?: unknown; parameters?: { in: string; name: string }[]; [extension: `x-${string}`]: unknown; }
const spec = JSON.parse(readFileSync(new URL("../spec/crm-native77.json", import.meta.url), "utf8")) as { paths: Record<string, Record<string, NativeOperation>> };
const article = { id, version: 8 }; // Content is legitimately absent under the current native mask.
const category = { id, version: 4, taxonomy_id: otherId, taxonomy_version: 9, parent_id: null };
const center = { id, version: 5, slug: "synthetic-help", display_name: "Synthetic help", locale: "es", article_slugs: [], enabled: true };
const content = { title: "Synthetic article", body: "Original body", editorial_locale: "es", category_ids: [] };
const bodies: Record<string, unknown> = {
  "knowledge_articles.create": { expected_version: 0, ...content, slug: "synthetic-article" },
  "knowledge_articles.save": { expected_version: 7, ...content },
  "knowledge_articles.submit": { expected_version: 7 },
  "knowledge_articles.approve": { expected_version: 7 },
  "knowledge_articles.publish": { expected_version: 7, published_version: 2, audience: "public" },
  "knowledge_articles.unpublish": { expected_version: 7 },
  "knowledge_articles.archive": { expected_version: 7 },
  "knowledge_articles.link": { expected_version: 7, target_type: "ticket", target_id: otherId, target_version: 5 },
  "knowledge_articles.category_save": { taxonomy_id: otherId, expected_taxonomy_version: 8, expected_version: null, name: "Synthetic category", slug: "synthetic-category", parent_id: null, visibility: "internal", status: "active" },
  "public_help_centers.publish": { confirmed: true, expected_version: 0, slug: "synthetic-help", display_name: "Synthetic help", locale: "es", article_slugs: [] },
  "public_help_centers.unpublish": { confirmed: true, expected_version: 4 },
};

function receiptOperation(operation: string): string {
  if (operation === "knowledge_articles.category_receipt") return "knowledge_articles.category_save";
  return operation.replace(".receipt_", ".").replace("_receipt", "");
}

function payload(entry: Entry): unknown {
  const operation = receiptOperation(entry.operation);
  if (operation === "knowledge_articles.search") return { data: { items: [article], total: 1, page: 1, per_page: 25 } };
  if (operation === "knowledge_articles.show") return { data: article };
  if (operation === "knowledge_articles.versions") return { data: { items: [{ id, version: 8, revision_number: 2 }] } };
  if (operation === "knowledge_articles.categories") return { data: { items: [{ ...category, name: "Synthetic category", slug: "synthetic-category", visibility: "internal" }], total: 1 } };
  if (operation === "knowledge_articles.suggest") return { data: { items: [{ id, version: 8, published_version: 2, revision_number: 2, audience: "internal" }], total: 1, ticket_id: id, ticket_version: 5, audience: "internal" } };
  if (operation === "public_help_centers.administration_get") return { data: { center: null } };
  if (operation === "knowledge_articles.category_save") return { data: { operation, effect_id: otherId, expected_version: null, expected_taxonomy_version: 8, category: { ...category, version: 1 }, confirmed: true } };
  if (operation.startsWith("public_help_centers.")) return { data: { operation, effect_id: otherId, expected_version: operation.endsWith("unpublish") ? 4 : 0, center: { ...center, version: operation.endsWith("unpublish") ? 5 : 1, enabled: !operation.endsWith("unpublish") }, confirmed: true } };
  return { data: { operation, effect_id: otherId, expected_version: operation.endsWith("create") ? 0 : 7, article: operation.endsWith("create") ? { ...article, version: 1 } : article, confirmed: true } };
}

function invoke(client: Factuarea, entry: Entry, config: unknown = { idempotencyKey: originalKey, humanConfirmed: true, headers: { "X-Active-Profile": otherId } }): Promise<unknown> {
  const wire = spec.paths[entry.path]![entry.method.toLowerCase()]!;
  const args: unknown[] = (wire.parameters ?? []).filter((parameter) => parameter.in === "path").map(() => id);
  if (wire.requestBody) args.push(bodies[entry.operation]);
  if (wire.parameters?.some((parameter) => parameter.in === "query")) args.push(entry.operation === "knowledge_articles.suggest" ? { ticket_version: 5, locale: null } : { query: "Synthetic", locale: "es" });
  args.push(config);
  const [, namespace, method] = entry.sdk.split(".");
  const resource = client.crm[namespace as keyof Factuarea["crm"]] as unknown as Record<string, (...args: unknown[]) => Promise<unknown>>;
  return resource[method!]!.apply(resource, args);
}

describe("the 28 current native KnowledgeBase and administrative HelpCenter contracts", () => {
  it.each(operations)("$sdk sends the exact $method $path and native intent", async (entry) => {
    let calls = 0;
    const client = testClient({ fetch: async (input, init) => {
      calls++;
      const url = new URL(String(input));
      expect(url.pathname).toBe(`/v1${entry.path.replace(/\{[^}]+\}/g, id)}`);
      expect(init?.method).toBe(entry.method);
      const headers = new Headers(init?.headers);
      expect(headers.get("Authorization")).toBe("Bearer fact_test_secret");
      expect(headers.get("X-Active-Profile")).toBe(otherId);
      expect(headers.get("Factuarea-Version")).toBe("2026-06-01");
      const requiresKey = spec.paths[entry.path]![entry.method.toLowerCase()]!.parameters?.some((parameter) => parameter.in === "header" && parameter.name === "Idempotency-Key");
      expect(headers.get("Idempotency-Key")).toBe(requiresKey ? originalKey : null);
      expect(headers.get("humanConfirmed")).toBeNull();
      if (bodies[entry.operation]) expect(JSON.parse(String(init?.body))).toEqual(bodies[entry.operation]);
      else expect(init?.body).toBeUndefined();
      if (entry.operation === "knowledge_articles.suggest") {
        expect(url.searchParams.get("ticket_version")).toBe("5");
        expect(url.searchParams.has("locale")).toBe(false);
      }
      return Response.json(payload(entry));
    } });
    const hasKey = "requiresOriginalKey" in entry;
    const result = await invoke(client, entry, { ...(hasKey ? { idempotencyKey: originalKey } : {}), humanConfirmed: true, headers: { "X-Active-Profile": otherId } });
    if (entry.operation === "knowledge_articles.search") expect((result as { data: unknown }).data).toEqual((payload(entry) as { data: unknown }).data);
    else expect(result).toEqual(payload(entry));
    expect(calls).toBe(1);
  });

  it("records all 28 exact operation IDs and every native required scope", () => {
    expect(operations).toHaveLength(28);
    expect(operations.filter((entry) => entry.operation.startsWith("knowledge_articles."))).toHaveLength(23);
    expect(operations.filter((entry) => entry.operation.startsWith("public_help_centers."))).toHaveLength(5);
    expect(operations.filter((entry) => entry.effect)).toHaveLength(11);
    for (const entry of operations) {
      const wire = spec.paths[entry.path]![entry.method.toLowerCase()]!;
      expect(entry.operationId).toBe(wire.operationId);
      expect("scopes" in entry ? entry.scopes : undefined).toEqual(wire["x-required-scopes"]);
      expect(entry.scope).toBe(wire["x-required-scope"]);
    }
  });

  it("preserves editorial omissions, root null, and existing category CAS without adding identity", async () => {
    const requests: unknown[] = [];
    const client = testClient({ fetch: async (_input, init) => {
      const body = JSON.parse(String(init?.body)) as { expected_version: number | null; expected_taxonomy_version: number };
      requests.push(body);
      return Response.json({ data: { operation: "knowledge_articles.category_save", effect_id: otherId, expected_version: body.expected_version, expected_taxonomy_version: body.expected_taxonomy_version, category: { ...category, version: body.expected_version === null ? 1 : body.expected_version + 1, taxonomy_version: body.expected_taxonomy_version + 1 }, confirmed: true } });
    } });
    const original = bodies["knowledge_articles.category_save"] as Parameters<typeof client.crm.knowledgeArticles.categorySave>[0];
    await client.crm.knowledgeArticles.categorySave(original, { idempotencyKey: originalKey, humanConfirmed: true });
    await client.crm.knowledgeArticles.categorySave({ ...original, id, expected_version: 3 }, { idempotencyKey: "other-original-key", humanConfirmed: true });
    expect(requests).toEqual([original, { ...original, id, expected_version: 3 }]);
    expect(original).not.toHaveProperty("id");
  });
});

describe("original effect recovery", () => {
  const writes = operations.filter((entry) => entry.effect);
  it.each(writes)("$sdk keeps its original key after an uncertain write and recovers by GET only", async (entry) => {
    const calls: Array<{ method: string; path: string; key: string | null }> = [];
    const recovery = operations.find((candidate) => candidate.method === "GET" && receiptOperation(candidate.operation) === entry.operation)!;
    const client = testClient({ maxRetries: 6, fetch: async (input, init) => {
      calls.push({ method: init!.method!, path: new URL(String(input)).pathname, key: new Headers(init?.headers).get("Idempotency-Key") });
      if (init?.method !== "GET") throw new TypeError("Synthetic lost response");
      return Response.json(payload(recovery), { headers: { "X-Request-Id": "original-receipt", "Idempotent-Replayed": "true" } });
    } });
    const error = await invoke(client, entry, { idempotencyKey: originalKey, humanConfirmed: true, maxRetries: 7 }).catch((cause: unknown) => cause);
    expect(error).toBeInstanceOf(CrmUnconfirmedWriteError);
    expect(error).toMatchObject({ operationId: entry.operationId, idempotencyKey: originalKey, state: "unconfirmed" });
    let observedRequest: string | null = null;
    const recovered = await invoke(client, recovery, { idempotencyKey: (error as CrmUnconfirmedWriteError).idempotencyKey, onResponse: (response: { requestId: string | null; headers: Headers }) => { observedRequest = response.requestId; expect(response.headers.get("Idempotent-Replayed")).toBe("true"); } });
    expect(recovered).toEqual(payload(recovery));
    expect(observedRequest).toBe("original-receipt");
    expect(calls).toEqual([{ method: entry.method, path: `/v1${entry.path.replace(/\{[^}]+\}/g, id)}`, key: originalKey }, { method: "GET", path: `/v1${recovery.path}`, key: originalKey }]);
  });

  it.each(writes)("$sdk makes one attempt on 503 and retains the request id", async (entry) => {
    let calls = 0;
    const client = testClient({ maxRetries: 8, fetch: async () => { calls++; return Response.json({ error: { type: "service_unavailable_error", code: "temporary", message: "Synthetic failure" } }, { status: 503, headers: { "X-Request-Id": "uncertain-new-effect" } }); } });
    const error = await invoke(client, entry).catch((cause: unknown) => cause);
    expect(error).toBeInstanceOf(CrmUnconfirmedWriteError);
    expect(error).toMatchObject({ idempotencyKey: originalKey, requestId: "uncertain-new-effect" });
    expect((error as Error).cause).toBeInstanceOf(ServerError);
    expect(calls).toBe(1);
  });

  it.each(["invalid-json", "foreign-receipt", "missing-snapshot"] as const)("keeps %s success outcomes unconfirmed", async (scenario) => {
    const client = testClient({ fetch: async () => scenario === "invalid-json" ? new Response("broken JSON", { status: 201, headers: { "X-Request-Id": "unreadable-receipt" } }) : Response.json({ data: { confirmed: true, operation: scenario === "foreign-receipt" ? "knowledge_articles.archive" : "knowledge_articles.create", effect_id: otherId, expected_version: 0 } }) });
    const entry = writes.find((candidate) => candidate.operation === "knowledge_articles.create")!;
    const error = await invoke(client, entry).catch((cause: unknown) => cause);
    expect(error).toBeInstanceOf(CrmUnconfirmedWriteError);
    expect(error).toMatchObject({ operationId: entry.operationId, idempotencyKey: originalKey });
  });

  it.each(operations.filter((entry) => entry.method === "GET" && "requiresOriginalKey" in entry))("$sdk rejects an incomplete original receipt", async (entry) => {
    const client = testClient({ fetch: async () => Response.json({ data: { confirmed: true, operation: receiptOperation(entry.operation), effect_id: otherId } }, { headers: { "X-Request-Id": "incomplete-original" } }) });
    await expect(invoke(client, entry)).rejects.toMatchObject({ code: "crm_receipt_unreadable", requestId: "incomplete-original" });
  });

  it("rejects malformed successful recovery JSON without declaring a confirmed effect", async () => {
    const client = testClient({ fetch: async () => new Response("broken JSON", { status: 200 }) });
    await expect(client.crm.publicHelpCenters.publishReceipt({ idempotencyKey: originalKey })).rejects.toMatchObject({ code: "crm_receipt_unreadable" });
  });

  it.each(operations.filter((entry) => "requiresOriginalKey" in entry))("$sdk rejects an absent original key before transport", async (entry) => {
    let calls = 0;
    const client = testClient({ fetch: async () => { calls++; throw new Error("Must not dispatch"); } });
    await expect(invoke(client, entry, { humanConfirmed: true })).rejects.toThrow("original Idempotency-Key");
    expect(calls).toBe(0);
  });

  it.each(["", "new\nkey", "á", "x".repeat(256)])("rejects a non-native original key %j before GET", async (key) => {
    const client = testClient({ fetch: async () => { throw new Error("Must not dispatch"); } });
    await expect(client.crm.publicHelpCenters.publishReceipt({ idempotencyKey: key })).rejects.toThrow("original Idempotency-Key");
  });

  it("requires local review for Knowledge writes without changing the native body", async () => {
    const client = testClient({ fetch: async () => { throw new Error("Must not dispatch"); } });
    await expect(client.crm.knowledgeArticles.archive(id, { expected_version: 7 }, { idempotencyKey: originalKey } as never)).rejects.toThrow("human confirmation");
  });

  it("rejects unsafe original CAS before serializing a rounded intention", async () => {
    const client = testClient({ fetch: async () => { throw new Error("Must not dispatch"); } });
    await expect(client.crm.knowledgeArticles.link(id, { expected_version: 7, target_type: "ticket", target_id: otherId, target_version: Number.MAX_SAFE_INTEGER + 1 }, { idempotencyKey: originalKey, humanConfirmed: true })).rejects.toThrow("target_version must be an exact JavaScript safe integer");
    await expect(client.crm.knowledgeArticles.suggest(id, { ticket_version: Number.MAX_SAFE_INTEGER + 1 })).rejects.toThrow("ticket_version must be an exact JavaScript safe integer");
  });

  it("rejects unsafe receipt CAS without returning a rounded original version", async () => {
    const entry = writes.find((candidate) => candidate.operation === "knowledge_articles.save")!;
    const native = structuredClone(payload(entry)) as { data: { article: { version: number } } };
    native.data.article.version = Number.MAX_SAFE_INTEGER + 1;
    const client = testClient({ fetch: async () => Response.json(native) });
    await expect(invoke(client, entry)).rejects.toMatchObject({ state: "unconfirmed", idempotencyKey: originalKey });
    await expect(client.crm.knowledgeArticles.receiptSave({ idempotencyKey: originalKey })).rejects.toThrow("version must be an exact JavaScript safe integer");
  });

  it("normalizes header case to exactly one original key", async () => {
    const client = testClient({ fetch: async (_input, init) => {
      expect(new Headers(init?.headers).get("Idempotency-Key")).toBe(originalKey);
      return Response.json(payload(operations.find((entry) => entry.operation === "knowledge_articles.receipt_save")!));
    } });
    await client.crm.knowledgeArticles.receiptSave({ idempotencyKey: originalKey, headers: { "idempotency-key": "discarded-conflicting-key" } });
  });
});

describe("current native errors and cancellation", () => {
  it.each([
    [403, AuthenticationError, "current_scope_denied"],
    [404, NotFoundError, "original_receipt_not_found"],
    [409, ConflictError, "original_effect_ambiguous"],
    [422, ValidationError, "parameter_invalid"],
    [429, RateLimitError, "rate_limit_exceeded"],
  ] as const)("preserves the original native %s receipt error and current fields", async (status, errorClass, code) => {
    const native = { error: { type: "invalid_request_error", code, message: "Synthetic native response", request_id: "current-native-request", errors: [{ param: "expected_version", code: "stale", message: "Original version changed" }, { param: "parent_id", code: "invalid", message: "Parent unavailable" }], details: { current_fields: { version: 9, title: null }, masked: true } } };
    const client = testClient({ fetch: async () => Response.json(native, { status, headers: { "Retry-After": "12", "X-Request-Id": "current-native-request" } }) });
    const error = await client.crm.knowledgeArticles.receiptSave({ idempotencyKey: originalKey, maxRetries: 0 }).catch((cause: unknown) => cause);
    expect(error).toBeInstanceOf(errorClass);
    expect(error).toMatchObject({ status, code, requestId: "current-native-request", rawResponse: native });
    if (error instanceof ValidationError) expect(error.fields).toEqual({ expected_version: ["Original version changed"], parent_id: ["Parent unavailable"] });
    if (error instanceof RateLimitError) expect(error.retryAfter).toBe(12);
  });

  it("rechecks receipt authority after a confirmed write without replaying the command", async () => {
    const methods: string[] = [];
    const entry = operations.find((candidate) => candidate.operation === "public_help_centers.publish")!;
    const client = testClient({ fetch: async (_input, init) => {
      methods.push(init!.method!);
      return init?.method === "GET" ? Response.json({ error: { type: "authorization_error", code: "credential_revoked", message: "Synthetic current denial" } }, { status: 403 }) : Response.json(payload(entry));
    } });
    await invoke(client, entry);
    await expect(client.crm.publicHelpCenters.publishReceipt({ idempotencyKey: originalKey })).rejects.toMatchObject({ code: "credential_revoked", status: 403 });
    expect(methods).toEqual(["POST", "GET"]);
  });

  it("cancellation before dispatch leaves the intention undispatched", async () => {
    const controller = new AbortController(); controller.abort();
    const client = testClient({ fetch: async () => { throw new Error("Must not dispatch"); } });
    const error = await client.crm.knowledgeArticles.archive(id, { expected_version: 7 }, { idempotencyKey: originalKey, humanConfirmed: true, signal: controller.signal }).catch((cause: unknown) => cause);
    expect(error).toBeInstanceOf(ConnectionError);
    expect(error).not.toBeInstanceOf(CrmUnconfirmedWriteError);
    expect(error).toMatchObject({ code: "request_aborted" });
  });

  it("cancellation while reading a write receipt retains its original key", async () => {
    const controller = new AbortController();
    const client = testClient({ fetch: async () => {
      const response = new Response(new ReadableStream({ start() { queueMicrotask(() => controller.abort()); } }), { status: 200 });
      return response;
    } });
    const error = await client.crm.knowledgeArticles.archive(id, { expected_version: 7 }, { idempotencyKey: originalKey, humanConfirmed: true, signal: controller.signal }).catch((cause: unknown) => cause);
    expect(error).toBeInstanceOf(CrmUnconfirmedWriteError);
    expect(error).toMatchObject({ idempotencyKey: originalKey });
  });
});

describe("native Knowledge search pagination", () => {
  it("walks all native pages preserving masks, locale, query and response context", async () => {
    const urls: URL[] = [];
    const requestIds: Array<string | null> = [];
    const client = testClient({ fetch: async (input, init) => {
      const url = new URL(String(input)); urls.push(url);
      expect(new Headers(init?.headers).get("X-Active-Profile")).toBe(otherId);
      const page = Number(url.searchParams.get("page") ?? 1);
      return Response.json({ data: { items: [{ id: page === 1 ? id : otherId, version: 1 }], total: 2, page, per_page: 1 } }, { headers: { "X-Request-Id": `knowledge-${page}` } });
    } });
    const page = await client.crm.knowledgeArticles.search({ query: "Synthetic text", locale: "ca", per_page: 1 }, { headers: { "X-Active-Profile": otherId }, onResponse: (response) => requestIds.push(response.requestId) });
    expect(page.data).toEqual({ items: [{ id, version: 1 }], total: 2, page: 1, per_page: 1 });
    expect(await page.toArray()).toEqual([{ id, version: 1 }, { id: otherId, version: 1 }]);
    expect(requestIds).toEqual(["knowledge-1", "knowledge-2"]);
    expect(urls[1]!.searchParams.get("page")).toBe("2");
    for (const url of urls) { expect(url.searchParams.get("query")).toBe("Synthetic text"); expect(url.searchParams.get("locale")).toBe("ca"); expect(url.searchParams.get("per_page")).toBe("1"); }
  });

  it("rejects an unrelated pagination envelope", async () => {
    const client = testClient({ fetch: async () => Response.json({ data: [], meta: { total: 0, current_page: 1 } }) });
    await expect(client.crm.knowledgeArticles.search()).rejects.toThrow("incompatible Knowledge article search response");
  });

  it("terminates repeated native page numbers", async () => {
    const client = testClient({ fetch: async () => Response.json({ data: { items: [], total: 2, page: 1, per_page: 1 } }) });
    await expect((await client.crm.knowledgeArticles.search()).toArray()).rejects.toThrow("repeated Knowledge article page");
  });

  it("carries cancellation to subsequent pages", async () => {
    let calls = 0;
    const controller = new AbortController();
    const client = testClient({ fetch: async () => { calls++; return Response.json({ data: { items: [article], total: 2, page: 1, per_page: 1 } }); } });
    const page = await client.crm.knowledgeArticles.search(undefined, { signal: controller.signal });
    controller.abort();
    await expect(page.getNextPage()).rejects.toMatchObject({ code: "request_aborted" });
    expect(calls).toBe(1);
  });
});
