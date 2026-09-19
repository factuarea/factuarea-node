import { HttpClient, type FactuareaConfig } from "./core/http-client.js";
import type { Environment } from "./core/auth.js";
import { Webhooks } from "./core/webhooks.js";
import { createResources, type ResourceNamespaces } from "./resources/index.js";

/**
 * Every namespace the generated registry builds is a field of the client.
 *
 * Declaration merging, and not a hand-written list of fields, because the list
 * is exactly what broke: `createResources()` has always built one namespace per
 * resource file, while this class enumerated its fields by hand and had drifted
 * to 17 of 62 — measured 2026-09-18 — so `factuarea.salesOrders.list(...)` and
 * the other 44 namespaces existed in the resource layer and were unreachable
 * from `new Factuarea(...)`. Neither `tsc --noEmit` nor `tsup` sees that: a
 * field nobody declared is simply a field nobody can use.
 *
 * Extending the registry's own interface makes the drift impossible instead of
 * merely caught: regenerating `src/resources/` with a new resource adds it to
 * `ResourceNamespaces`, and the client gains it in the same commit, in types
 * and at runtime. `Readonly` keeps the namespaces non-reassignable, as the
 * enumerated fields were.
 */
export interface Factuarea extends Readonly<ResourceNamespaces> {}

/**
 * The Factuarea API client.
 *
 * ```ts
 * import { Factuarea } from "@factuarea/sdk";
 *
 * const factuarea = new Factuarea({ apiKey: process.env.FACTUAREA_API_KEY! });
 * const invoice = await factuarea.invoices.create({ ... });
 * ```
 *
 * The environment (sandbox vs production) is selected by the key prefix
 * (`fact_test_` / `fact_live_`); no environment flag is needed.
 *
 * This client is for SERVERS. Its API key is a secret bound to the company and
 * must never be shipped to a browser; the anonymous shopper lane has its own
 * browser client with a publishable credential in `@factuarea/sdk/storefront`.
 */
export class Factuarea {
  /** The environment derived from the API key prefix. */
  readonly environment: Environment;

  /** Webhook signature verification (stateless). */
  readonly webhooks: Webhooks;

  /** The underlying HTTP client (advanced / escape hatch). */
  readonly http: HttpClient;

  constructor(config: FactuareaConfig) {
    this.http = new HttpClient(config);
    this.environment = this.http.environment;
    this.webhooks = new Webhooks();

    // Wires every namespace the registry builds — all of them, always.
    Object.assign(this, createResources(this.http));
  }
}
