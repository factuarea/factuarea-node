import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll } from "vitest";
import { Factuarea } from "../src/index.js";

export const BASE_URL = "https://api.factuarea.test/v1";

export const server = setupServer();

/** Wire MSW into Vitest lifecycle. Call once per test file. */
export function useMockServer(): void {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());
}

/** Builds a client pointed at the mock base URL. Retries disabled by default. */
export function testClient(overrides: Partial<ConstructorParameters<typeof Factuarea>[0]> = {}): Factuarea {
  return new Factuarea({
    apiKey: "fact_test_secret",
    baseUrl: BASE_URL,
    maxRetries: 0,
    timeout: 2000,
    ...overrides,
  });
}
