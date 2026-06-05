/**
 * Retry policy: exponential backoff + full jitter, honouring `Retry-After`.
 *
 * Retries only on 429, 5xx and network errors — never on other 4xx (a 422 is
 * a deterministic client error and must surface immediately). The same logical
 * request reuses its `Idempotency-Key` across attempts (handled by the
 * HttpClient), so retries are safe.
 */

export interface RetryOptions {
  /** Max retry attempts after the first try. Default 2. */
  maxRetries: number;
  /** Base delay in ms for the exponential schedule. Default 500. */
  baseDelayMs: number;
  /** Cap on any single delay in ms. Default 8000. */
  maxDelayMs: number;
}

export const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 2,
  baseDelayMs: 500,
  maxDelayMs: 8000,
};

/** HTTP status codes that are safe (and worth) retrying. */
export function isRetryableStatus(status: number): boolean {
  return status === 429 || (status >= 500 && status <= 599);
}

/**
 * Computes the delay (ms) before the next attempt.
 *
 * @param attempt   0-based index of the retry about to be scheduled.
 * @param retryAfterSeconds  parsed `Retry-After`, if the server sent one.
 * @param random    injectable RNG for deterministic tests (default Math.random).
 */
export function computeDelayMs(
  attempt: number,
  options: RetryOptions,
  retryAfterSeconds?: number,
  random: () => number = Math.random,
): number {
  if (retryAfterSeconds !== undefined) {
    // The server told us exactly how long to wait — respect it.
    return Math.min(retryAfterSeconds * 1000, options.maxDelayMs * 4);
  }
  const exponential = options.baseDelayMs * 2 ** attempt;
  const capped = Math.min(exponential, options.maxDelayMs);
  // Full jitter: a random value in [0, capped].
  return Math.round(capped * random());
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
