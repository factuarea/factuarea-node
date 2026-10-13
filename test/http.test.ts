import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { BASE_URL, server, testClient, useMockServer } from "./helpers.js";
import { DEFAULT_FACTUAREA_VERSION, ServerError } from "../src/index.js";

useMockServer();

describe("HttpClient auth & headers", () => {
  it("sends the API key as a Bearer token", async () => {
    let authHeader: string | null = null;
    server.use(
      http.get(`${BASE_URL}/account`, ({ request }) => {
        authHeader = request.headers.get("authorization");
        return HttpResponse.json({ object: "account" });
      }),
    );

    await testClient().account.show();
    expect(authHeader).toBe("Bearer fact_test_secret");
  });

  it("derives the environment from the key prefix", () => {
    expect(testClient({ apiKey: "fact_test_x" }).environment).toBe("test");
    expect(testClient({ apiKey: "fact_live_x" }).environment).toBe("live");
    expect(testClient({ apiKey: "something_else" }).environment).toBe("unknown");
  });

  it("sends the pinned Factuarea-Version and a User-Agent without the key", async () => {
    let version: string | null = null;
    let userAgent: string | null = null;
    server.use(
      http.get(`${BASE_URL}/account`, ({ request }) => {
        version = request.headers.get("factuarea-version");
        userAgent = request.headers.get("user-agent");
        return HttpResponse.json({ object: "account" });
      }),
    );

    await testClient().account.show();
    expect(version).toBe(DEFAULT_FACTUAREA_VERSION);
    expect(userAgent).toMatch(/^factuarea-node\/\d/);
    expect(userAgent).not.toContain("fact_test_secret");
  });

  it("throws synchronously when apiKey is missing", () => {
    expect(() => testClient({ apiKey: undefined })).toThrow(/apiKey/);
  });

  it("requestId is surfaced from the X-Request-Id header on success", async () => {
    server.use(
      http.get(`${BASE_URL}/account`, () =>
        HttpResponse.json({ object: "account" }, { headers: { "X-Request-Id": "req_123" } }),
      ),
    );
    const response = await testClient().http.request<{ object: string }>({
      method: "GET",
      path: "/account",
    });
    expect(response.requestId).toBe("req_123");
  });
});

describe("Idempotency-Key", () => {
  it("adds a UUID Idempotency-Key to POST requests", async () => {
    let key: string | null = null;
    server.use(
      http.post(`${BASE_URL}/contacts`, ({ request }) => {
        key = request.headers.get("idempotency-key");
        return HttpResponse.json({ id: "c1" }, { status: 201 });
      }),
    );

    await testClient().contacts.create({ name: "ACME" });
    expect(key).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("does NOT add an Idempotency-Key to GET requests", async () => {
    let key: string | null = "unset";
    server.use(
      http.get(`${BASE_URL}/account`, ({ request }) => {
        key = request.headers.get("idempotency-key");
        return HttpResponse.json({ object: "account" });
      }),
    );

    await testClient().account.show();
    expect(key).toBeNull();
  });

  it("respects a user-provided Idempotency-Key", async () => {
    let key: string | null = null;
    server.use(
      http.post(`${BASE_URL}/contacts`, ({ request }) => {
        key = request.headers.get("idempotency-key");
        return HttpResponse.json({ id: "c1" }, { status: 201 });
      }),
    );

    await testClient().contacts.create({ name: "ACME" }, { idempotencyKey: "my-key-123" });
    expect(key).toBe("my-key-123");
  });

  it("reuses the same Idempotency-Key across retries", async () => {
    const seenKeys: string[] = [];
    let calls = 0;
    server.use(
      http.post(`${BASE_URL}/contacts`, ({ request }) => {
        seenKeys.push(request.headers.get("idempotency-key") ?? "");
        calls += 1;
        if (calls === 1) {
          return HttpResponse.json({ error: { type: "api_error" } }, { status: 503 });
        }
        return HttpResponse.json({ id: "c1" }, { status: 201 });
      }),
    );

    await testClient({ maxRetries: 1 }).contacts.create({ name: "ACME" });
    expect(seenKeys).toHaveLength(2);
    expect(seenKeys[0]).toBe(seenKeys[1]);
  });
});

describe("native original JSON transport", () => {
  it("preserves exact UTF-8 wire bytes and explicit headers while a server failure stays one attempt", async () => {
    const originalWire = '{\n  "name": "acción", "expected_version": 9007199254740993\n}\n';
    let calls = 0;
    let sentBody: BodyInit | null | undefined;
    let sentHeaders: Headers | undefined;
    const client = testClient({
      maxRetries: 3,
      defaultHeaders: { "content-type": "text/plain", "idempotency-key": "stale-default", "X-Active-Profile": "fixture-A" },
      fetch: async (_input, init) => {
        calls++;
        sentBody = init?.body;
        sentHeaders = new Headers(init?.headers);
        return Response.json({ error: { type: "service_unavailable_error", code: "effect_unknown", message: "Unconfirmed" } }, {
          status: 503,
          headers: { "X-Request-Id": "request-original-wire" },
        });
      },
    });

    const error = await client.http.requestOriginalJson({
      method: "PATCH",
      path: "/crm/leads/0199152d-525d-7000-8000-000000000001",
      rawJsonBody: originalWire,
      idempotencyKey: "original-step-A",
    }).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ServerError);
    expect(error).toMatchObject({ code: "effect_unknown", requestId: "request-original-wire" });
    expect(calls).toBe(1);
    expect(sentBody).toBe(originalWire);
    expect(sentHeaders?.get("Content-Type")).toBe("application/json");
    expect(sentHeaders?.get("Idempotency-Key")).toBe("original-step-A");
    expect(sentHeaders?.get("X-Active-Profile")).toBe("fixture-A");
  });

  it("can suppress every inherited idempotency key for a native operation without an original ledger", async () => {
    let calls = 0;
    let sentHeaders: Headers | undefined;
    const client = testClient({
      defaultHeaders: { "Idempotency-Key": "must-not-be-inherited" },
      fetch: async (_input, init) => {
        calls++;
        sentHeaders = new Headers(init?.headers);
        return Response.json({ data: { accepted: true } });
      },
    });

    await client.http.requestOriginalJson({ method: "POST", path: "/crm/preview", rawJsonBody: "{}", autoIdempotency: false });

    expect(calls).toBe(1);
    expect(sentHeaders?.get("Idempotency-Key")).toBeNull();
  });
});
