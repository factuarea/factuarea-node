// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.0.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class CompaniesResource extends BaseResource {
  /** Activate several managed companies */
  async activateBatch(account: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/accounts/{account}/companies/activate", { "account": account });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Activate a managed company */
  async activate(account: string, company: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/accounts/{account}/companies/{company}/activate", { "account": account, "company": company });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Deactivate a managed company */
  async deactivate(account: string, company: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/accounts/{account}/companies/{company}/deactivate", { "account": account, "company": company });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Archive a managed company */
  async delete(account: string, company: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/accounts/{account}/companies/{company}", { "account": account, "company": company });
    return this._send<unknown>("DELETE", path, undefined, config);
  }

  /** Retrieve a managed company */
  async show(account: string, company: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/accounts/{account}/companies/{company}", { "account": account, "company": company });
    return this._get<unknown>(path, undefined, config);
  }

  /** Update a managed company */
  async update(account: string, company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/accounts/{account}/companies/{company}", { "account": account, "company": company });
    return this._send<unknown>("PATCH", path, body, config);
  }

  /** Retrieve the creation status of a managed company */
  async creationStatus(account: string, company: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/accounts/{account}/companies/{company}/creation-status", { "account": account, "company": company });
    return this._get<unknown>(path, undefined, config);
  }

  /** Check whether a portfolio NIF can issue */
  async issuingReadiness(account: string, company: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/accounts/{account}/companies/{company}/issuing-readiness", { "account": account, "company": company });
    return this._get<unknown>(path, undefined, config);
  }

  /** Preview the seat charge of adding a company */
  async seatChargePreview(account: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/accounts/{account}/companies/seat-charge-preview", { "account": account });
    return this._get<unknown>(path, params, config);
  }

  /** List your managed companies */
  async list(account: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/accounts/{account}/companies", { "account": account });
    return this._paginate<unknown>(path, params, "cursor", config);
  }

  /** Create a managed company */
  async create(account: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/accounts/{account}/companies", { "account": account });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Verify the creation of a managed company */
  async verifyCreation(account: string, company: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/accounts/{account}/companies/{company}/verify-creation", { "account": account, "company": company });
    return this._send<unknown>("POST", path, undefined, config);
  }
}
