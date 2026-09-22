import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll } from "vitest";
import { Factuarea } from "../src/index.js";

export const BASE_URL = "https://api.factuarea.test/v1";

/**
 * Company axis of the v1 contract: every company resource hangs off
 * `/v1/companies/{company}/…`, so the identifier is the first argument of every
 * company-scoped resource method instead of something the credential resolves
 * in silence.
 */
export const COMPANY = "01931b3e-7c4a-7f2e-9a8b-3c5d6e7f8a01";

/** Base URL of a company-scoped resource, e.g. `${COMPANY_URL}/invoices`. */
export const COMPANY_URL = `${BASE_URL}/companies/${COMPANY}`;

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
