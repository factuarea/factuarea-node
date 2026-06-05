import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { BASE_URL, server, testClient, useMockServer } from "./helpers.js";
import {
  AuthenticationError,
  ConflictError,
  ConnectionError,
  FactuareaError,
  NotFoundError,
  RateLimitError,
  ServerError,
  ValidationError,
} from "../src/index.js";

useMockServer();

function envelope(type: string, code: string, extra: Record<string, unknown> = {}) {
  return { error: { type, code, message: "boom", request_id: "req_abc", ...extra } };
}

describe("error envelope mapping", () => {
  const cases: Array<[number, Record<string, unknown>, new (...args: never[]) => FactuareaError]> = [
    [401, envelope("authentication_error", "missing_api_key"), AuthenticationError],
    [403, envelope("permission_error", "insufficient_scope"), AuthenticationError],
    [404, envelope("not_found_error", "resource_not_found"), NotFoundError],
    [409, envelope("conflict_error", "resource_already_exists"), ConflictError],
    [422, envelope("invalid_request_error", "parameter_invalid"), ValidationError],
    [500, envelope("api_error", "server_error"), ServerError],
    [503, envelope("service_unavailable_error", "unavailable"), ServerError],
  ];

  for (const [status, body, ErrorClass] of cases) {
    it(`maps HTTP ${status} to ${ErrorClass.name}`, async () => {
      server.use(http.get(`${BASE_URL}/account`, () => HttpResponse.json(body, { status })));
      const error = await testClient().account.show().catch((e) => e);
      expect(error).toBeInstanceOf(ErrorClass);
      expect(error).toBeInstanceOf(FactuareaError);
      expect((error as FactuareaError).requestId).toBe("req_abc");
      expect((error as FactuareaError).status).toBe(status);
    });
  }

  it("exposes .code and .type on every error", async () => {
    server.use(
      http.get(`${BASE_URL}/account`, () => HttpResponse.json(envelope("not_found_error", "resource_not_found"), { status: 404 })),
    );
    const error = (await testClient().account.show().catch((e) => e)) as FactuareaError;
    expect(error.code).toBe("resource_not_found");
    expect(error.type).toBe("not_found_error");
  });

  it("ValidationError exposes per-field messages from param", async () => {
    server.use(
      http.post(`${BASE_URL}/clients`, () =>
        HttpResponse.json(
          { error: { type: "invalid_request_error", code: "parameter_invalid", param: "tax_id", message: "NIF inválido", request_id: "r1" } },
          { status: 422 },
        ),
      ),
    );
    const error = (await testClient().clients.create({}).catch((e) => e)) as ValidationError;
    expect(error).toBeInstanceOf(ValidationError);
    expect(error.fields).toEqual({ tax_id: ["NIF inválido"] });
  });

  it("ValidationError exposes a fields map when present", async () => {
    server.use(
      http.post(`${BASE_URL}/clients`, () =>
        HttpResponse.json(
          { error: { type: "invalid_request_error", code: "validation_failed", message: "Invalid", fields: { name: ["Required"], email: ["Bad format"] } } },
          { status: 422 },
        ),
      ),
    );
    const error = (await testClient().clients.create({}).catch((e) => e)) as ValidationError;
    expect(error.fields.name).toEqual(["Required"]);
    expect(error.fields.email).toEqual(["Bad format"]);
  });

  it("RateLimitError exposes retryAfter and requestId", async () => {
    server.use(
      http.get(`${BASE_URL}/account`, () =>
        HttpResponse.json(envelope("rate_limit_error", "rate_limited"), {
          status: 429,
          headers: { "Retry-After": "12", "X-Request-Id": "req_header" },
        }),
      ),
    );
    const error = (await testClient().account.show().catch((e) => e)) as RateLimitError;
    expect(error).toBeInstanceOf(RateLimitError);
    expect(error.retryAfter).toBe(12);
  });

  it("falls back to X-Request-Id header when the body omits request_id", async () => {
    server.use(
      http.get(`${BASE_URL}/account`, () =>
        HttpResponse.json(
          { error: { type: "not_found_error", code: "missing" } },
          { status: 404, headers: { "X-Request-Id": "req_from_header" } },
        ),
      ),
    );
    const error = (await testClient().account.show().catch((e) => e)) as FactuareaError;
    expect(error.requestId).toBe("req_from_header");
  });

  it("raises ConnectionError on network failure", async () => {
    server.use(http.get(`${BASE_URL}/account`, () => HttpResponse.error()));
    const error = await testClient({ maxRetries: 0 }).account.show().catch((e) => e);
    expect(error).toBeInstanceOf(ConnectionError);
  });

  it("never leaks the API key in error messages", async () => {
    server.use(
      http.post(`${BASE_URL}/clients`, () =>
        HttpResponse.json(envelope("invalid_request_error", "parameter_invalid"), { status: 422 }),
      ),
    );
    const error = (await testClient({ apiKey: "fact_test_supersecret" }).clients.create({}).catch((e) => e)) as Error;
    expect(JSON.stringify({ message: error.message, stack: error.stack })).not.toContain("supersecret");
  });
});
