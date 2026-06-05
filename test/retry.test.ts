import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { BASE_URL, server, testClient, useMockServer } from "./helpers.js";
import { computeDelayMs, DEFAULT_RETRY_OPTIONS, isRetryableStatus } from "../src/core/retry.js";
import { RateLimitError, ValidationError } from "../src/index.js";

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
      http.get(`${BASE_URL}/account`, () => {
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
      http.get(`${BASE_URL}/account`, () => {
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
      http.post(`${BASE_URL}/clients`, () => {
        calls += 1;
        return HttpResponse.json(
          { error: { type: "invalid_request_error", code: "parameter_invalid", param: "name", message: "Required" } },
          { status: 422 },
        );
      }),
    );

    await expect(testClient({ maxRetries: 3 }).clients.create({})).rejects.toBeInstanceOf(ValidationError);
    expect(calls).toBe(1);
  });

  it("surfaces RateLimitError with retryAfter when retries are exhausted", async () => {
    server.use(
      http.get(`${BASE_URL}/account`, () =>
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
