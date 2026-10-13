/**
 * Auth strategies.
 *
 * The public surface accepts an API key or an explicit native OAuth bearer.
 * A token provider supplies the current token once per logical request. Each strategy contributes the `Authorization`
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

/** Native OAuth access token. API keys must use ApiKeyAuth. */
export class BearerAuth implements AuthStrategy {
  readonly #token: string;

  constructor(token: string) {
    this.#token = oauthAccessToken(token);
  }

  headers(): Record<string, string> {
    return { Authorization: `Bearer ${this.#token}` };
  }
}

/**
 * Dynamic OAuth access-token provider. The
 * provider is invoked per request, allowing token rotation without
 * reconstructing the client.
 */
export class TokenProviderAuth implements AuthStrategy {
  readonly #provider: () => Promise<string> | string;

  constructor(provider: () => Promise<string> | string) {
    this.#provider = provider;
  }

  async headers(): Promise<Record<string, string>> {
    const token = oauthAccessToken(await this.#provider());
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

/** Validates the actual OAuth credential without treating an API key as OAuth. */
export function oauthAccessToken(token: string): string {
  if (typeof token !== "string" || !/^[\x21-\x7e]+$/.test(token) || token.startsWith("fact_test_") || token.startsWith("fact_live_")) {
    throw new TypeError("Factuarea: a native OAuth access token is required.");
  }
  return token;
}
