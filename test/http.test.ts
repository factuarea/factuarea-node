import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { BASE_URL, server, testClient, useMockServer } from "./helpers.js";
import { DEFAULT_FACTUAREA_VERSION } from "../src/index.js";

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
      http.post(`${BASE_URL}/clients`, ({ request }) => {
        key = request.headers.get("idempotency-key");
        return HttpResponse.json({ id: "c1" }, { status: 201 });
      }),
    );

    await testClient().clients.create({ name: "ACME" });
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
      http.post(`${BASE_URL}/clients`, ({ request }) => {
        key = request.headers.get("idempotency-key");
        return HttpResponse.json({ id: "c1" }, { status: 201 });
      }),
    );

    await testClient().clients.create({ name: "ACME" }, { idempotencyKey: "my-key-123" });
    expect(key).toBe("my-key-123");
  });

  it("reuses the same Idempotency-Key across retries", async () => {
    const seenKeys: string[] = [];
    let calls = 0;
    server.use(
      http.post(`${BASE_URL}/clients`, ({ request }) => {
        seenKeys.push(request.headers.get("idempotency-key") ?? "");
        calls += 1;
        if (calls === 1) {
          return HttpResponse.json({ error: { type: "api_error" } }, { status: 503 });
        }
        return HttpResponse.json({ id: "c1" }, { status: 201 });
      }),
    );

    await testClient({ maxRetries: 1 }).clients.create({ name: "ACME" });
    expect(seenKeys).toHaveLength(2);
    expect(seenKeys[0]).toBe(seenKeys[1]);
  });
});
