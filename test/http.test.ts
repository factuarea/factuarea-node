import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { BASE_URL, COMPANY, COMPANY_URL, server, testClient, useMockServer } from "./helpers.js";
import { ConnectionError, DEFAULT_FACTUAREA_VERSION, ValidationError } from "../src/index.js";

useMockServer();

describe("HttpClient auth & headers", () => {
  it("sends the API key as a Bearer token", async () => {
    let authHeader: string | null = null;
    server.use(
      http.get(`${BASE_URL}/me`, ({ request }) => {
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
      http.get(`${BASE_URL}/me`, ({ request }) => {
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
      http.get(`${BASE_URL}/me`, () =>
        HttpResponse.json({ object: "account" }, { headers: { "X-Request-Id": "req_123" } }),
      ),
    );
    const response = await testClient().http.request<{ object: string }>({
      method: "GET",
      path: "/me",
    });
    expect(response.requestId).toBe("req_123");
  });
});

describe("Idempotency-Key", () => {
  it("adds a UUID Idempotency-Key to POST requests", async () => {
    let key: string | null = null;
    server.use(
      http.post(`${COMPANY_URL}/contacts`, ({ request }) => {
        key = request.headers.get("idempotency-key");
        return HttpResponse.json({ id: "c1" }, { status: 201 });
      }),
    );

    await testClient().contacts.create(COMPANY, { name: "ACME" } as never);
    expect(key).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("does NOT add an Idempotency-Key to GET requests", async () => {
    let key: string | null = "unset";
    server.use(
      http.get(`${BASE_URL}/me`, ({ request }) => {
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
      http.post(`${COMPANY_URL}/contacts`, ({ request }) => {
        key = request.headers.get("idempotency-key");
        return HttpResponse.json({ id: "c1" }, { status: 201 });
      }),
    );

    await testClient().contacts.create(COMPANY, { name: "ACME" } as never, { idempotencyKey: "my-key-123" });
    expect(key).toBe("my-key-123");
  });

  it("reuses the same Idempotency-Key across retries", async () => {
    const seenKeys: string[] = [];
    let calls = 0;
    server.use(
      http.post(`${COMPANY_URL}/contacts`, ({ request }) => {
        seenKeys.push(request.headers.get("idempotency-key") ?? "");
        calls += 1;
        if (calls === 1) {
          return HttpResponse.json({ error: { type: "api_error" } }, { status: 503 });
        }
        return HttpResponse.json({ id: "c1" }, { status: 201 });
      }),
    );

    await testClient({ maxRetries: 1 }).contacts.create(COMPANY, { name: "ACME" } as never);
    expect(seenKeys).toHaveLength(2);
    expect(seenKeys[0]).toBe(seenKeys[1]);
  });
});

describe("request body presence on the wire", () => {
  async function wireBody(body: Record<string, unknown>): Promise<string> {
    let seen = "";
    server.use(
      http.patch(`${COMPANY_URL}/series/s1`, async ({ request }) => {
        seen = await request.text();
        return HttpResponse.json({ data: {} });
      }),
    );
    await testClient().series.update(COMPANY, "s1", body as never);
    return seen;
  }

  it("sends null, empty string, empty array, false and 0 as given", async () => {
    expect(await wireBody({ pdf_template_id: null, name: "", year_reset: false, initial_number: 0 })).toBe(
      '{"pdf_template_id":null,"name":"","year_reset":false,"initial_number":0}',
    );
    expect(await wireBody({ tags: [] })).toBe('{"tags":[]}');
  });

  it("drops only the keys that are undefined", async () => {
    expect(await wireBody({ name: undefined, code: "A" })).toBe('{"code":"A"}');
    expect(await wireBody({})).toBe("{}");
  });
});

describe("declared request headers", () => {
  it("sends If-Match, If-None-Match and caller headers together, without inventing others", async () => {
    let headers: Headers | undefined;
    server.use(
      http.patch(`${COMPANY_URL}/pdf-templates/t1`, ({ request }) => {
        headers = request.headers;
        return HttpResponse.json({ data: {} });
      }),
    );
    await testClient().pdfTemplates.update(COMPANY, "t1", { name: "A" }, { ifMatch: '"v1"', headers: { "X-Correlation-Id": "c1" }, idempotencyKey: "k" });
    expect(headers?.get("if-match")).toBe('"v1"');
    expect(headers?.get("x-correlation-id")).toBe("c1");
    expect(headers?.get("idempotency-key")).toBe("k");
    expect(headers?.has("if-none-match")).toBe(false);
  });
});

describe("faithful errors", () => {
  it("keeps error.errors[], error.details and the response headers", async () => {
    server.use(
      http.post(`${COMPANY_URL}/pdf-templates`, () =>
        HttpResponse.json(
          {
            error: {
              type: "invalid_request_error",
              code: "parameter_invalid",
              message: "Invalid",
              param: "name",
              errors: [{ param: "name", code: "parameter_missing", message: "Falta", allowed_values: ["a"] }],
              details: { allowed_values: ["a"] },
              request_id: "req-9",
            },
          },
          { status: 422, headers: { ETag: '"e"' } },
        ),
      ),
    );
    const error = (await testClient().pdfTemplates.create(COMPANY, { name: "" }).catch((e) => e)) as ValidationError;
    expect(error).toBeInstanceOf(ValidationError);
    expect(error.errors).toEqual([{ param: "name", code: "parameter_missing", message: "Falta", allowed_values: ["a"] }]);
    expect(error.details).toEqual({ allowed_values: ["a"] });
    expect(error.fields).toEqual({ name: ["Falta"] });
    expect(error.requestId).toBe("req-9");
    expect(error.headers?.get("etag")).toBe('"e"');
  });
});

describe("AbortSignal", () => {
  it("aborts a call in flight without retrying, even with retries enabled", async () => {
    let calls = 0;
    const controller = new AbortController();
    server.use(
      http.get(`${COMPANY_URL}/pdf-templates/t1`, async () => {
        calls += 1;
        controller.abort();
        await new Promise((resolve) => setTimeout(resolve, 50));
        return HttpResponse.json({ data: {} });
      }),
    );
    const error = await testClient({ maxRetries: 3 }).pdfTemplates.find(COMPANY, "t1", { signal: controller.signal }).catch((e) => e);
    expect(error).toBeInstanceOf(ConnectionError);
    expect((error as ConnectionError).message).toContain("aborted");
    expect(calls).toBe(1);
  });

  it("does not send anything when the signal is already aborted", async () => {
    let calls = 0;
    server.use(
      http.get(`${COMPANY_URL}/pdf-templates/t1`, () => {
        calls += 1;
        return HttpResponse.json({ data: {} });
      }),
    );
    const error = await testClient().pdfTemplates.find(COMPANY, "t1", { signal: AbortSignal.abort() }).catch((e) => e);
    expect(error).toBeInstanceOf(ConnectionError);
    expect(calls).toBe(0);
  });
});
