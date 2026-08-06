// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.0.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class CompaniesApiKeysResource extends BaseResource {
  /** Create a child API key */
  async create(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/api-keys", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** List child API keys */
  async list(company: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/api-keys", { "company": company });
    return this._get<unknown>(path, undefined, config);
  }

  /** Revoke a child API key */
  async revoke(company: string, apiKey: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/api-keys/{api_key}", { "company": company, "api_key": apiKey });
    return this._delete<unknown>(path, params, config);
  }

  /** Retrieve a child API key */
  async show(company: string, apiKey: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/api-keys/{api_key}", { "company": company, "api_key": apiKey });
    return this._get<unknown>(path, undefined, config);
  }

  /** Rotate a child API key secret */
  async rotateSecret(company: string, apiKey: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/api-keys/{api_key}/rotate-secret", { "company": company, "api_key": apiKey });
    return this._send<unknown>("POST", path, undefined, config);
  }
}

export class CompaniesResource extends BaseResource {
  readonly apiKeys: CompaniesApiKeysResource;

  constructor(client: HttpClient) {
    super(client);
    this.apiKeys = new CompaniesApiKeysResource(client);
  }

  /** Activate several managed companies */
  async activateBatch(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/companies/activate";
    return this._send<unknown>("POST", path, body, config);
  }

  /** Activate a managed company */
  async activate(company: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/activate", { "company": company });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Create a managed company */
  async create(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/companies";
    return this._send<unknown>("POST", path, body, config);
  }

  /** List your managed companies */
  async list(params?: Record<string, unknown>, config?: RequestConfig): Promise<unknown> {
    const path = "/companies";
    return this._get<unknown>(path, params, config);
  }

  /** Deactivate a managed company */
  async deactivate(company: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/deactivate", { "company": company });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Archive a managed company */
  async delete(company: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}", { "company": company });
    return this._send<unknown>("DELETE", path, undefined, config);
  }

  /** Retrieve a managed company */
  async show(company: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}", { "company": company });
    return this._get<unknown>(path, undefined, config);
  }

  /** Update a managed company */
  async update(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}", { "company": company });
    return this._send<unknown>("PATCH", path, body, config);
  }

  /** Retrieve the creation status of a managed company */
  async creationStatus(company: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/creation-status", { "company": company });
    return this._get<unknown>(path, undefined, config);
  }

  /** Preview the seat charge of adding a company */
  async seatChargePreview(params?: Record<string, unknown>, config?: RequestConfig): Promise<unknown> {
    const path = "/companies/seat-charge-preview";
    return this._get<unknown>(path, params, config);
  }

  /** Verify the creation of a managed company */
  async verifyCreation(company: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/verify-creation", { "company": company });
    return this._send<unknown>("POST", path, undefined, config);
  }
}
