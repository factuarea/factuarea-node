import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { BASE_URL, COMPANY, COMPANY_URL, server, testClient, useMockServer } from "./helpers.js";
import { computeDelayMs, DEFAULT_RETRY_OPTIONS, isRetryableStatus } from "../src/core/retry.js";
import { ConflictError, ConnectionError, RateLimitError, ServerError, ValidationError } from "../src/index.js";

useMockServer();

describe("retry policy (unit)", () => {
  it("marks 429 and 5xx as retryable, not other 4xx", () => {
    expect(isRetryableStatus(429)).toBe(true);
    expect(isRetryableStatus(500)).toBe(true);
    expect(isRetryableStatus(503)).toBe(true);
    expect(isRetryableStatus(422)).toBe(false);
    expect(isRetryableStatus(404)).toBe(false);
    expect(isRetryableStatus(200)).toBe(false);
  });

  it("honours Retry-After over the backoff schedule", () => {
    const delay = computeDelayMs(0, DEFAULT_RETRY_OPTIONS, 3);
    expect(delay).toBe(3000);
  });

  it("applies full jitter within the capped exponential window", () => {
    // attempt 1 -> base*2 = 1000ms cap; jitter scales it by random()
    const delay = computeDelayMs(1, DEFAULT_RETRY_OPTIONS, undefined, () => 0.5);
    expect(delay).toBe(500);
    const max = computeDelayMs(1, DEFAULT_RETRY_OPTIONS, undefined, () => 1);
    expect(max).toBe(1000);
  });
});

describe("retry behaviour (integration via MSW)", () => {
  it("retries a 429 respecting Retry-After, then succeeds", async () => {
    let calls = 0;
    server.use(
      http.get(`${BASE_URL}/me`, () => {
        calls += 1;
        if (calls === 1) {
          return HttpResponse.json(
            { error: { type: "rate_limit_error", code: "rate_limited" } },
            { status: 429, headers: { "Retry-After": "0" } },
          );
        }
        return HttpResponse.json({ object: "account" });
      }),
    );

    const result = await testClient({ maxRetries: 2 }).account.show();
    expect(calls).toBe(2);
    expect(result).toEqual({ object: "account" });
  });

  it("retries 5xx up to maxRetries then throws", async () => {
    let calls = 0;
    server.use(
      http.get(`${BASE_URL}/me`, () => {
        calls += 1;
        return HttpResponse.json({ error: { type: "api_error", code: "boom" } }, { status: 500 });
      }),
    );

    await expect(testClient({ maxRetries: 2 }).account.show()).rejects.toThrow();
    expect(calls).toBe(3); // initial + 2 retries
  });

  it("does NOT retry a 422 and throws ValidationError immediately", async () => {
    let calls = 0;
    server.use(
      http.post(`${COMPANY_URL}/contacts`, () => {
        calls += 1;
        return HttpResponse.json(
          { error: { type: "invalid_request_error", code: "parameter_invalid", param: "name", message: "Required" } },
          { status: 422 },
        );
      }),
    );

    await expect(testClient({ maxRetries: 3 }).contacts.create(COMPANY, {} as never)).rejects.toBeInstanceOf(ValidationError);
    expect(calls).toBe(1);
  });

  it("surfaces RateLimitError with retryAfter when retries are exhausted", async () => {
    server.use(
      http.get(`${BASE_URL}/me`, () =>
        HttpResponse.json(
          { error: { type: "rate_limit_error", code: "rate_limited" } },
          { status: 429, headers: { "Retry-After": "7" } },
        ),
      ),
    );

    const error = await testClient({ maxRetries: 0 }).account.show().catch((e) => e);
    expect(error).toBeInstanceOf(RateLimitError);
    expect((error as RateLimitError).retryAfter).toBe(7);
  });
});

describe("operations that reach a third party", () => {
  it("does not retry a FACe submission on 502 even with retries enabled", async () => {
    let calls = 0;
    server.use(
      http.post(`${COMPANY_URL}/invoices/inv-1/face-submissions`, () => {
        calls += 1;
        return HttpResponse.json({ error: { type: "api_error", code: "face_unavailable" } }, { status: 502 });
      }),
    );
    await expect(testClient({ maxRetries: 3 }).invoices.faceSubmissions.submit(COMPANY, "inv-1")).rejects.toBeInstanceOf(ServerError);
    expect(calls).toBe(1);
  });

  it("does not retry a FACe submission after a connection failure", async () => {
    let calls = 0;
    server.use(
      http.post(`${COMPANY_URL}/invoices/inv-1/face-submissions`, () => {
        calls += 1;
        return HttpResponse.error();
      }),
    );
    await expect(testClient({ maxRetries: 3 }).invoices.faceSubmissions.submit(COMPANY, "inv-1")).rejects.toBeInstanceOf(ConnectionError);
    expect(calls).toBe(1);
  });

  it("does not retry the cancellation of a FACe submission", async () => {
    let calls = 0;
    server.use(
      http.post(`${COMPANY_URL}/face-submissions/sub-1/cancel`, () => {
        calls += 1;
        return HttpResponse.json({ error: { type: "api_error", code: "face_unavailable" } }, { status: 503 });
      }),
    );
    await expect(testClient({ maxRetries: 3 }).faceSubmissions.cancel(COMPANY, "sub-1")).rejects.toBeInstanceOf(ServerError);
    expect(calls).toBe(1);
  });

  it("still retries a read on 502 (the opt-out is per operation)", async () => {
    let calls = 0;
    server.use(
      http.get(`${COMPANY_URL}/face-submissions/sub-1`, () => {
        calls += 1;
        return calls === 1
          ? HttpResponse.json({ error: { type: "api_error" } }, { status: 502, headers: { "Retry-After": "0" } })
          : HttpResponse.json({ data: { id: "sub-1" } });
      }),
    );
    await testClient({ maxRetries: 1 }).faceSubmissions.show(COMPANY, "sub-1");
    expect(calls).toBe(2);
  });

  it("does not retry an uncertain 409", async () => {
    let calls = 0;
    server.use(
      http.post(`${COMPANY_URL}/invoices/inv-1/send`, () => {
        calls += 1;
        return HttpResponse.json({ error: { type: "conflict_error", code: "send_outcome_uncertain" } }, { status: 409 });
      }),
    );
    await expect(testClient({ maxRetries: 3 }).invoices.send(COMPANY, "inv-1", {})).rejects.toBeInstanceOf(ConflictError);
    expect(calls).toBe(1);
  });
});

describe("Retry-After", () => {
  it("is honoured for 429 and 503 but capped at four times the maximum backoff", () => {
    expect(computeDelayMs(0, DEFAULT_RETRY_OPTIONS, 2)).toBe(2000);
    expect(computeDelayMs(0, DEFAULT_RETRY_OPTIONS, 60)).toBe(DEFAULT_RETRY_OPTIONS.maxDelayMs * 4);
    expect(isRetryableStatus(503)).toBe(true);
  });

  it("retries a 503 once after its Retry-After and replays the same Idempotency-Key", async () => {
    const keys: Array<string | null> = [];
    server.use(
      http.post(`${COMPANY_URL}/invoices/inv-1/send`, ({ request }) => {
        keys.push(request.headers.get("idempotency-key"));
        return keys.length === 1
          ? HttpResponse.json({ error: { type: "service_unavailable_error" } }, { status: 503, headers: { "Retry-After": "0" } })
          : HttpResponse.json({ data: {} });
      }),
    );
    await testClient({ maxRetries: 1 }).invoices.send(COMPANY, "inv-1", {}, { idempotencyKey: "mail-1" });
    expect(keys).toEqual(["mail-1", "mail-1"]);
  });
});
