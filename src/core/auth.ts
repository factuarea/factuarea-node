/**
 * Auth strategies.
 *
 * The public surface only exposes `apiKey` (design D8). Internally the auth
 * layer is a pluggable strategy so OAuth / token providers can be added later
 * without a breaking change. Each strategy contributes the `Authorization`
 * header (and possibly others) for a request.
 */
export interface AuthStrategy {
  /** Returns the auth headers to merge into a request. May be async. */
  headers(): Promise<Record<string, string>> | Record<string, string>;
}

/** Static API key sent as `Authorization: Bearer <key>`. */
export class ApiKeyAuth implements AuthStrategy {
  readonly #apiKey: string;

  constructor(apiKey: string) {
    this.#apiKey = apiKey;
  }

  headers(): Record<string, string> {
    return { Authorization: `Bearer ${this.#apiKey}` };
  }
}

/** Static bearer token (reserved for future OAuth access tokens). */
export class BearerAuth implements AuthStrategy {
  readonly #token: string;

  constructor(token: string) {
    this.#token = token;
  }

  headers(): Record<string, string> {
    return { Authorization: `Bearer ${this.#token}` };
  }
}

/**
 * Dynamic token provider (reserved for future OAuth refresh flows). The
 * provider is invoked per request, allowing token rotation without
 * reconstructing the client.
 */
export class TokenProviderAuth implements AuthStrategy {
  readonly #provider: () => Promise<string> | string;

  constructor(provider: () => Promise<string> | string) {
    this.#provider = provider;
  }

  async headers(): Promise<Record<string, string>> {
    const token = await this.#provider();
    return { Authorization: `Bearer ${token}` };
  }
}

/**
 * Detects the environment a key targets from its prefix. The backend is the
 * source of truth (the prefix routes to the sandbox or live company); this is
 * a convenience for the SDK consumer and logs.
 */
export type Environment = "test" | "live" | "unknown";

export function environmentFromApiKey(apiKey: string): Environment {
  if (apiKey.startsWith("fact_test_")) {
    return "test";
  }
  if (apiKey.startsWith("fact_live_")) {
    return "live";
  }
  return "unknown";
}
