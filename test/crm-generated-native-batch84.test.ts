import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  AuthenticationError, ConflictError, ConnectionError, CrmMetaNativeBatch80,
  Factuarea, FactuareaError, Page, RateLimitError, ServerError, ValidationError,
} from "../src/index.js";

type Operation = {
  operationId: string;
  "x-speakeasy-group": string;
};
const spec = JSON.parse(readFileSync(new URL("../spec/openapi.json", import.meta.url), "utf8")) as {
  paths: Record<string, Record<string, Operation>>;
};
const baseUrl = "https://generated-sdk.invalid/v1";
const sha = "a".repeat(64);
const id = "01900000-0000-7000-8000-000000000001";
const methods = new Set(["get", "post", "put", "patch", "delete"]);

// Namespace and action come only from the embedded producer contract and the
// existing SDK naming rule. Tests never provide missing producer metadata.
function method(client: Factuarea, path: string, verb = "get"): (...args: unknown[]) => Promise<unknown> {
  const operation = spec.paths[path]?.[verb];
  if (!operation) throw new Error(`Missing actual operation ${verb} ${path}`);
  if (!operation["x-speakeasy-group"]) throw new Error(`Missing actual group ${operation.operationId}`);
  let resource: unknown = client.resources;
  for (const segment of operation["x-speakeasy-group"].split(".")) {
    resource = (resource as Record<string, unknown>)[segment];
  }
  const action = operation.operationId.replace("public-api.v1.", "").split(".").at(-1)!
    .replace(/-/g, "_").replace(/_([^_])/g, (_match, letter: string) => letter.toUpperCase());
  const callable = (resource as Record<string, unknown>)[action];
  if (typeof callable !== "function") throw new Error(`Missing generated method ${operation.operationId}`);
  return callable.bind(resource) as (...args: unknown[]) => Promise<unknown>;
}

function client(fetch: typeof globalThis.fetch, bearer: string | (() => Promise<string> | string) = "current-native-token"): Factuarea {
  return new Factuarea({ oauthBearer: bearer, baseUrl, fetch, maxRetries: 7 });
}
function page(rows: unknown[], next: string | null): Response {
  return Response.json({ data: { data: rows, has_more: next !== null, next_cursor: next } });
}

describe("actual development CRM generated resources batch84", () => {
  it("represents every real CRM operation without replacing the existing native helpers", () => {
    const sdk = client(async () => Response.json({}));
    const native = Object.entries(spec.paths).flatMap(([path, operations]) =>
      Object.keys(operations).filter(verb => methods.has(verb) && path.startsWith("/crm/"))
        .map(verb => ({ path, verb })));
    expect(native).toHaveLength(288);
    for (const operation of native) expect(method(sdk, operation.path, operation.verb)).toBeTypeOf("function");
    expect(sdk.crm.prepareLeadCreate).toBeTypeOf("function");
    expect(sdk.crmOriginals.getLeadCreateOriginal).toBeTypeOf("function");
    expect(sdk.whatsapp.prepareCrmWhatsAppMessage).toBeTypeOf("function");
    expect(CrmMetaNativeBatch80).toBeTypeOf("function");
    expect(sdk.resources).not.toBe(sdk.crm);
    expect(sdk.resources.account).toBe(sdk.account);
  });

  it("reads actual nested Lead pages with fresh bearer, retained query and request IDs", async () => {
    let token = "parent-token", calls = 0;
    const sdk = client(async (url, init) => {
      calls++;
      const actual = new URL(String(url));
      expect(actual.pathname).toBe("/v1/crm/leads");
      expect(actual.searchParams.get("limit")).toBe("1");
      expect(actual.searchParams.get("search")).toBe("current");
      expect(actual.searchParams.get("cursor")).toBe(calls === 1 ? null : "opaque-next");
      expect(new Headers(init?.headers).get("Authorization")).toBe(`Bearer ${token}`);
      expect(new Headers(init?.headers).get("X-Active-Profile")).toBe("human-selected-profile");
      expect(init?.redirect).toBe("error");
      const response = page([{ id: calls === 1 ? id : "01900000-0000-7000-8000-000000000002" }], calls === 1 ? "opaque-next" : null);
      response.headers.set("X-Request-Id", `page-${calls}`);
      return response;
    }, () => token);
    const first = await method(sdk, "/crm/leads")({ limit: 1, search: "current" }, { headers: { "X-Active-Profile": "human-selected-profile" } }) as Page<{ id: string }>;
    expect(first.data).toEqual([{ id }]);
    expect(first.requestId).toBe("page-1");
    token = "real-successor-token";
    const second = await first.getNextPage();
    expect(second?.data).toHaveLength(1);
    expect(second?.requestId).toBe("page-2");
    expect(await second?.getNextPage()).toBeNull();
    expect(calls).toBe(2);
  });

  it("retains AbortSignal across nested pages and never dispatches the cancelled continuation", async () => {
    let calls = 0;
    const abort = new AbortController();
    const sdk = client(async () => { calls++; return page([{ id }], "next"); });
    const first = await method(sdk, "/crm/leads")({}, { signal: abort.signal }) as Page<unknown>;
    abort.abort("human cancelled");
    await expect(first.getNextPage()).rejects.toBeInstanceOf(ConnectionError);
    expect(calls).toBe(1);
  });

  it.each([503, 429, "connection"] as const)("does not retry an actual API-key Lead command after %s", async failure => {
    let calls = 0;
    const sdk = new Factuarea({ apiKey: "fact_test_actual_singleton", baseUrl, maxRetries: 8, fetch: async (_url, init) => {
      calls++;
      expect(init?.redirect).toBe("error");
      expect(new Headers(init?.headers).get("Authorization")).toBe("Bearer fact_test_actual_singleton");
      if (failure === "connection") throw new TypeError("transport outcome unknown");
      return Response.json({ error: { message: "current native rejection" } }, { status: failure, headers: { "Retry-After": "1" } });
    } });
    await expect(method(sdk, "/crm/leads", "post")({ name: "Draft" }, { idempotencyKey: "retained key", maxRetries: 8 }))
      .rejects.toBeInstanceOf(failure === "connection" ? ConnectionError : failure === 429 ? RateLimitError : ServerError);
    expect(calls).toBe(1);
  });

  it("captures JSON, key and profile before resolving the actual current OAuth provider", async () => {
    let resolveToken!: (value: string) => void;
    const pendingToken = new Promise<string>(resolve => { resolveToken = resolve; });
    const body = { name: "Original", notes: null };
    const config = { idempotencyKey: "first key", headers: { "X-Active-Profile": "first-profile" } };
    let calls = 0;
    const sdk = client(async (_url, init) => {
      calls++;
      expect(init?.body).toBe('{"name":"Original","notes":null}');
      expect(new Headers(init?.headers).get("Idempotency-Key")).toBe("first key");
      expect(new Headers(init?.headers).get("X-Active-Profile")).toBe("first-profile");
      expect(new Headers(init?.headers).get("Authorization")).toBe("Bearer actual-token");
      return Response.json({ data: { id } }, { status: 201 });
    }, () => pendingToken);
    const result = method(sdk, "/crm/leads", "post")(body, config);
    body.name = "Changed";
    config.idempotencyKey = "changed key";
    config.headers["X-Active-Profile"] = "changed-profile";
    resolveToken("actual-token");
    expect(await result).toEqual({ data: { id } });
    expect(calls).toBe(1);
  });

  it("also prevents retries on the actual native command branch without x-crm-operation", async () => {
    let calls = 0;
    const sdk = new Factuarea({ apiKey: "fact_test_actual_singleton", baseUrl, maxRetries: 8, fetch: async (_url, init) => {
      calls++;
      expect(init?.method).toBe("POST");
      expect(init?.redirect).toBe("error");
      return Response.json({ error: { message: "Unconfirmed native request" } }, { status: 503 });
    } });
    await expect(method(sdk, "/crm/crmdatagovernance/requests/preview", "post")({ subject_type: "lead", subject_id: id, operation: "export", purpose: "human_export" }, { maxRetries: 8 })).rejects.toBeInstanceOf(ServerError);
    expect(calls).toBe(1);
  });

  it("requires the exact retained Original GET key and preserves current unconfirmed data", async () => {
    let calls = 0;
    const sdk = client(async (url, init) => {
      calls++;
      expect(new URL(String(url)).pathname).toBe("/v1/crm/leads/create/original");
      expect([...new URL(String(url)).searchParams]).toEqual([["original_body_sha256", sha]]);
      expect(init?.body).toBeUndefined();
      expect(init?.redirect).toBe("error");
      expect(new Headers(init?.headers).get("Idempotency-Key")).toBe("raw original key");
      return Response.json({ data: { state: "unconfirmed", original_body_sha256: sha, original_response: null }, meta: { authorization_version: "current-C7" } });
    });
    const get = method(sdk, "/crm/leads/create/original");
    for (const config of [undefined, { idempotencyKey: " key " }, { idempotencyKey: "x".repeat(256) }, { idempotencyKey: "first", headers: { "idempotency-key": "second" } }]) {
      await expect(get({ original_body_sha256: sha }, config)).rejects.toBeInstanceOf(TypeError);
    }
    expect(calls).toBe(0);
    expect(await get({ original_body_sha256: sha }, { idempotencyKey: "raw original key" }))
      .toEqual({ data: { state: "unconfirmed", original_body_sha256: sha, original_response: null }, meta: { authorization_version: "current-C7" } });
    expect(calls).toBe(1);
  });

  it.each([422, 409, 403, 429] as const)("preserves the typed native %s rejection without retrying", async status => {
    let calls = 0;
    const sdk = client(async () => {
      calls++;
      return Response.json({ error: { message: "Current field guard", code: "current_guard", request_id: "support-id", field_errors: { name: ["Not admitted"] } } }, { status, headers: { "Retry-After": "7" } });
    });
    const error = await method(sdk, "/crm/leads", "post")({ name: "Draft" }).catch(value => value);
    expect(error).toBeInstanceOf(status === 422 ? ValidationError : status === 409 ? ConflictError : status === 403 ? AuthenticationError : RateLimitError);
    if (!(error instanceof FactuareaError)) throw error;
    expect(error.code).toBe("current_guard");
    expect(error.requestId).toBe("support-id");
    if (error instanceof ValidationError) expect(error.fields).toEqual({ name: ["Not admitted"] });
    if (error instanceof RateLimitError) expect(error.retryAfter).toBe(7);
    expect(calls).toBe(1);
  });

  it("isolates actual credentials and Company/profile headers across generated clients", async () => {
    const seen: Array<[string | null, string | null]> = [];
    const fetch: typeof globalThis.fetch = async (_url, init) => {
      const headers = new Headers(init?.headers);
      seen.push([headers.get("Authorization"), headers.get("X-Active-Profile")]);
      return Response.json({ error: { message: "Current Company denied" } }, { status: 403 });
    };
    const one = client(fetch, "actual-token-one");
    const two = new Factuarea({ apiKey: "fact_test_actual_two", baseUrl, fetch });
    await expect(method(one, "/crm/leads")({}, { headers: { "X-Active-Profile": "company-one" } })).rejects.toBeInstanceOf(AuthenticationError);
    await expect(method(two, "/crm/leads")({}, { headers: { "X-Active-Profile": "company-two" } })).rejects.toBeInstanceOf(AuthenticationError);
    expect(seen).toEqual([["Bearer actual-token-one", "company-one"], ["Bearer fact_test_actual_two", "company-two"]]);
  });

  it("preserves non-Page native cursor envelopes instead of dropping their actual fields", async () => {
    const wire = { data: { options: [], authorization_version: "current-C7" }, next_cursor: "opaque-continuation" };
    const sdk = client(async () => Response.json(wire));
    expect(await method(sdk, "/crm/configuration/options")({ cursor: "human-selected-cursor" })).toEqual(wire);
  });

  it("rejects malformed nested pages instead of reporting a fabricated empty collection", async () => {
    for (const wire of [{ data: [] }, { data: { data: [], has_more: true, next_cursor: null } }, { data: { data: {}, has_more: false, next_cursor: null } }]) {
      const sdk = client(async () => Response.json(wire));
      await expect(method(sdk, "/crm/leads")()).rejects.toBeInstanceOf(TypeError);
    }
  });
});
