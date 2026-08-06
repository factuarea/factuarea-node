// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.0.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class AccountApiKeysResource extends BaseResource {
  /** Create an API key */
  async create(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/account/api-keys";
    return this._send<unknown>("POST", path, body, config);
  }

  /** List your API keys */
  async list(config?: RequestConfig): Promise<unknown> {
    const path = "/account/api-keys";
    return this._get<unknown>(path, undefined, config);
  }

  /** Revoke an API key */
  async revoke(apiKey: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/account/api-keys/{api_key}/revoke", { "api_key": apiKey });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Rotate an API key secret */
  async rotateSecret(apiKey: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/account/api-keys/{api_key}/rotate_secret", { "api_key": apiKey });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Retrieve an API key */
  async show(apiKey: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/account/api-keys/{api_key}", { "api_key": apiKey });
    return this._get<unknown>(path, undefined, config);
  }
}

export class AccountPersonalizationResource extends BaseResource {
  /** List available personalization templates */
  async templates(config?: RequestConfig): Promise<unknown> {
    const path = "/account/personalization/templates";
    return this._get<unknown>(path, undefined, config);
  }

  /** Update account personalization */
  async update(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/account/personalization";
    return this._send<unknown>("PATCH", path, body, config);
  }
}

export class AccountResource extends BaseResource {
  readonly apiKeys: AccountApiKeysResource;
  readonly personalization: AccountPersonalizationResource;

  constructor(client: HttpClient) {
    super(client);
    this.apiKeys = new AccountApiKeysResource(client);
    this.personalization = new AccountPersonalizationResource(client);
  }

  /** Retrieve account details */
  async show(config?: RequestConfig): Promise<unknown> {
    const path = "/account";
    return this._get<unknown>(path, undefined, config);
  }

  /** Retrieve account billing details */
  async billing(config?: RequestConfig): Promise<unknown> {
    const path = "/account/billing";
    return this._get<unknown>(path, undefined, config);
  }

  /** Verify account against the AEAT census */
  async verifyCensus(config?: RequestConfig): Promise<unknown> {
    const path = "/account/census-verification";
    return this._send<unknown>("POST", path, undefined, config);
  }
}
