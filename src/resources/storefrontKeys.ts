// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.0.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class StorefrontKeysResource extends BaseResource {
  /** Create a publishable storefront key */
  async create(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/storefront-keys", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** List publishable storefront keys */
  async list(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/storefront-keys", { "company": company });
    return this._paginate<unknown>(path, params, "starting_after");
  }

  /** List assignable storefront key scopes */
  async scopes(company: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/storefront-keys/scopes", { "company": company });
    return this._get<unknown>(path, undefined, config);
  }

  /** Revoke a publishable storefront key */
  async revoke(company: string, storefrontKey: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/storefront-keys/{storefront_key}/revoke", { "company": company, "storefront_key": storefrontKey });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Rotate a storefront key secret */
  async rotateSecret(company: string, storefrontKey: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/storefront-keys/{storefront_key}/rotate-secret", { "company": company, "storefront_key": storefrontKey });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Retrieve a publishable storefront key */
  async show(company: string, storefrontKey: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/storefront-keys/{storefront_key}", { "company": company, "storefront_key": storefrontKey });
    return this._get<unknown>(path, undefined, config);
  }

  /** Update a publishable storefront key */
  async update(company: string, storefrontKey: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/storefront-keys/{storefront_key}", { "company": company, "storefront_key": storefrontKey });
    return this._send<unknown>("PATCH", path, body, config);
  }
}
